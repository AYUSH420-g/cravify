import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext();
const API_URL = `${API_BASE_URL}/auth`;

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

        if (email === 'user@test.com' && password === '123456') {
            const token = 'mock-token-customer';
            const user = { id: '2', name: 'Test User', email: 'user@test.com', role: 'customer' };
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true, user };
        }

        if (email === 'vendor@cravify.com' && password === '123456') {
            const token = 'mock-token-restaurant_partner';
            const user = { id: '3', name: 'La Pino\'z Pizza', email: 'vendor@cravify.com', role: 'restaurant_partner' };
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true, user };
        }

        if (email === 'driver@cravify.com' && password === '123456') {
            const token = 'mock-token-delivery_partner';
            const user = { id: '4', name: 'Demo Driver', email: 'driver@cravify.com', role: 'delivery_partner' };
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true, user };
        }

        // Fallback for any other user to demonstrate
        const fallbackToken = 'mock-token-customer';
        const fallbackUser = { id: Date.now().toString(), name: email.split('@')[0], email: email, role: 'customer' };
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        setToken(fallbackToken);
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
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
