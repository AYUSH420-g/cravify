import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { ChevronLeft, TrendingUp, Calendar, Wallet, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDeliveryStats, formatRideTime } from '../utils/deliveryState';

const DeliveryEarnings = () => {
    const [timeframe, setTimeframe] = useState('weekly'); // daily, weekly, monthly
    const stats = getDeliveryStats();
    
    // Dynamically calculate mock UI values using the current total persistent state
    const displayTotal = stats.totalEarnings + stats.todaysEarnings;
    const displayDeliveries = stats.totalDeliveries + stats.ordersCount;
    const displayTips = stats.totalTips + (stats.ordersCount * 12); // Simulate random tip accrual
    const displayRideMinutes = stats.totalRideTimeMinutes + stats.rideTimeMinutes;


    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                        <Link to="/delivery/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Earnings & Payouts</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Total Earning Card */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                        <p className="opacity-90 mb-1">Total Earnings (This Week)</p>
                        <h2 className="text-4xl font-bold mb-4">₹{displayTotal.toFixed(2)}</h2>
                        <div className="flex gap-4 text-sm bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <div>
                                <p className="opacity-80">Orders</p>
                                <p className="font-bold">{displayDeliveries}</p>
                            </div>
                            <div className="w-px bg-white/30"></div>
                            <div>
                                <p className="opacity-80">Tips</p>
                                <p className="font-bold">₹{displayTips}</p>
                            </div>
                            <div className="w-px bg-white/30"></div>
                            <div>
                                <p className="opacity-80">Login Hrs</p>
                                <p className="font-bold">{formatRideTime(displayRideMinutes)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Incentives Banner */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                            <Award className="text-orange-600" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-800">Complete 8 more orders</h4>
                            <p className="text-sm text-orange-600">Get ₹200 extra bonus today! Ends in 4 hours.</p>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <h3 className="font-bold text-lg mb-4">Earnings Breakdown</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Base Order Pay</span>
                            <span className="font-medium">₹3,800.00</span>
                        </div>
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Distance Bonus</span>
                            <span className="font-medium">₹500.00</span>
                        </div>
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Surge Pay</span>
                            <span className="font-medium">₹250.00</span>
                        </div>
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Tips</span>
                            <span className="font-medium">₹450.00</span>
                        </div>
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                            <span>Weekly Incentive</span>
                            <span className="font-medium">₹500.00</span>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-between items-center font-bold text-lg">
                            <span>Total Payout</span>
                            <span>₹5,500.00</span>
                        </div>
                        <div className="p-4 flex gap-2 text-xs text-gray-500 bg-gray-50">
                            <AlertTriangle size={14} /> Tax deduction (TDS) of ₹259.50 applied.
                        </div>
                    </div>

                    {/* Past Deliveries */}
                    <h3 className="font-bold text-lg mb-4">Past Deliveries (Today)</h3>
                    <div className="space-y-4">
                        {stats.pastDeliveries && stats.pastDeliveries.length > 0 ? (
                            stats.pastDeliveries.map((delivery, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-fadeIn">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark">{delivery.restaurant}</h4>
                                            <p className="text-xs text-gray-500">Order {delivery.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-dark">₹{delivery.earnings.toFixed(2)}</p>
                                        <p className="text-xs text-green-600">{delivery.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400">
                                <p>No deliveries completed today yet.</p>
                                <p className="text-xs mt-1">Accept an order from the Dashboard to start earning!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default DeliveryEarnings;
