import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
    try {
        const response = await apiLogin(credentials);

        console.log("API Response:", response.data);

        if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            return { success: true };
        }

        return {
            success: false,
            message: response.data.message
        };
    } catch (error) {
        console.error("Login Error:", error);

        return {
            success: false,
            message: error.response?.data?.message || error.message
        };
    }
};

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
