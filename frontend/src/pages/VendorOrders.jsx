import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/Button';

const VendorOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedOrderToReject, setSelectedOrderToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('Out of stock');

    useEffect(() => {
        fetchOrders();
        // Auto-refresh every 15 seconds to stay in sync
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/vendor/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch vendor orders', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus, reason = null) => {
        try {
            const body = { status: newStatus };
            if (reason) body.rejectionReason = reason;

            const res = await fetch(`/api/vendor/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            
            if (res.ok) {
                // Use functional update to avoid stale closure bug
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, rejectionReason: reason } : o));
            } else {
                const errData = await res.json();
                alert(`Failed: ${errData.message || 'Unknown error'}`);
                // Refetch to resync UI with database
                fetchOrders();
            }
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Network error updating order status');
        }
    };

    const handleAccept = (id) => {
        updateStatus(id, 'Preparing');
    };

    const confirmReject = () => {
        if (!selectedOrderToReject) return;
        updateStatus(selectedOrderToReject, 'Rejected', rejectionReason);
        setIsRejectModalOpen(false);
        setSelectedOrderToReject(null);
        setRejectionReason('Out of stock');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-gray-100 text-gray-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'Preparing': return 'bg-blue-100 text-blue-700';
            case 'ReadyForPickup': return 'bg-yellow-100 text-yellow-700';
            case 'OutForDelivery': return 'bg-purple-100 text-purple-700';
            case 'Placed': return 'bg-orange-100 text-orange-700 animate-pulse';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-dark mb-8">Order Management</h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-500">
                            No orders yet.
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Order ID</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Date/Time</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Customer</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Items</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Amount</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                                            <th className="p-4 text-sm font-semibold text-gray-500 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50">
                                                <td className="p-4 font-bold text-primary text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    {new Date(order.createdAt).toLocaleString(undefined, { 
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                    })}
                                                </td>
                                                <td className="p-4 text-dark font-medium">{order.user?.name || 'Unknown'}</td>
                                                <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate">
                                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                </td>
                                                <td className="p-4 font-bold">₹{order.totalAmount.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${getStatusStyle(order.status)}`}>
                                                        {order.status === 'OutForDelivery' ? 'In Transit' : 
                                                         order.status === 'ReadyForPickup' ? 'Ready' : 
                                                         order.status}
                                                    </span>
                                                    {order.status === 'Rejected' && order.rejectionReason && (
                                                        <p className="text-xs text-red-500 mt-1 truncate max-w-[120px]" title={order.rejectionReason}>
                                                            {order.rejectionReason}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-4 flex gap-2 justify-center">
                                                    {order.status === 'Placed' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleAccept(order._id)}
                                                                className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded flex items-center gap-1 text-sm font-bold transition-colors"
                                                            >
                                                                <CheckCircle size={14} /> Accept
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedOrderToReject(order._id);
                                                                    setIsRejectModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded flex items-center gap-1 text-sm font-bold transition-colors"
                                                            >
                                                                <XCircle size={14} /> Reject
                                                            </button>
                                                        </>
                                                    ) : order.status === 'Preparing' ? (
                                                         <button 
                                                            onClick={() => updateStatus(order._id, 'ReadyForPickup')}
                                                            className="px-3 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded text-sm font-bold transition-colors border border-yellow-200"
                                                        >
                                                            Mark Ready
                                                        </button>
                                                    ) : order.status === 'ReadyForPickup' ? (
                                                        <span className="text-gray-400 text-xs font-medium italic">Waiting for Rider...</span>
                                                    ) : (
                                                        <span className="text-gray-300 text-sm font-medium">None</span>
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

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold text-dark mb-2">Reject Order</h3>
                        <p className="text-gray-500 text-sm mb-4">Please provide a reason for cancelling this order.</p>
                        
                        <select 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-6"
                        >
                            <option value="Out of stock">Items out of stock</option>
                            <option value="Too busy">Restaurant is too busy</option>
                            <option value="Closing soon">Closing soon</option>
                            <option value="Cannot deliver">Cannot prepare specific instructions</option>
                        </select>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                className="flex-1" 
                                onClick={() => {
                                    setIsRejectModalOpen(false);
                                    setSelectedOrderToReject(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                                onClick={confirmReject}
                            >
                                Confirm Reject
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default VendorOrders;
