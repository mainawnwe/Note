import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    UserPlus,
    Image as ImageIcon,
    FileText,
    ArrowRight,
    Camera,
    X
} from 'lucide-react';

function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        bio: '',
        profilePicture: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isFocused, setIsFocused] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
        firstName: false,
        lastName: false,
        bio: false
    });
    const [previewImage, setPreviewImage] = useState(null);

    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profilePicture') {
            const file = files[0];
            setFormData(prev => ({ ...prev, profilePicture: file }));

            // Create preview
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewImage(null);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, profilePicture: null }));
        setPreviewImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('first_name', formData.firstName);
            formDataToSend.append('last_name', formData.lastName);
            formDataToSend.append('bio', formData.bio);
            if (formData.profilePicture) {
                formDataToSend.append('profile_picture', formData.profilePicture);
            }

            await signup(formDataToSend);
            navigate('/login');
        } catch (err) {
            console.error('Signup error:', err);
            setError(
                err.response?.data?.error ||
                err.message ||
                'Signup failed. Please check your details and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setIsFocused(prev => ({ ...prev, [field]: false }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682257-2f9c37a3a7f3?auto=format&fit=crop&q=80&w=2070')] opacity-5 bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10"></div>
            </div>

            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-teal-300 opacity-20 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-cyan-300 opacity-20 blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-blue-300 opacity-20 blur-xl"></div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Header */}
                    <div className="pt-10 pb-6 px-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 mb-4">
                            <UserPlus className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">Join us today and get started</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 pb-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="firstName">
                                        First Name
                                    </label>
                                    <div className={`relative rounded-xl transition-all duration-300 ${isFocused.firstName ? 'ring-2 ring-teal-500' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('firstName')}
                                            onBlur={() => handleBlur('firstName')}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                            placeholder="John"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="lastName">
                                        Last Name
                                    </label>
                                    <div className={`relative rounded-xl transition-all duration-300 ${isFocused.lastName ? 'ring-2 ring-teal-500' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('lastName')}
                                            onBlur={() => handleBlur('lastName')}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                            placeholder="Doe"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="username">
                                        Username*
                                    </label>
                                    <div className={`relative rounded-xl transition-all duration-300 ${isFocused.username ? 'ring-2 ring-teal-500' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('username')}
                                            onBlur={() => handleBlur('username')}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                            placeholder="johndoe"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                                        Email*
                                    </label>
                                    <div className={`relative rounded-xl transition-all duration-300 ${isFocused.email ? 'ring-2 ring-teal-500' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('email')}
                                            onBlur={() => handleBlur('email')}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                            placeholder="name@company.com"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
                                        Password*
                                    </label>
                                    <div className={`relative rounded-xl transition-all duration-300 ${isFocused.password ? 'ring-2 ring-teal-500' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={() => handleBlur('password')}
                                            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                            placeholder="••••••••••"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="confirmPassword">
                                        Confirm Password*
                                    </label>
                                    <div className={`relative rounded-xl transition-all duration-300 ${isFocused.confirmPassword ? 'ring-2 ring-teal-500' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('confirmPassword')}
                                            onBlur={() => handleBlur('confirmPassword')}
                                            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                            placeholder="••••••••••"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={loading}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <Eye className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="bio">
                                    Bio
                                </label>
                                <div className={`relative rounded-xl transition-all duration-300 ${isFocused.bio ? 'ring-2 ring-teal-500' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 pt-3 pointer-events-none">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('bio')}
                                        onBlur={() => handleBlur('bio')}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white resize-none"
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="profilePicture">
                                    Profile Picture
                                </label>
                                <div className="flex items-center space-x-4">
                                    {previewImage ? (
                                        <div className="relative">
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-20 h-20 rounded-full object-cover border-2 border-teal-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                                                disabled={loading}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                                            <Camera className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className={`relative rounded-xl transition-all duration-300 ${isFocused.profilePicture ? 'ring-2 ring-teal-500' : ''}`}>
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="file"
                                                id="profilePicture"
                                                name="profilePicture"
                                                accept="image/*"
                                                onChange={handleChange}
                                                onFocus={() => handleFocus('profilePicture')}
                                                onBlur={() => handleBlur('profilePicture')}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center ${loading
                                        ? 'bg-teal-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V8a6 6 0 00-12 0v4z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-teal-600 hover:text-teal-800 font-semibold inline-flex items-center transition-colors"
                                    disabled={loading}
                                >
                                    Log In
                                    <ArrowRight className="ml-1 w-4 h-4" />
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>© 2023 Your Company. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Signup;