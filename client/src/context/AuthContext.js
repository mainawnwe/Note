import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clear token and user on mount to force login page for testing
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);

        /*
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
                    userData.profile_picture = userData.profile_picture.replace('/api/lib/uploads/', '/uploads/');
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
        */
    }, []);

    const login = async (credentials) => {
        const response = await axios.post('http://localhost:8000/auth/login.php', credentials);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
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
            const response = await axios.post('http://localhost:8000/auth/signup.php', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Signup error response:', error.response);
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
