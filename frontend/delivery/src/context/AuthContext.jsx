import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Validate token and get user
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async (authToken) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'x-auth-token': authToken }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
            }
        } catch (err) {
            console.error('Auth fetch failed', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
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
            return { success: false, message: 'Network error' };
        }
    };

    const register = async (name, email, password, role = 'delivery_partner') => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'delivery_partner' })
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
            return { success: false, message: 'Network error' };
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
