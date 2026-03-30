import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { ChevronLeft, TrendingUp, Calendar, Wallet, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeliveryEarnings = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [recentTasks, setRecentTasks] = useState([]);

    useEffect(() => {
        if (token) {
            fetchProfileAndHistory();
        }
    }, [token]);

    const fetchProfileAndHistory = async () => {
        try {
            const [profRes, histRes] = await Promise.all([
                fetch('http://localhost:5003/api/delivery/profile', { headers: { 'x-auth-token': token } }),
                fetch('http://localhost:5003/api/delivery/history', { headers: { 'x-auth-token': token } })
            ]);

            if (profRes.ok) setProfile(await profRes.json());
            if (histRes.ok) {
                const history = await histRes.json();
                setRecentTasks(history.slice(0, 3)); // Only recent 3
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Earnings & Payouts</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Total Earning Card */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                        <p className="opacity-90 mb-1">Lifetime Earnings</p>
                        <h2 className="text-4xl font-bold mb-4">₹{profile?.totalEarnings || 0}</h2>
                        <div className="flex gap-4 text-sm bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <div>
                                <p className="opacity-80">Total Orders</p>
                                <p className="font-bold">{profile?.totalDeliveries || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Incentives Banner */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                            <Award className="text-orange-600" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-800">Complete 5 more orders</h4>
                            <p className="text-sm text-orange-600">Get ₹150 extra bonus today! Ends in 8 hours.</p>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <h3 className="font-bold text-lg mb-4">Earnings Breakdown</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Base Earnings</span>
                            <span className="font-medium">₹{profile?.totalEarnings || 0}</span>
                        </div>
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Bonuses</span>
                            <span className="font-medium">₹0</span>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-between items-center font-bold text-lg">
                            <span>Total Payout</span>
                            <span>₹{profile?.totalEarnings || 0}</span>
                        </div>
                    </div>

                    {/* Recent Payouts / Orders */}
                    <h3 className="font-bold text-lg mb-4">Recent Delivered Orders</h3>
                    <div className="space-y-4">
                        {recentTasks.length === 0 ? (
                            <p className="text-gray-500 text-center">No recent deliveries.</p>
                        ) : (
                            recentTasks.map((task, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark">Order #{task.order?.toString().slice(-6).toUpperCase()}</h4>
                                            <p className="text-xs text-gray-500">Credited directly</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-dark">₹{task.earnings}</p>
                                        <p className="text-xs text-green-600">{new Date(task.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default DeliveryEarnings;
