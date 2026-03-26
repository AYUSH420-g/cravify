import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DeliveryHistory = () => {
    const { token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        if (token) {
            fetchHistory();
        }
    }, [token]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/delivery/history', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
                const total = data.reduce((sum, task) => sum + (task.earnings || 0), 0);
                setTotalEarnings(total);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-dark mb-6">Earnings & History</h1>

                    <div className="bg-dark text-white p-6 rounded-2xl mb-8 flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Total Earnings (History)</p>
                            <h2 className="text-4xl font-bold">₹{totalEarnings}</h2>
                        </div>
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-gray-500 text-center py-4">Loading history...</p>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
                                <Search className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500">No delivery history found.</p>
                            </div>
                        ) : (
                            history.map((task, idx) => (
                                <div key={task._id || idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-dark">Order #{task.order?.toString().slice(-6).toUpperCase()}</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(task.updatedAt).toLocaleDateString()} • {task.order?.restaurant?.name || 'Restaurant'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${task.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}`}>
                                            {task.status === 'cancelled' ? '₹0' : `+₹${task.earnings}`}
                                        </p>
                                        <p className={`text-xs ${task.status === 'cancelled' ? 'text-red-400' : 'text-gray-400'}`}>
                                            {task.status === 'cancelled' ? 'Cancelled' : 'Paid'}
                                        </p>
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

export default DeliveryHistory;
