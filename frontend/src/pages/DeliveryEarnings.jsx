import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, ArrowUpRight, Briefcase, Calendar, Loader2, TrendingUp, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DeliveryEarnings = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await fetch('/api/delivery/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const d = await res.json();
                    setData(d);
                }
            } catch (err) {
                console.error('Failed to fetch earnings', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchEarnings();
    }, [token]);

    const earnings = data?.earnings || data?.totalEarnings || 0;
    const deliveriesCount = data?.deliveriesCount || 0;
    const todayEarnings = data?.todayEarnings || 0;
    const todayDeliveries = data?.todayDeliveries || 0;
    const avgEarning = data?.avgEarning || 0;
    const walletBalance = data?.walletBalance || 0;
    const history = data?.history || [];

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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 opacity-5">
                                        <DollarSign size={100} />
                                    </div>
                                    <h3 className="text-gray-500 font-medium mb-2 text-sm">Total Earnings</h3>
                                    <span className="text-3xl font-black text-dark">₹{earnings}</span>
                                    <div className="mt-3 flex items-center gap-1 text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded">
                                        <ArrowUpRight size={14} /> Lifetime
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-gray-500 font-medium mb-2 text-sm">Today's Earnings</h3>
                                    <span className="text-3xl font-bold text-green-600">₹{todayEarnings}</span>
                                    <p className="text-xs text-gray-400 mt-2">{todayDeliveries} deliveries today</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-gray-500 font-medium text-sm">Deliveries Done</h3>
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Briefcase size={20} />
                                        </div>
                                    </div>
                                    <span className="text-3xl font-bold text-dark mt-2 block">{deliveriesCount}</span>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-gray-500 font-medium text-sm">Avg per Delivery</h3>
                                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                    <span className="text-3xl font-bold text-dark mt-2 block">₹{avgEarning}</span>
                                </div>
                            </div>

                            {/* Wallet */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl mb-8 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Wallet Balance</p>
                                    <h2 className="text-3xl font-bold mt-1">₹{walletBalance}</h2>
                                </div>
                                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                                    <DollarSign size={28} />
                                </div>
                            </div>

                            {/* Delivery History */}
                            <h2 className="text-xl font-bold text-dark mb-4">Delivery History</h2>
                            {history.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                    <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No deliveries completed yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map(order => (
                                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                                    <ArrowUpRight size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-dark text-sm">{order.restaurant?.name || 'Restaurant'}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                        {order.distanceKm > 0 && <span className="flex items-center gap-1"><MapPin size={10} /> {order.distanceKm} km</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-green-600">+₹{order.deliveryEarning || 0}</span>
                                                <p className="text-xs text-gray-400">Order ₹{order.totalAmount}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default DeliveryEarnings;
