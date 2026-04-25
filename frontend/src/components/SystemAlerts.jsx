import React from 'react';
import { AlertTriangle, Hammer, Info, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const GlobalBroadcastBanner = () => {
    const { settings } = useSettings();
    const [visible, setVisible] = React.useState(true);

    if (!settings.globalBroadcastMessage || !visible) return null;

    return (
        <div className="bg-primary text-white py-2 px-4 relative flex items-center justify-center animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 text-sm font-medium pr-8">
                <Info size={16} className="shrink-0" />
                <span>{settings.globalBroadcastMessage}</span>
            </div>
            <button 
                onClick={() => setVisible(false)}
                className="absolute right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close banner"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export const MaintenanceOverlay = () => {
    const { settings, loading } = useSettings();
    const { user } = useAuth();

    // If maintenance is off, or we are still loading, or user is an admin, show nothing
    if (loading || !settings.maintenanceMode || (user && user.role === 'admin')) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary animate-pulse">
                <Hammer size={48} />
            </div>
            <h1 className="text-4xl font-bold text-dark mb-4">Under Maintenance</h1>
            <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
                {settings.globalBroadcastMessage || "We're currently performing some scheduled maintenance to improve your experience. We'll be back online shortly!"}
            </p>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold py-3 px-6 bg-primary/5 rounded-full border border-primary/20">
                    <AlertTriangle size={20} />
                    <span>Estimated downtime: 30-60 mins</span>
                </div>
                <p className="text-sm text-gray-400">
                    Need help? Contact <a href={`mailto:${settings.supportEmail}`} className="text-primary hover:underline font-medium">{settings.supportEmail}</a>
                </p>
            </div>
            
            {/* Minimal background branding */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
                <p className="text-xl font-bold italic tracking-tighter text-primary">CRAVIFY</p>
            </div>
        </div>
    );
};
