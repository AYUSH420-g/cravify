import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveOrderPopup from '../components/LiveOrderPopup';
import { useSocket } from '../context/SocketContext';
import { Bell, X, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';
import Button from '../components/Button';

const MainLayout = ({ children }) => {
    const socket = useSocket();
    const [alert, setAlert] = useState(null);
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        // Fetch initial public settings (maintenance mode status)
        fetch('/api/admin/settings/public')
            .then(res => res.json())
            .then(data => {
                if (data.maintenanceMode) setIsMaintenance(true);
            })
            .catch(err => console.error('Failed to fetch public settings', err));
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleBroadcast = (data) => {
            setAlert(data.message);
            // Auto-hide alert after 10 seconds
            setTimeout(() => setAlert(null), 10000);
        };

        const handleMaintenance = (data) => {
            setIsMaintenance(data.enabled);
        };

        socket.on('global_broadcast', handleBroadcast);
        socket.on('maintenance_update', handleMaintenance);

        return () => {
            socket.off('global_broadcast', handleBroadcast);
            socket.off('maintenance_update', handleMaintenance);
        };
    }, [socket]);

    if (isMaintenance) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <SettingsIcon size={48} className="text-primary" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 italic tracking-tight">WE'LL BE BACK SOON!</h1>
                <p className="text-gray-400 max-w-md mb-8">
                    Cravify is currently under maintenance to bring you a better experience. 
                    We are upgrading our servers. Please check back in a few minutes!
                </p>
                <div className="flex gap-4">
                    <Button variant="primary" onClick={() => window.location.reload()}>Refresh Page</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            
            {/* Global Broadcast Alert */}
            {alert && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg">
                    <div className="bg-dark text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-top duration-500">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                            <Bell className="text-primary animate-ring" size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Announcement</h4>
                            <p className="text-sm font-medium">{alert}</p>
                        </div>
                        <button onClick={() => setAlert(null)} className="text-gray-500 hover:text-white transition-colors p-1">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-grow">
                {children}
            </main>
            <LiveOrderPopup />
            <Footer />

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes ring {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-15deg); }
                    30% { transform: rotate(10deg); }
                    40% { transform: rotate(-10deg); }
                    50% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }
                .animate-ring {
                    animation: ring 2s ease infinite;
                }
            `}} />
        </div>
    );
};

export default MainLayout;
