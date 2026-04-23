import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Package, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DeliveryHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/delivery/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.history || []);
                }
            } catch (err) {
                console.error('Failed to fetch delivery history', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchHistory();
    }, [token]);

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-dark mb-8">Completed Deliveries</h1>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-500">
                            You haven't completed any deliveries yet.
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-gray-500">Order ID</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500">Restaurant</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500">Date Completed</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                                        <th className="p-4 text-sm font-semibold text-gray-500 text-right">Earning</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {history.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50/50">
                                            <td className="p-4 font-bold text-primary text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="p-4 text-dark font-medium">{order.restaurant?.name || 'Unknown'}</td>
                                            <td className="p-4 text-gray-500 text-sm flex items-center gap-1">
                                                <Clock size={14} /> 
                                                {new Date(order.updatedAt).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 text-xs font-bold rounded uppercase bg-green-100 text-green-700">
                                                    Delivered
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-dark">
                                                ₹40.00
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default DeliveryHistory;
