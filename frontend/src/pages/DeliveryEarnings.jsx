import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, ArrowUpRight, ArrowDownRight, Briefcase, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DeliveryEarnings = () => {
    const { token } = useAuth();
    const [earningsData, setEarningsData] = useState({ earnings: 0, deliveriesCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await fetch('/api/delivery/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEarningsData({
                        earnings: data.earnings || 0,
                        deliveriesCount: data.deliveriesCount || 0
                    });
                }
            } catch (err) {
                console.error('Failed to fetch earnings', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchEarnings();
    }, [token]);

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-dark mb-8">Earnings Overview</h1>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5">
                                        <DollarSign size={100} />
                                    </div>
                                    <h3 className="text-gray-500 font-medium mb-2">Total Earnings</h3>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-dark">₹{earningsData.earnings.toFixed(2)}</span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded">
                                        <ArrowUpRight size={16} /> 100% Lifetime
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-gray-500 font-medium">Deliveries Done</h3>
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Briefcase size={20} />
                                        </div>
                                    </div>
                                    <span className="text-3xl font-bold text-dark mt-4">{earningsData.deliveriesCount}</span>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-gray-500 font-medium">Tips</h3>
                                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <DollarSign size={20} />
                                        </div>
                                    </div>
                                    <span className="text-3xl font-bold text-dark mt-4">₹0.00</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default DeliveryEarnings;
