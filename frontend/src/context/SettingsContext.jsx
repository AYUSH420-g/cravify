import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        globalBroadcastMessage: '',
        supportEmail: 'support@cravify.com'
    });
    const [loading, setLoading] = useState(true);

    const fetchPublicSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings/public'); 
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    maintenanceMode: data.maintenanceMode,
                    globalBroadcastMessage: data.globalBroadcastMessage,
                    supportEmail: data.supportEmail
                });
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicSettings();
        // Poll for settings every 5 minutes to catch maintenance toggles
        const interval = setInterval(fetchPublicSettings, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchPublicSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
