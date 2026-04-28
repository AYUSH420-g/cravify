import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Save, RefreshCw, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const AdminSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        platformFee: 5,
        referralBonus: 10,
        supportEmail: 'support@cravify.com',
        maintenanceMode: false,
        globalBroadcastMessage: '',
        autoApproveRestaurants: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    platformFee: data.platformFee || 0,
                    referralBonus: data.referralBonus || 0,
                    supportEmail: data.supportEmail || '',
                    maintenanceMode: data.maintenanceMode || false,
                    globalBroadcastMessage: data.globalBroadcastMessage || '',
                    autoApproveRestaurants: data.autoApproveRestaurants || false
                });
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({ 
            ...settings, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    platformFee: Number(settings.platformFee),
                    referralBonus: Number(settings.referralBonus),
                    supportEmail: settings.supportEmail,
                    maintenanceMode: settings.maintenanceMode,
                    globalBroadcastMessage: settings.globalBroadcastMessage,
                    autoApproveRestaurants: settings.autoApproveRestaurants
                })
            });
            if (res.ok) {
                setMessage('Settings Saved Successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to save settings.');
            }
        } catch (err) {
            console.error('Error saving settings', err);
            setMessage('Error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">System Settings</h1>
                    {message && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

                    {/* General Settings */}
                    <div>
                        <h3 className="text-xl font-bold text-dark mb-4">Financial Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (₹)</label>
                                <input
                                    type="number"
                                    name="platformFee"
                                    value={settings.platformFee}
                                    onChange={handleChange}
                                    placeholder="e.g., 5"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                                />
                                <p className="text-xs text-gray-500 mt-1">This is a flat fee charged per order.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Support Settings */}
                    <div>
                        <h3 className="text-xl font-bold text-dark mb-4">Support & Contact</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                            <input
                                type="email"
                                name="supportEmail"
                                value={settings.supportEmail}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* System Toggles */}
                    <div>
                        <h3 className="text-xl font-bold text-dark mb-4">System Toggles</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-dark">Maintenance Mode</p>
                                    <p className="text-sm text-gray-500">Disable customer access for maintenance.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-dark">Auto-Approve Restaurants</p>
                                    <p className="text-sm text-gray-500">Automatically approve new restaurant signups.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="autoApproveRestaurants"
                                        checked={settings.autoApproveRestaurants}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Global Broadcast Message (Alert Banner)</label>
                                <textarea
                                    name="globalBroadcastMessage"
                                    value={settings.globalBroadcastMessage}
                                    onChange={handleChange}
                                    placeholder="e.g., Heavy rain alert: Delivery might be delayed. Stay safe!"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary h-20 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">This message will appear as a banner at the top of the app for all users.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" className="flex items-center gap-2" onClick={fetchSettings} disabled={saving}>
                            <RefreshCw size={18} /> Revert
                        </Button>
                        <Button variant="primary" onClick={handleSave} className="flex items-center gap-2" disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminSettings;
