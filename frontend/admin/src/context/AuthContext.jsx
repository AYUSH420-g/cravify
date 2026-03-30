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

    // MOCK AUTH IMPLEMENTATION
    const fetchUser = async (authToken) => {
        // Simulate API delay
        setTimeout(() => {
            if (authToken === 'mock-admin-token') {
                setUser({ id: '1', name: 'Super Admin', email: 'admin@cravify.com', role: 'admin' });
            } else if (authToken.startsWith('mock-token-')) {
                // Retrieve stored user
                try {
                    const storedUser = localStorage.getItem('currentUser');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        // Fallback default
                        setUser({ id: '2', name: 'Test User', email: 'user@test.com', role: 'customer' });
                    }
                } catch (e) {
                    console.error("Failed to parse user", e);
                    setUser(null);
                }
            } else {
                setLoading(false);
            }
            setLoading(false);
        }, 500);
    };

    const login = async (email, password) => {
        // Mock Login Logic
        if (email === 'admin@cravify.com' && password === 'admin123') {
            const token = 'mock-admin-token';
            const user = { id: '1', name: 'Super Admin', email: 'admin@cravify.com', role: 'admin' };
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return { success: true, user };
        }

        // Dynamic Login for registered mock users
        try {
            const storedUser = localStorage.getItem('mockUser'); // Keep checking mockUser for the just-signed-up user fallback
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (email === user.email && password === 'password') {
                    const token = `mock-token-${user.role}`;
                    localStorage.setItem('token', token);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    setToken(token);
                    setUser(user);
                    return { success: true, user };
                }
            }
        } catch (e) {
            console.error("Failed to parse mock user during login", e);
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
        // Mock Register
        const token = `mock-token-${role}`;
        const user = { id: Date.now().toString(), name, email, role };

        // Store mock user so we can login with them later
        localStorage.setItem('mockUser', JSON.stringify(user));
        // Also set as current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', token);

        setToken(token);
        setUser(user);
        return { success: true, user };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
