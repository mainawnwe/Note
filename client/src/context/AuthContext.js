import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('AuthContext: token from localStorage:', token);
        if (token) {
            axios.get('http://localhost:8000/auth/profile.php', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                console.log('AuthContext: profile response:', response.data);
                const userData = response.data;
            if (userData.profile_picture) {
                // Fix profile_picture path to match actual uploads URL
                if (!userData.profile_picture.startsWith('/uploads/')) {
                    userData.profile_picture = '/uploads/' + userData.profile_picture;
                }
            }
                setUser(userData);
            })
            .catch((error) => {
                console.error('AuthContext: profile fetch error:', error);
                localStorage.removeItem('token');
            })
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        // Rename email field to identifier for backend compatibility
        const payload = {
            identifier: credentials.email,
            password: credentials.password
        };
        const response = await axios.post('http://localhost:8000/auth/login.php', payload);
        localStorage.setItem('token', response.data.token);

        // Fetch full profile after login to ensure user data is complete
        try {
            const profileResponse = await axios.get('http://localhost:8000/auth/profile.php', {
                headers: { Authorization: `Bearer ${response.data.token}` }
            });
            const userData = profileResponse.data;
            if (userData.profile_picture) {
                if (!userData.profile_picture.startsWith('/uploads/')) {
                    userData.profile_picture = '/uploads/' + userData.profile_picture;
                }
            }
            setUser(userData);
        } catch (error) {
            console.error('AuthContext: profile fetch error after login:', error);
            const fallbackUser = { ...response.data.user };
            // Map camelCase to snake_case if needed
            if (fallbackUser.profilePicture && !fallbackUser.profile_picture) {
                fallbackUser.profile_picture = fallbackUser.profilePicture;
            }
            // Normalize profile_picture to '/uploads/<filename>' if it's a bare filename or '/uploads/...'
            if (fallbackUser.profile_picture) {
                const cleaned = String(fallbackUser.profile_picture).replace(/^\/?uploads\//, '');
                if (!cleaned.startsWith('http')) {
                    fallbackUser.profile_picture = '/uploads/' + cleaned;
                } else {
                    fallbackUser.profile_picture = cleaned;
                }
            }
            setUser(fallbackUser); // fallback to user from login response (normalized)
        }
    };

    const signup = async (userData) => {
        let formData;
        if (userData instanceof FormData) {
            formData = userData;
        } else {
            formData = new FormData();
            for (const key in userData) {
                formData.append(key, userData[key]);
            }
        }
        try {
            const response = await fetch('http://localhost:8000/auth/signup.php', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Signup failed');
            }
            return await response.json();
        } catch (error) {
            console.error('Signup error response:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
