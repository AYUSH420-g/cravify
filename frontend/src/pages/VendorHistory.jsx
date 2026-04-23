import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { Loader2, Search, Calendar, Filter } from 'lucide-react';

const VendorHistory = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/vendor/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Only show completed/cancelled orders in history
                const historyData = data.filter(o => ['Delivered', 'Cancelled', 'Rejected'].includes(o.status));
                setOrders(historyData);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-gray-100 text-gray-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}>★</span>
                ))}
            </div>
        );
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h1 className="text-2xl font-bold text-dark">Order History</h1>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search by ID or Customer..." 
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl">
                                <Filter size={18} className="text-gray-400" />
                                <select 
                                    className="focus:outline-none text-sm font-medium bg-transparent"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-500">
                            No past orders found matching your criteria.
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Order ID</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Date</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Customer</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Items</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Amount</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Customer Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50">
                                                <td className="p-4 font-bold text-primary text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-[10px] ml-5">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-dark font-medium">{order.user?.name || 'Unknown'}</td>
                                                <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate">
                                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                </td>
                                                <td className="p-4 font-bold">₹{order.totalAmount.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${getStatusStyle(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {order.restaurantRating ? (
                                                        <div className="flex flex-col gap-1">
                                                            {renderStars(order.restaurantRating)}
                                                            {order.ratingComment && (
                                                                <p className="text-[11px] text-gray-400 italic max-w-[150px] line-clamp-2">
                                                                    "{order.ratingComment}"
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">No feedback</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default VendorHistory;
