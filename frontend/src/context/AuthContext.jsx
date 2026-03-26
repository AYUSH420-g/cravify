import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5005/api/auth';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async (authToken) => {
        try {
            const res = await fetch(`${API_URL}/me`, {
                headers: { 'x-auth-token': authToken }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                // Token invalid — clear it
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, message: 'Network error. Is the backend running?' };
        }
    };

    const register = async (name, email, password, role = 'customer') => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, message: 'Network error. Is the backend running?' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
