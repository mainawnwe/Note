import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState({ email: false, password: false });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579546929518-9b39f7f6f644?auto=format&fit=crop&q=80&w=2070')] opacity-5 bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
            </div>

            {/* Floating Shapes */}
            <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-purple-300 opacity-20 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-indigo-300 opacity-20 blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-pink-300 opacity-20 blur-xl"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Header */}
                    <div className="pt-10 pb-6 px-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to continue to your account</p>
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                                    Email or Username
                                </label>
                                <div className={`relative rounded-xl transition-all duration-300 ${isFocused.email ? 'ring-2 ring-purple-500' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => handleFocus('email')}
                                        onBlur={() => handleBlur('email')}
                                        autoComplete="username"
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                        placeholder="Email or username"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
                                    Password
                                </label>
                                <div className={`relative rounded-xl transition-all duration-300 ${isFocused.password ? 'ring-2 ring-purple-500' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={() => handleBlur('password')}
                                        className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none transition text-gray-900 bg-white"
                                        placeholder="•••••••••"
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                        disabled={loading}
                                    />
                                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                                    disabled={loading}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center ${loading
                                        ? 'bg-purple-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-0V8a6 6 0 00-12 0v4z"></path>
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Log In
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-purple-600 hover:text-purple-800 font-semibold inline-flex items-center transition-colors"
                                    disabled={loading}
                                >
                                    Sign Up
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

export default Login;