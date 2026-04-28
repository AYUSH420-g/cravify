import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API_URL = '/api/auth';

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
            const data = await res.json();
            
            if (res.ok) {
                setUser(data);
            } else {
                logout(); // invalid token
            }
        } catch (e) {
            console.error('Failed to fetch user', e);
            logout();
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
                sessionStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (e) {
            console.error('Login error', e);
            return { success: false, message: 'Network error. Please make sure the backend is running.' };
        }
    };

    const googleLogin = async (credential) => {
        try {
            const res = await fetch(`${API_URL}/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            });
            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Google Login failed' };
            }
        } catch (e) {
            console.error('Google Login error', e);
            return { success: false, message: 'Network error. Please make sure the backend is running.' };
        }
    };

    const register = async (name, email, password, role = 'customer', referralCode = '') => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, referralCode })
            });
            const data = await res.json();

            if (res.ok) {
                // If the user gets auto-verified (customer), they get a token.
                if (data.token) {
                    sessionStorage.setItem('token', data.token);
                    setToken(data.token);
                    setUser(data.user);
                }
                return { success: true, user: data.user, message: data.message };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (e) {
            console.error('Register error', e);
            return { success: false, message: 'Network error. Please make sure the backend is running.' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            return { success: res.ok, message: data.message || 'Failed to send reset email' };
        } catch (e) {
            console.error('Forgot password error', e);
            return { success: false, message: 'Network error.' };
        }
    };

    const resetPasswordWithToken = async (token, password) => {
        try {
            const res = await fetch(`${API_URL}/reset-password/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            return { success: res.ok, message: data.message || 'Failed to reset password' };
        } catch (e) {
            console.error('Reset error', e);
            return { success: false, message: 'Network error.' };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, forgotPassword, resetPasswordWithToken, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
