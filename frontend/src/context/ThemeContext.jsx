import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('cravify-theme');
        return saved === 'dark';
    });

    // Sync with User Preference from DB on login
    useEffect(() => {
        if (user && user.theme) {
            setIsDarkMode(user.theme === 'dark');
        } else if (!token) {
            // Reset to light mode on logout
            setIsDarkMode(false);
            localStorage.removeItem('cravify-theme');
        }
    }, [user, token]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('cravify-theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('cravify-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        
        // If logged in, save to DB
        if (token) {
            try {
                await fetch('/api/auth/theme', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ theme: newMode ? 'dark' : 'light' })
                });
            } catch (e) {
                console.error('Failed to save theme preference', e);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setIsDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
