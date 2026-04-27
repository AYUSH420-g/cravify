import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, ShoppingBag, Star, Clock, Check, X, MessageCircle, Send } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-4 rounded-xl ${color} text-white`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-dark">{value}</h3>
        </div>
    </div>
);

const VendorDashboard = () => {
    const { token, user } = useAuth();
    const socket = useSocket();
    const currentUserId = user?.id || user?._id;
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ todayEarnings: 0, totalLiveOrders: 0, menuItemsCount: 0 });
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatOrder, setChatOrder] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatText, setChatText] = useState('');
    const [unreadOrders, setUnreadOrders] = useState(new Set());
    const [showEarningModal, setShowEarningModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [recentReviews, setRecentReviews] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const messagesEndRef = useRef(null);
    const chatOrderRef = useRef(null);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/vendor/dashboard', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setRestaurant(data.restaurant);
                setStats(data.stats);
                setOrders(data.liveOrders);
                setRecentReviews(data.recentReviews || []);
                setRecentTransactions(data.recentTransactions || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboard();
            const interval = setInterval(fetchDashboard, 15000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const toggleStatus = async () => {
        try {
            const res = await fetch('/api/vendor/status', {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setRestaurant({ ...restaurant, isOnline: data.isOnline });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Sync chatOrderRef
    useEffect(() => {
        chatOrderRef.current = chatOrder;
    }, [chatOrder]);

    // Join all live order rooms and listen for incoming messages globally
    useEffect(() => {
        if (!socket || orders.length === 0) return;

        orders.forEach(order => {
            socket.emit('join_order_room', order._id);
        });

        const handleGlobalMessage = (message) => {
            const msgOrderId = message?.order?._id || message?.order;
            if (!msgOrderId) return;
            const msgOrderIdStr = msgOrderId.toString();
            // If sender is not the restaurant and it's not the currently open chat, mark unread
            if (message.senderRole !== 'restaurant_partner' && chatOrderRef.current?._id !== msgOrderIdStr) {
                setUnreadOrders(prev => new Set([...prev, msgOrderIdStr]));
            }
        };

        socket.on('receive_message', handleGlobalMessage);
        return () => socket.off('receive_message', handleGlobalMessage);
    }, [socket, orders.length]);

    useEffect(() => {
        if (!chatOrder?._id || !socket) return;

        socket.emit('join_order_room', chatOrder._id);

        const handleReceiveMessage = (message) => {
            const messageOrderId = message?.order?._id || message?.order;
            if (messageOrderId?.toString() === chatOrder._id) {
                setChatMessages((prev) => {
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        };

        socket.on('chat_message', handleReceiveMessage);
        socket.on('receive_message', handleReceiveMessage);

        fetch(`/api/chat/${chatOrder._id}`, {
            headers: { 'x-auth-token': token }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setChatMessages(data.data || []);
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            })
            .catch((err) => console.error('Failed to load order chat', err));

        return () => {
            socket.off('chat_message', handleReceiveMessage);
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [chatOrder?._id, socket, token]);

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatText.trim() || !chatOrder) return;

        const msgText = chatText.trim();
        setChatText('');

        try {
            const res = await fetch(`/api/chat/${chatOrder._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    text: msgText,
                    senderRole: 'restaurant_partner'
                })
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('Chat send failed:', data.message);
                setChatText(msgText);
            }
        } catch (err) {
            console.error('Chat send error:', err);
            setChatText(msgText);
        }
    };

    const handleOrderAction = async (id, actionStatus, rejectionReason = null) => {
        try {
            const body = { status: actionStatus };
            if (rejectionReason) body.rejectionReason = rejectionReason;

            const res = await fetch(`/api/vendor/orders/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                // Use functional update to avoid stale closure
                setOrders(prev => {
                    if (['Cancelled', 'Rejected'].includes(actionStatus)) {
                        return prev.filter(o => o._id !== id);
                    }
                    return prev.map(order => order._id === id ? { ...order, status: actionStatus } : order);
                });
                fetchDashboard(); // Trigger a full stats refresh immediately
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.message || 'Failed to update'}`);
                fetchDashboard();
            }
        } catch (e) {
            console.error(e);
            alert('Network error updating order');
        }
    };

    const EarningDetailModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-green-600 p-8 text-white text-center relative">
                    <button onClick={() => setShowEarningModal(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">✕</button>
                    <p className="text-green-100 text-sm font-bold uppercase tracking-widest mb-2">Today's Net Earning</p>
                    <h2 className="text-5xl font-black italic">₹{stats.todayEarnings}</h2>
                </div>
                <div className="p-8">
                    <h3 className="font-bold text-dark mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-primary" /> Today's Delivered Orders
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentTransactions.length === 0 ? (
                            <p className="text-center py-8 text-gray-400 italic">No settled transactions for today yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentTransactions.map((tx, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-dark text-sm">Order #{tx._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Item Total</span>
                                                <span className="text-dark">₹{tx.itemTotal}</span>
                                            </div>
                                            {tx.subsidy > 0 && (
                                                <div className="flex justify-between text-xs text-red-500 font-medium">
                                                    <span>Delivery Subsidy</span>
                                                    <span>- ₹{tx.subsidy}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-200 mt-1">
                                                <span className="text-gray-700">Net Earned</span>
                                                <span className="text-green-600">₹{tx.net}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 mt-6">
                                    <p className="text-xs text-green-700 uppercase font-bold mb-3">Daily Summary</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-green-800">Total Item Sales</span>
                                            <span className="font-bold text-green-900">₹{stats.todayItemTotal}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-red-600">
                                            <span className="flex items-center gap-1 italic font-medium">Total Delivery Subsidies</span>
                                            <span className="font-bold">- ₹{stats.todaySubsidy}</span>
                                        </div>
                                        <div className="h-px bg-green-200 my-2" />
                                        <div className="flex justify-between items-center font-black text-xl">
                                            <span className="text-green-900">Net Payout</span>
                                            <span className="text-green-700">₹{stats.todayEarnings}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Button variant="primary" className="w-full mt-8 py-4 rounded-2xl shadow-lg shadow-primary/20" onClick={() => setShowEarningModal(false)}>Got it</Button>
                </div>
            </div>
        </div>
    );

    const FeedbackModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-purple-600 p-8 text-white text-center relative">
                    <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">✕</button>
                    <p className="text-purple-100 text-sm font-bold uppercase tracking-widest mb-2">Customer Feedback</p>
                    <div className="flex items-center justify-center gap-2">
                        <Star size={32} className="fill-yellow-400 text-yellow-400" />
                        <h2 className="text-5xl font-black italic">{restaurant?.rating || '0.0'}</h2>
                    </div>
                </div>
                <div className="p-8">
                    <h3 className="font-bold text-dark mb-6 flex items-center gap-2">
                        <MessageCircle size={18} className="text-primary" /> Recent Reviews
                    </h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentReviews.length === 0 ? (
                            <p className="text-center py-12 text-gray-400 italic">No ratings or reviews yet.</p>
                        ) : (
                            recentReviews.map((review, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-dark text-sm">{review.user?.name || 'Anonymous'}</span>
                                        <div className="flex items-center text-yellow-500 text-xs font-bold gap-0.5">
                                            <Star size={12} className="fill-yellow-500" /> {review.restaurantRating}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{review.ratingComment || 'No written feedback provided'}"</p>
                                    <p className="text-[10px] text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <Button variant="primary" className="w-full mt-8 py-4 rounded-2xl" onClick={() => setShowFeedbackModal(false)}>Back to Dashboard</Button>
                </div>
            </div>
        </div>
    );

    if (loading) return <MainLayout><div className="flex justify-center py-20 text-xl font-bold">Loading Dashboard...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-dark">Vendor Dashboard</h1>
                            <p className="text-gray-500">Welcome back, {restaurant?.name || 'Partner'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={toggleStatus}
                                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors duration-200 ${restaurant?.isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${restaurant?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span> 
                                {restaurant?.isOnline ? 'Online' : 'Offline'}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div onClick={() => setShowEarningModal(true)} className="cursor-pointer hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98]">
                            <StatCard title="Today's Earnings" value={`₹${stats.todayEarnings}`} icon={DollarSign} color="bg-green-500" />
                        </div>
                        <StatCard title="Live Orders" value={stats.totalLiveOrders} icon={ShoppingBag} color="bg-blue-500" />
                        <StatCard title="Menu Items" value={stats.menuItemsCount} icon={Star} color="bg-yellow-500" />
                        <div onClick={() => setShowFeedbackModal(true)} className="cursor-pointer hover:scale-[1.02] transition-transform duration-200 active:scale-[0.98]">
                            <StatCard title="Avg Rating" value={restaurant?.rating || '0.0'} icon={Clock} color="bg-purple-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Live Orders */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-dark">Live Orders</h2>
                                <Link to="/vendor/history" className="text-primary hover:text-red-700 text-sm font-bold flex items-center gap-1 transition-colors">
                                    <span>View Order History</span>
                                    <Clock size={16} />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2 font-medium">
                                                    {order.user ? `Customer: ${order.user.name} (${order.user.phone || 'N/A'})` : 'Customer Info Unavailable'}
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                                </p>
                                                {order.isFreeDelivery && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-primary uppercase bg-red-50 w-fit px-2 py-0.5 rounded-full border border-red-100 italic">
                                                        <DollarSign size={10} /> Delivery Sponsored by You
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-xl text-dark italic">₹{order.itemTotal || order.totalAmount}</p>
                                                {order.isFreeDelivery && (
                                                    <p className="text-[10px] text-red-500 font-bold">- ₹{order.deliveryEarning} (rider fee)</p>
                                                )}
                                            </div>
                                        </div>

                                        {order.status === 'Placed' ? (
                                            <div className="space-y-4">
                                                {order.isFreeDelivery && (
                                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Free Delivery Subsidy</span>
                                                            <span className="text-sm font-black text-red-600">-₹{order.deliveryEarning || 0}</span>
                                                        </div>
                                                        <p className="text-[10px] text-red-500 italic font-medium">As the order exceeds ₹500, the delivery charge will be deducted from your payout.</p>
                                                        <div className="mt-2 pt-2 border-t border-red-100 flex justify-between items-center">
                                                            <span className="text-sm font-bold text-dark">Estimated Net Payout:</span>
                                                            <span className="text-lg font-black text-primary">₹{(order.itemTotal - (order.deliveryEarning || 0)).toFixed(0)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            const reason = window.prompt('Please provide a reason for rejection:', 'Items out of stock');
                                                            if (reason !== null) {
                                                                handleOrderAction(order._id, 'Rejected', reason || 'Items out of stock');
                                                            }
                                                        }}
                                                        className="flex-1 py-3 border-2 border-red-500 text-red-500 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95"
                                                    >
                                                        Reject Order
                                                    </button>
                                                    <button
                                                        onClick={() => handleOrderAction(order._id, 'Preparing')}
                                                        className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <Check size={18} /> Accept Order
                                                    </button>
                                                </div>
                                            </div>
                                        ) : order.status === 'Preparing' ? (
                                            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                <span className="font-bold text-secondary flex items-center gap-2">
                                                    <Clock size={18} /> Preparing...
                                                </span>
                                                <Button size="sm" variant="outline" onClick={() => handleOrderAction(order._id, 'ReadyForPickup')}>
                                                    ✅ Mark Ready
                                                </Button>
                                            </div>
                                        ) : order.status === 'ReadyForPickup' ? (
                                            <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                                <span className="font-bold text-yellow-600 flex items-center gap-2">
                                                    <Check size={18} /> Food Ready
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-400 italic">Waiting for rider...</span>
                                                </div>
                                            </div>
                                        ) : order.status === 'OutForDelivery' ? (
                                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-blue-600 flex items-center gap-2">
                                                        🚴 Out For Delivery
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-500">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">No active orders right now.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Overview */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-dark">Menu Overview</h2>
                                <Link to="/vendor/menu">
                                    <Button variant="link" size="sm">Manage</Button>
                                </Link>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                                {restaurant?.menu?.map(item => (
                                    <div key={item._id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="font-medium text-dark">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-500">₹{item.price}</span>
                                    </div>
                                ))}
                                {(!restaurant?.menu || restaurant.menu.length === 0) && (
                                    <div className="text-center text-sm text-gray-400 py-4">No menu items found. Add some to get started!</div>
                                )}
                            </div>
                            <div className="mt-4 pt-2">
                                <Link to="/vendor/menu">
                                    <Button variant="outline" className="w-full">Edit Menu</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {showEarningModal && <EarningDetailModal />}
                {showFeedbackModal && <FeedbackModal />}
            </div>
        </MainLayout>
    );
};

export default VendorDashboard;
