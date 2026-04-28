import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Loader2, CheckCircle, XCircle, MessageCircle, Send, X, User2 } from 'lucide-react';
import Button from '../components/Button';

const VendorOrders = () => {
    const { token, user } = useAuth();
    const socket = useSocket();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedOrderToReject, setSelectedOrderToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('Out of stock');
    const [chatOrder, setChatOrder] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatText, setChatText] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);
    const [activeTab, setActiveTab] = useState('live');

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (order) => {
            setOrders(prev => {
                if (prev.find(o => o._id === order._id)) return prev;
                return [order, ...prev];
            });
        };

        const handleStatusUpdate = (updatedOrder) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o));
        };

        socket.on('new_order', handleNewOrder);
        socket.on('order_status_updated', handleStatusUpdate);

        return () => {
            socket.off('new_order', handleNewOrder);
            socket.off('order_status_updated', handleStatusUpdate);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !chatOrder?._id) return;

        const joinRoom = () => {
            console.log('VENDOR: Emitting join_order_room for:', chatOrder._id);
            socket.emit('join_order_room', chatOrder._id);
        };

        joinRoom();

        // Re-join on every connect/reconnect
        socket.on('connect', joinRoom);
        if (socket.io) {
            socket.io.on('reconnect', joinRoom);
        }

        const handleReceiveMessage = (message) => {
            const messageOrderId = message?.order?._id || message?.order;
            if (messageOrderId?.toString() !== chatOrder._id) return;

            setChatMessages(prev => {
                if (prev.some(m => m._id === message._id)) return prev;
                return [...prev, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            });
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        };

        socket.on('chat_message', handleReceiveMessage);
        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('connect', joinRoom);
            if (socket.io) socket.io.off('reconnect', joinRoom);
            socket.off('chat_message', handleReceiveMessage);
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, chatOrder?._id]);

    const fetchChatMessages = async () => {
        if (!chatOrder?._id || !token) return;
        try {
            const res = await fetch(`/api/chat/${chatOrder._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setChatMessages(prev => {
                    const newMessages = [...prev];
                    let added = false;
                    (data.data || []).forEach(msg => {
                        if (!newMessages.some(m => m._id === msg._id)) {
                            newMessages.push(msg);
                            added = true;
                        }
                    });
                    if (!added) return prev;
                    return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) {
            console.error('Failed to fetch chat messages', err);
        }
    };

    useEffect(() => {
        if (!chatOrder?._id || !token) return;
        setChatMessages([]);
        fetchChatMessages();
    }, [chatOrder?._id, token]);

    // Polling fallback when chat is open
    useEffect(() => {
        let interval;
        if (chatOrder?._id) {
            interval = setInterval(fetchChatMessages, 3000);
        }
        return () => clearInterval(interval);
    }, [chatOrder?._id]);

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
    const liveOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status));
    const historyOrders = orders.filter(o => ['Delivered', 'Cancelled', 'Rejected'].includes(o.status));
    const displayedOrders = activeTab === 'live' ? liveOrders : historyOrders;

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}>★</span>
                ))}
            </div>
        );
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
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, rejectionReason: reason } : o));
            } else {
                const errData = await res.json();
                alert(`Failed: ${errData.message || 'Unknown error'}`);
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

    const openChat = (order) => {
        setChatOrder(order);
    };

    const closeChat = () => {
        setChatOrder(null);
        setChatMessages([]);
        setChatText('');
    };

    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatOrder || !chatText.trim() || !token) return;

        const text = chatText.trim();
        setChatText('');

        try {
            const res = await fetch(`/api/chat/${chatOrder._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    text,
                    senderRole: 'restaurant_partner'
                })
            });
            
            const data = await res.json();
            if (res.ok && data.success) {
                setChatMessages(prev => {
                    if (prev.find(m => m._id === data.message._id)) return prev;
                    return [...prev, data.message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) {
            console.error('Failed to send chat message via HTTP', err);
            setChatText(text);
        }
    };

    const roleLabel = (senderRole) => {
        switch (senderRole) {
            case 'customer': return 'Customer';
            case 'restaurant_partner': return 'Restaurant';
            case 'delivery_partner': return 'Delivery Partner';
            default: return 'Message';
        }
    };

    const isMyMessage = (message) => message?.senderRole === 'restaurant_partner';

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
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h1 className="text-2xl font-bold text-dark">Order Management</h1>
                        
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('live')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                            >
                                Live Orders ({liveOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                            >
                                History ({historyOrders.length})
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    ) : displayedOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-gray-500">
                            {activeTab === 'live' ? 'No live orders at the moment.' : 'No past orders found.'}
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
                                            {activeTab === 'history' && <th className="p-4 text-sm font-semibold text-gray-500">Rating</th>}
                                            <th className="p-4 text-sm font-semibold text-gray-500 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {displayedOrders.map((order) => (
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
                                                {activeTab === 'history' && (
                                                    <td className="p-4">
                                                        {order.restaurantRating ? (
                                                            <div className="flex flex-col gap-1">
                                                                {renderStars(order.restaurantRating)}
                                                                {order.ratingComment && (
                                                                    <p className="text-[10px] text-gray-400 italic truncate max-w-[100px]">
                                                                        "{order.ratingComment}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 text-xs">Not rated</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="p-4 flex gap-2 justify-center flex-wrap">
                                                    <button
                                                        onClick={() => openChat(order)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 text-sm font-bold transition-colors"
                                                    >
                                                        <MessageCircle size={14} /> Chat
                                                    </button>
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

            {chatOrder && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
                    <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Order Chat</p>
                                <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                                    <MessageCircle size={18} className="text-primary" />
                                    {chatOrder.user?.name || 'Customer'}
                                </h3>
                                <p className="text-sm text-gray-500">Order #{chatOrder._id.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={closeChat} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-gray-50 space-y-3 min-h-[320px]">
                            {chatLoading ? (
                                <div className="flex items-center justify-center py-16 text-gray-400">
                                    <Loader2 className="animate-spin mr-2" size={18} /> Loading chat...
                                </div>
                            ) : chatMessages.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    No messages yet. Start the conversation.
                                </div>
                            ) : chatMessages.map((message, index) => {
                                const mine = isMyMessage(message);
                                return (
                                    <div key={message._id || index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-gray-100 text-dark rounded-bl-md'}`}>
                                            <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-1 ${mine ? 'text-white/80' : 'text-gray-400'}`}>
                                                <User2 size={12} />
                                                {mine ? 'You' : roleLabel(message.senderRole)}
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={sendChatMessage} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                            <input
                                type="text"
                                value={chatText}
                                onChange={(e) => setChatText(e.target.value)}
                                placeholder="Message customer..."
                                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Button type="submit" className="px-4 py-2.5 rounded-full flex items-center gap-2" disabled={!chatText.trim()}>
                                <Send size={16} /> Send
                            </Button>
                        </form>
                    </div>
                </div>
            )}

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
