import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Phone, MessageSquare, MapPin, CheckCircle, Package, Loader2, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import RateFoodModal from '../components/RateFoodModal';

const OrderTracking = () => {
    const { token } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [riderLocation, setRiderLocation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const isChatOpenRef = useRef(false);
    const orderIdRef = useRef(null); // always fresh orderId for socket handlers

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    useEffect(() => {
        orderIdRef.current = order?._id || null;
    }, [order?._id]);

    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        fetchLatestActiveOrder();
        // Setup polling every 10 seconds to keep tracking updated
        const interval = setInterval(fetchLatestActiveOrder, 10000);
        return () => clearInterval(interval);
    }, []);

    // Register socket listeners once — handlers use refs so they never go stale
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            console.log('Customer received socket message:', message);
            const msgOrderId = (message?.order?._id || message?.order)?.toString();
            const currentOrderId = orderIdRef.current?.toString();
            
            console.log(`Checking match: Msg OrderID ${msgOrderId} vs Current OrderID ${currentOrderId}`);
            
            if (!currentOrderId || msgOrderId !== currentOrderId) {
                console.log('Order ID mismatch, ignoring message');
                return;
            }

            setMessages((prev) => {
                if (prev.find(m => m._id?.toString() === message._id?.toString())) {
                    console.log('Duplicate message ignored');
                    return prev;
                }
                if (!isChatOpenRef.current && message.senderRole !== 'customer') {
                    setUnreadCount(c => c + 1);
                }
                const newMessages = [...prev, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                console.log('Updated messages state:', newMessages.length);
                return newMessages;
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        };

        const handleLocationUpdate = (data) => {
            if (data.orderId === orderIdRef.current) setRiderLocation(data.location);
        };

        const handleStatusUpdate = (updatedOrder) => {
            if (updatedOrder?._id === orderIdRef.current) {
                setOrder(updatedOrder);
                if (updatedOrder.deliveryPartner?.lastKnownLocation) {
                    setRiderLocation(updatedOrder.deliveryPartner.lastKnownLocation);
                }
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('chat_message', handleReceiveMessage);
        socket.on('location_update', handleLocationUpdate);
        socket.on('order_status_updated', handleStatusUpdate);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('chat_message', handleReceiveMessage);
            socket.off('location_update', handleLocationUpdate);
            socket.off('order_status_updated', handleStatusUpdate);
        };
    }, [socket]); // socket only — all handlers use refs

    // Join room + rejoin on reconnect whenever order changes
    useEffect(() => {
        if (!order?._id || !socket) return;
        socket.emit('join_order_room', order._id);
        const handleReconnect = () => { socket.emit('join_order_room', order._id); fetchLatestActiveOrder(); };
        socket.on('connect', handleReconnect);
        return () => socket.off('connect', handleReconnect);
    }, [order?._id, socket]);

    // Load chat history whenever order changes
    useEffect(() => {
        if (!order?._id || !token) return;
        // Reset so stale messages from a previous order never linger
        setMessages([]);
        setUnreadCount(0);
        fetch(`/api/chat/${order._id}`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const sorted = (data.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    setMessages(sorted);
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            })
            .catch(err => console.error('Chat history load error:', err));
    }, [order?._id, token]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !order) return;

        const msgText = newMessage.trim();
        setNewMessage('');

        try {
            const res = await fetch(`/api/chat/${order._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    text: msgText,
                    senderRole: 'customer'
                })
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('Chat send failed:', data.message);
                setNewMessage(msgText);
            } else if (data.success && data.message) {
                // Optimistically/directly add to local state
                setMessages(prev => {
                    if (prev.find(m => m._id === data.message._id)) return prev;
                    return [...prev, data.message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) {
            console.error('Chat send error:', err);
            setNewMessage(msgText);
        }
    };

    const fetchLatestActiveOrder = async () => {
        try {
            const res = await fetch('/api/customer/orders/active', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setOrder(data || null);

                if (data?.deliveryPartner?.lastKnownLocation) {
                    setRiderLocation(data.deliveryPartner.lastKnownLocation);
                }
            }
        } catch (err) {
            console.error('Failed to fetch order', err);
        } finally {
            setLoading(false);
        }
    };

    const isDelivered = order?.status === 'Delivered';
    const isCancelled = order?.status === 'Cancelled';
    const isRejected = order?.status === 'Rejected';
    const isActive = !isDelivered && !isCancelled && !isRejected;

    // Auto-prompt review when order is delivered and unrated
    useEffect(() => {
        if (isDelivered && !order.restaurantRating && !showReviewModal) {
            const timer = setTimeout(() => setShowReviewModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isDelivered, order?.restaurantRating]);

    const handleSubmitReview = async (reviewData) => {
        try {
            const res = await fetch(`/api/customer/orders/${reviewData.orderId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    restaurantRating: reviewData.restaurantRating,
                    deliveryRating: reviewData.deliveryRating,
                    comment: reviewData.comment
                })
            });
            if (res.ok) {
                fetchLatestActiveOrder();
            }
        } catch (e) {
            console.error('Review submit error:', e);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-white py-16 flex flex-col items-center justify-center">
                    <Package size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-dark mb-2">No Active Orders</h2>
                    <p className="text-gray-500 mb-6 text-center max-w-sm">
                        You don't have any recent orders to track.
                    </p>
                    <Button onClick={() => navigate('/')} variant="primary">Browse Restaurants</Button>
                </div>
            </MainLayout>
        );
    }

    // Define steps
    const steps = [
        { key: 'Placed', label: 'Ordered', value: 1 },
        { key: 'Preparing', label: 'Preparing', value: 2 },
        { key: 'ReadyForPickup', label: 'Ready', value: 3 },
        { key: 'OutForDelivery', label: 'On Way', value: 4 },
        { key: 'Delivered', label: 'Delivered', value: 5 }
    ];

    // Get current progress value
    let progressValue = 1;
    if (order.status === 'Preparing') progressValue = 2;
    if (order.status === 'ReadyForPickup') progressValue = 3;
    if (order.status === 'OutForDelivery') progressValue = 4;
    if (order.status === 'Delivered') progressValue = 5;
    if (isCancelled || isRejected) progressValue = 0;

    const progressPercentage = Math.min(
        ((progressValue - 1) / (steps.length - 1)) * 100,
        100
    );

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Progress Bar Header */}
                <div className={`${isCancelled || isRejected ? 'bg-red-900' : 'bg-dark'} text-white py-12`}>
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {isCancelled ? 'Order Cancelled' :
                                isRejected ? 'Order Declined by Restaurant' :
                                    isDelivered ? 'Order Delivered Successfully' :
                                        `Arriving from ${order.restaurant?.name || 'Restaurant'}`}
                        </h1>
                        {isRejected && order.rejectionReason && (
                            <p className="text-red-200 text-sm mb-6">Reason: {order.rejectionReason}</p>
                        )}
                        {isCancelled && (
                            <p className="text-red-200 text-sm mb-6">Your order was cancelled by an admin.</p>
                        )}

                        {!(isCancelled || isRejected) && (
                            <div className="relative mt-12 mb-8">

                                {/* Base line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2"></div>

                                {/* Active line */}
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>

                                {/* Steps */}
                                <div className="flex justify-between items-center relative">
                                    {steps.map((step) => {
                                        const isCompleted = progressValue >= step.value;
                                        const isCurrent = progressValue === step.value && !isDelivered;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center relative z-10">

                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                                                    ${isCompleted
                                                            ? 'bg-green-500 text-white'
                                                            : isCurrent
                                                                ? 'bg-green-500 text-white border-4 border-dark animate-pulse'
                                                                : 'bg-gray-700 text-gray-400'
                                                        }`}
                                                >
                                                    {isCompleted ? <CheckCircle size={16} /> : step.value}
                                                </div>

                                                <span
                                                    className={`text-xs mt-2 whitespace-nowrap 
                                                    ${isCompleted || isCurrent
                                                            ? 'font-bold text-white'
                                                            : 'text-gray-400'
                                                        }`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Live Tracking Map */}
                    <div className="lg:col-span-2 bg-gray-100 rounded-3xl h-[500px] relative overflow-hidden shadow-inner border border-gray-200">
                        <MapComponent
                            riderLocation={riderLocation}
                            restaurantLocation={order.restaurant?.location}
                            customerLocation={order.deliveryLocation || order.user?.addresses?.[0]?.location}
                        />
                    </div>

                    {/* Details Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Delivery Partner */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark mb-4">Delivery Partner</h3>
                            {isActive && order.deliveryPartner ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-primary italic">
                                            {order.deliveryPartner.name?.charAt(0) || 'DP'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{order.deliveryPartner.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-gray-500 text-xs">On the way to you</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark hover:bg-gray-50" onClick={() => window.location.href = `tel:${order.deliveryPartner.phone}`}>
                                            <Phone size={18} /> Call
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 gap-2 border-gray-200 text-dark hover:bg-gray-50 relative"
                                            onClick={() => { setIsChatOpen(true); setUnreadCount(0); }}
                                        >
                                            <MessageSquare size={18} /> Chat
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white animate-pulse">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            ) : isActive && progressValue >= 2 ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-600">
                                            DP
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Assigning Partner...</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-xs">Waiting for rider acceptance</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 opacity-50 pointer-events-none">
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark"><Phone size={18} /> Call</Button>
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark"><MessageSquare size={18} /> Chat</Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 text-sm">
                                        {isDelivered ? 'Order has been delivered.' :
                                            isCancelled ? 'Order was cancelled.' :
                                                isRejected ? 'Order could not be prepared.' :
                                                    'Partner details will appear when order is dispatched.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark mb-4">Order Details</h3>
                            <p className="text-gray-500 text-sm mb-4">Order #{order._id.slice(-8).toUpperCase()}</p>
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-dark font-medium">{item.quantity} x {item.name}</span>
                                        <span className="text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-primary text-xl">₹{order.totalAmount?.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2 font-medium">Paid via {order.paymentMethod}</p>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-4 text-primary"
                                onClick={() => navigate('/help')}
                            >
                                Need Help?
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Drawer/Overlay Component */}
            {isChatOpen && (
                <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 rounded-t-2xl md:rounded-2xl bg-white shadow-2xl border border-gray-100 z-50 flex flex-col pt-2" style={{ height: '500px', maxHeight: '80vh' }}>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={20} className="text-primary" />
                            <h3 className="font-bold text-dark">Order Chat</h3>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.filter(msg => ['customer', 'delivery_partner'].includes(msg.senderRole)).map((msg) => {
                            const isMe = msg.senderRole === 'customer';
                            return (
                                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.senderRole?.replace('_partner', '')}</span>
                                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-100 text-dark rounded-bl-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 rounded-b-2xl flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-red-700 transition">
                            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                        </button>
                    </form>
                </div>
            )}

            {/* Review Modal — auto-opens on delivery */}
            <RateFoodModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleSubmitReview}
                order={order}
            />
        </MainLayout>
    );
};

export default OrderTracking;
