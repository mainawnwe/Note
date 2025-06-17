import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

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
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profilePicture') {
            setFormData(prev => ({ ...prev, profilePicture: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-400 via-red-500 to-yellow-500 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
                <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Create Account</h2>
                {error && <div className="mb-6 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>}
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="username">Username*</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="email">Email*</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="password">Password*</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="confirmPassword">Confirm Password*</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-300 transition bg-white text-gray-900"
                            rows="3"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-semibold" htmlFor="profilePicture">Profile Picture</label>
                        <input
                            type="file"
                            id="profilePicture"
                            name="profilePicture"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl text-white font-bold text-lg transition ${
                            loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-8 text-center text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-red-600 hover:underline font-semibold"
                        disabled={loading}
                    >
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Signup;
