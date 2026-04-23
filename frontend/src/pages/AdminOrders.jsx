import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, XCircle, Clock, Loader2, Package, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const res = await fetch(`/api/admin/orders/${id}/cancel`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === id ? { ...o, status: 'Cancelled' } : o));
                if (selectedOrder && selectedOrder._id === id) {
                    setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter(o =>
            o._id?.toLowerCase().includes(q) ||
            o.user?.name?.toLowerCase().includes(q) ||
            o.restaurant?.name?.toLowerCase().includes(q) ||
            o.status?.toLowerCase().includes(q)
        );
    }, [searchQuery, orders]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-600';
            case 'Cancelled': return 'bg-red-100 text-red-600';
            case 'Preparing': return 'bg-blue-100 text-blue-600';
            case 'OutForDelivery': return 'bg-purple-100 text-purple-600';
            case 'Placed': return 'bg-orange-100 text-orange-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = (s) => {
        if (s === 'OutForDelivery') return 'Out for Delivery';
        return s;
    };

    const timeAgo = (dateString) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
        const days = Math.floor(hrs / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark">Platform Orders</h1>
                        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, restaurant, status..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full md:w-80 bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No orders found</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                        <th className="p-4 font-semibold text-gray-600">Customer</th>
                                        <th className="p-4 font-semibold text-gray-600">Restaurant</th>
                                        <th className="p-4 font-semibold text-gray-600">Items</th>
                                        <th className="p-4 font-semibold text-gray-600">Amount</th>
                                        <th className="p-4 font-semibold text-gray-600">Status</th>
                                        <th className="p-4 font-semibold text-gray-600">Time</th>
                                        <th className="p-4 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(order => (
                                        <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium text-primary text-sm">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="p-4 text-dark">{order.user?.name || 'Unknown'}</td>
                                            <td className="p-4 text-dark">{order.restaurant?.name || 'Unknown'}</td>
                                            <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate">
                                                {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </td>
                                            <td className="p-4 font-medium">₹{order.totalAmount?.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} /> {timeAgo(order.createdAt)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {['Placed', 'Preparing'].includes(order.status) && (
                                                        <button
                                                            onClick={() => handleCancel(order._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Cancel Order"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                <h3 className="text-lg font-bold">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase">Customer</p>
                                        <p className="font-semibold">{selectedOrder.user?.name || 'N/A'}</p>
                                        <p className="text-xs text-gray-400">{selectedOrder.user?.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase">Restaurant</p>
                                        <p className="font-semibold">{selectedOrder.restaurant?.name || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase">Status</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(selectedOrder.status)}`}>
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase">Payment</p>
                                        <p className="font-semibold">{selectedOrder.paymentMethod}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-2">Items</p>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedOrder.deliveryAddress && (
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase mb-1">Delivery Address</p>
                                        <p className="text-sm font-medium">
                                            {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.zip}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-lg">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>

                            {['Placed', 'Preparing'].includes(selectedOrder.status) && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50">
                                    <button
                                        onClick={() => handleCancel(selectedOrder._id)}
                                        className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition cursor-pointer"
                                    >
                                        Cancel This Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminOrders;
