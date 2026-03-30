import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Eye, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await adminAPI.getOrders();
                setOrders(data);
            } catch (err) {
                console.error('Failed to fetch orders', err);
            }
        };
        if (token) fetchOrders();
    }, [token]);

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await adminAPI.cancelOrder(id);
                setOrders(orders.map(order =>
                    order._id === id ? { ...order, status: 'Cancelled' } : order
                ));
            } catch (err) {
                console.error('Failed to cancel order', err);
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase();
        return (
            (order.user?.name || '').toLowerCase().includes(term) ||
            (order.restaurant?.name || '').toLowerCase().includes(term) ||
            order._id.toLowerCase().includes(term)
        );
    });

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">Platform Orders</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                <th className="p-4 font-semibold text-gray-600">Customer</th>
                                <th className="p-4 font-semibold text-gray-600">Restaurant</th>
                                <th className="p-4 font-semibold text-gray-600">Amount</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Time</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-primary">#{order._id.slice(-6).toUpperCase()}</td>
                                    <td className="p-4 text-dark">{order.user?.name || 'Unknown User'}</td>
                                    <td className="p-4 text-dark">{order.restaurant?.name || 'Unknown Restaurant'}</td>
                                    <td className="p-4 font-medium">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${(order.status || '').toLowerCase() === 'delivered' ? 'bg-green-100 text-green-600' :
                                                (order.status || '').toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                    (order.status || '').toLowerCase() === 'preparing' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-orange-100 text-orange-600'}`}>
                                            {(order.status || 'Placed').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm flex items-center gap-1">
                                        <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        {['Placed', 'Preparing'].includes(order.status) && (
                                            <button
                                                onClick={() => handleCancel(order._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel Order"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminOrders;
