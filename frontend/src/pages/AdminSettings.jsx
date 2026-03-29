import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Save, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState({
        platformFee: 5,
        referralBonus: 10,
        supportEmail: '',
        maintenanceMode: false,
        autoApproveRestaurants: false
    });
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminAPI.getSettings();
                setSettings(data);
            } catch (err) {
                console.error('Failed to fetch settings', err);
            }
        };
        if (token) fetchSettings();
    }, [token]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings({ ...settings, [e.target.name]: value });
    };

    const handleSave = async () => {
        try {
            await adminAPI.updateSettings(settings);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            console.error('Failed to update settings', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-8">System Settings</h1>

                {saveStatus === 'success' && (
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 border border-green-200">
                        ✅ Settings saved successfully!
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 border border-red-200">
                        ❌ Failed to save settings. Please try again.
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

                    {/* General Settings */}
                    <div>
                        <h3 className="text-xl font-bold text-dark mb-4">Financial Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
                                <input
                                    type="number"
                                    name="platformFee"
                                    value={settings.platformFee}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Bonus Amount (₹)</label>
                                <input
                                    type="number"
                                    name="referralBonus"
                                    value={settings.referralBonus}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                                />
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
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" className="flex items-center gap-2">
                            <RefreshCw size={18} /> Reset
                        </Button>
                        <Button variant="primary" onClick={handleSave} className="flex items-center gap-2">
                            <Save size={18} /> Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminSettings;
