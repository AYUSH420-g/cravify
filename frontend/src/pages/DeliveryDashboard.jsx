import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import { MapPin, Navigation, CheckCircle, Clock, Bell, Phone, AlertTriangle, Shield, Loader2, MessageCircle, Send } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MapComponent from '../components/MapComponent';

const DeliveryDashboard = () => {
    const { token, user } = useAuth();
    const socket = useSocket();
    const currentUserId = user?.id || user?._id;
    const [isOnline, setIsOnline] = useState(user?.deliveryDetails?.isOnline || false);
    
    // Live data states
    const [activeOrder, setActiveOrder] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatText, setChatText] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const isChatOpenRef = useRef(false);
    const chatOrderIdRef = useRef(null); // mirrors orderIdRef from customer — never goes stale
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const [geoError, setGeoError] = useState('');
    const [lastLoc, setLastLoc] = useState(null);

    // Selected order to accept
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [todayEarnings, setTodayEarnings] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 10000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen]);

    // Keep chatOrderIdRef always fresh — same pattern as customer orderIdRef
    useEffect(() => {
        chatOrderIdRef.current = activeOrder?._id || null;
    }, [activeOrder?._id]);

    const [lastEmit, setLastEmit] = useState(0);
    const mapContainerStyle = {
        width: '100%',
        height: '300px'
    };

    // Default fallback (Ahmedabad area)
    const defaultCenter = { lat: 23.0225, lng: 72.5714 };

    // Live center
    const center = lastLoc || defaultCenter;

    const [directions, setDirections] = useState(null);

    // Route fetching is handled by MapComponent via OSRM backend API

    // Live Geolocation Tracking
    useEffect(() => {
        if (!isOnline || !activeOrder || !socket) return;

        setGeoError('');
        const isIdle = activeOrder.status === 'Placed'; // Save battery if order isn't preparing yet

        console.log('Starting geolocation watcher...');
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setGeoError('');
                const now = Date.now();
                // Throttle: only emit every 5 seconds
                if (now - lastEmit > 5000) {
                    const { latitude, longitude, accuracy } = position.coords;
                    
                    // Accuracy filter: ignore readings worse than 100 meters
                    if (accuracy > 100) {
                        console.log('Ignoring inaccurate GPS reading (accuracy > 100m):', accuracy);
                        return;
                    }

                    // Jump filter: simple distance check could go here if lastLoc exists
                    if (lastLoc) {
                        const distance = Math.sqrt(
                            Math.pow(latitude - lastLoc.lat, 2) + 
                            Math.pow(longitude - lastLoc.lng, 2)
                        );
                        if (distance < 0.0001) {
                            console.log('Ignoring stationary location update (distance < 0.0001):', distance);
                            return;
                        }
                    }
                    setLastLoc({ lat: latitude, lng: longitude });

                    console.log(`Sending location: ${latitude}, ${longitude}`);
                    socket.emit('update_location', {
                        orderId: activeOrder._id,
                        userId: currentUserId,
                        location: { lat: latitude, lng: longitude }
                    }, (response) => {
                        // Acknowledgement from server
                        // console.log('Location update acknowledged');
                    });
                    setLastEmit(now);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                if (err.code === err.PERMISSION_DENIED) {
                    setGeoError('GPS tracking is disabled. Please allow location permissions in your browser.');
                } else {
                    setGeoError('Unable to get a stable GPS signal. Trying again...');
                }
            },
            { enableHighAccuracy: !isIdle, maximumAge: 10000, timeout: 15000 }
        );

        return () => {
            console.log('Stopping geolocation watcher');
            navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, activeOrder?.status, socket, user?.id, lastEmit]);

    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (order) => {
            console.log('New order received via socket:', order);
            // Only add if rider is online and not already assigned
            if (isOnline) {
                setAvailableOrders(prev => {
                    // Avoid duplicates
                    if (prev.find(o => o._id === order._id)) return prev;
                    return [order, ...prev];
                });
                
                // Optional: Play a sound notification
                // new Audio('/new-order.mp3').play().catch(e => {});
            }
        };

        const handleOrderTaken = (orderId) => {
            console.log('Order taken by another rider:', orderId);
            setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
            if (selectedOrder?._id === orderId) {
                setShowNewOrderModal(false);
                setSelectedOrder(null);
            }
        };

        socket.on('NEW_AVAILABLE_ORDER', handleNewOrder);
        socket.on('ORDER_TAKEN', handleOrderTaken);

        return () => {
            socket.off('NEW_AVAILABLE_ORDER', handleNewOrder);
            socket.off('ORDER_TAKEN', handleOrderTaken);
        };
    }, [socket, isOnline, selectedOrder]);

    // ── CHAT: exact mirror of customer-side pattern ──────────────────────────

    // Register socket listeners ONCE — handlers use refs so they never go stale
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            console.log('Chat message received by Rider:', message);
            const msgOrderId = (message.order?._id || message.order || '').toString();
            const currentOrderId = (chatOrderIdRef.current || '').toString();
            
            if (msgOrderId && currentOrderId && msgOrderId === currentOrderId) {
                setChatMessages((prev) => {
                    const isDuplicate = prev.some(m => m._id === message._id);
                    if (isDuplicate) return prev;
                    
                    if (!isChatOpenRef.current && message.senderRole !== 'delivery_partner') {
                        setUnreadCount(c => c + 1);
                    }
                    return [...prev, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                });
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('chat_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('chat_message', handleReceiveMessage);
        };
    }, [socket]); // socket only — all handlers use refs, never stale

    // Join order room + rejoin on reconnect whenever active order changes
    useEffect(() => {
        if (!activeOrder?._id || !socket) return;
        socket.emit('join_order_room', activeOrder._id);
        const handleReconnect = () => socket.emit('join_order_room', activeOrder._id);
        socket.on('connect', handleReconnect);
        return () => socket.off('connect', handleReconnect);
    }, [activeOrder?._id, socket]);

    // Load chat history only when orderId actually changes (NOT on every 10s poll)
    useEffect(() => {
        if (!activeOrder?._id || !token) return;
        // Reset messages for new order
        setChatMessages([]);
        setUnreadCount(0);
        fetch(`/api/chat/${activeOrder._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const sorted = (data.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    setChatMessages(sorted);
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            })
            .catch(err => console.error('Chat history load error:', err));
    }, [activeOrder?._id, token]); // Only re-runs when ORDER changes, not on every poll

    // ────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!token) return;
        fetchInitialData();
        // Poll both active order and available orders as a socket fallback
        const interval = setInterval(() => {
            fetchActiveOrder();
            if (isOnline) fetchAvailableOrders();
        }, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, [token, isOnline]);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchActiveOrder(), fetchAvailableOrders(), fetchWallet()]);
        setLoading(false);
    };

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/delivery/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWalletBalance(data.walletBalance || 0);
                setTotalEarnings(data.totalEarnings || 0);
                setTodayEarnings(data.todayEarnings || 0);
            }
        } catch (err) {
            console.error('Failed to fetch wallet', err);
        }
    };

    const fetchActiveOrder = async () => {
        try {
            const activeRes = await fetch('/api/delivery/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (activeRes.ok) {
                const activeData = await activeRes.json();
                setActiveOrder(activeData || null);
            }
        } catch (err) {
            console.error('Failed to fetch active order', err);
        }
    };

    const fetchAvailableOrders = async () => {
        if (!isOnline) {
            setAvailableOrders([]);
            return;
        }
        try {
            const availableRes = await fetch('/api/delivery/available', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (availableRes.ok) {
                const availableData = await availableRes.json();
                setAvailableOrders(availableData);
            }
        } catch (err) {
            console.error('Failed to fetch available orders', err);
        }
    };

    const handleToggleOnline = async () => {
        const newStatus = !isOnline;
        setActionLoading(true);
        try {
            const res = await fetch('/api/delivery/online-status', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ isOnline: newStatus })
            });
            if (res.ok) {
                setIsOnline(newStatus);
                if (!newStatus) setAvailableOrders([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/delivery/orders/${orderId}/accept`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                setShowNewOrderModal(false);
                setSelectedOrder(null);
                fetchActiveOrder(); // pull active order immediately
                setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
            } else {
                const data = await res.json();
                alert(data.message || 'Order was taken by another rider or is no longer available.');
                fetchAvailableOrders();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
            setShowNewOrderModal(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/delivery/orders/${activeOrder._id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                if (newStatus === 'Delivered') {
                    // Clean up chat messages for this order
                    try {
                        await fetch(`/api/chat/${activeOrder._id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (e) { console.error('Chat cleanup failed', e); }
                    setActiveOrder(null);
                    setChatMessages([]);
                    setUnreadCount(0);
                    fetchWallet(); // Refresh earnings from server
                    // After delivery, immediately check for new available orders
                    if (isOnline) fetchAvailableOrders();
                } else {
                    // Use functional update to avoid stale closure
                    setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            } else {
                const errData = await res.json();
                alert(`Failed: ${errData.message || 'Unknown error'}`);
                fetchActiveOrder(); // Resync with DB
            }
        } catch (err) {
            console.error(err);
            alert('Network error updating order status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatText.trim() || !activeOrder) return;

        const msgText = chatText.trim();
        setChatText('');

        try {
            const res = await fetch(`/api/chat/${activeOrder._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: msgText,
                    senderRole: 'delivery_partner'
                })
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('Chat send failed:', data.message);
                setChatText(msgText); // Restore text on failure
            } else if (data.success && data.message) {
                setChatMessages(prev => {
                    if (prev.find(m => m._id === data.message._id)) return prev;
                    return [...prev, data.message];
                });
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) {
            console.error('Chat send error:', err);
            setChatText(msgText); // Restore text on failure
        }
    };



    const getStatusProgress = (status) => {
        const steps = ['Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered'];
        const idx = steps.indexOf(status);
        return idx === -1 ? 0 : ((idx + 1) / steps.length) * 100;
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                {isOnline ? 'You are Online' : 'You are Offline'}
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={handleToggleOnline} disabled={actionLoading} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Link to="/delivery/earnings" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Today's Earnings</p>
                            <h3 className="text-xl font-bold text-green-600">₹{todayEarnings}</h3>
                        </Link>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs">Wallet Balance</p>
                            <h3 className="text-xl font-bold text-dark">₹{walletBalance}</h3>
                        </div>
                        <Link to="/delivery/history" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors">
                            <p className="text-gray-500 text-xs">Total Earned</p>
                            <h3 className="text-xl font-bold text-dark">₹{totalEarnings}</h3>
                        </Link>
                        <Link to="/delivery/profile" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Profile & Ratings</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold text-dark">{user?.deliveryRating?.toFixed(1) || '0.0'}</span>
                                <span className="text-yellow-500">★</span>
                            </div>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    ) : activeOrder ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden mb-8 animate-fadeIn">
                            <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-primary/10">
                                <div>
                                    <h3 className="font-bold text-lg text-dark">Active Order #{activeOrder._id?.slice(-6).toUpperCase()}</h3>
                                    <p className="text-sm text-gray-500">Est. Earnings: ₹{activeOrder.deliveryEarning || '—'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {activeOrder.status}
                                    </span>
                                </div>
                            </div>
                            
                            {geoError && (
                                <div className="bg-red-50 p-3 mx-6 mt-4 rounded-lg flex items-start gap-3 border border-red-100">
                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-red-800 text-sm font-bold">Location Error</h4>
                                        <p className="text-red-600 text-xs mt-1">{geoError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 h-2 rounded-full mb-6 relative">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${getStatusProgress(activeOrder.status)}%` }}
                                    ></div>
                                </div>

                                {/* 🚀 LIVE MAP */}
                                <div className="mb-6 rounded-xl overflow-hidden shadow-inner border border-gray-200 h-64 z-0 relative">
                                    <MapComponent
                                        riderLocation={lastLoc}
                                        restaurantLocation={activeOrder?.restaurant?.location}
                                        customerLocation={activeOrder?.deliveryLocation || activeOrder?.deliveryAddress?.location} 
                                    />
                                </div>

                                {/* Locations */}
                                <div className="space-y-6 mb-6">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Pick Up</p>
                                            <h4 className="font-bold text-lg">{activeOrder.restaurant?.name}</h4>
                                            <p className="text-gray-500 text-sm">{activeOrder.restaurant?.address}</p>
                                            
                                            {activeOrder.status === 'ReadyForPickup' && (
                                                <div className="mt-2 flex gap-2">
                                                    <Button size="sm" variant="primary" onClick={() => handleStatusUpdate('OutForDelivery')} disabled={actionLoading}>
                                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Order Picked Up'}
                                                    </Button>
                                                </div>
                                            )}
                                            {activeOrder.status === 'Preparing' && (
                                                <p className="mt-2 text-primary font-medium text-sm italic">Restaurant is still preparing the food...</p>
                                            )}
                                        </div>
                                        <div>
                                            <button onClick={() => window.open(`geo:${activeOrder.restaurant?.location?.lat},${activeOrder.restaurant?.location?.lng}`)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full" title="Navigate">
                                                <Navigation size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 uppercase font-bold">Drop Off</p>
                                            <h4 className="font-bold text-lg">{activeOrder.user?.name}</h4>
                                            <p className="text-gray-500 text-sm">
                                                {activeOrder.deliveryAddress ? `${activeOrder.deliveryAddress.street}, ${activeOrder.deliveryAddress.city}` : 'No address provided'}
                                            </p>
                                            {activeOrder.status === 'OutForDelivery' && (
                                                <div className="mt-2 flex gap-2 flex-wrap">
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                        <Phone size={14} className="mr-1" /> {activeOrder.user?.phone || 'Call Customer'}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="relative text-dark border-gray-200 hover:bg-gray-50"
                                                        onClick={() => { setIsChatOpen(true); setUnreadCount(0); }}
                                                    >
                                                        <MessageCircle size={14} className="mr-1" /> Chat
                                                        {unreadCount > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </Button>
                                                    
                                                    <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700 border-green-600" onClick={() => handleStatusUpdate('Delivered')} disabled={actionLoading}>
                                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Complete Delivery'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {activeOrder.deliveryAddress?.location && (
                                                <button onClick={() => window.open(`geo:${activeOrder.deliveryAddress.location.lat},${activeOrder.deliveryAddress.location.lng}`)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full" title="Navigate">
                                                    <Navigation size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
                                    <p className="font-bold mb-2">Order Items:</p>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {activeOrder.items?.map((item, idx) => (
                                            <li key={idx}>{item.quantity}x {item.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : availableOrders.length > 0 ? (
                        <div className="mb-8">
                            <h2 className="font-bold text-xl mb-4 text-dark flex items-center gap-2">
                                <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{availableOrders.length}</span>
                                Available Orders Nearby
                            </h2>
                            <div className="grid gap-4">
                                {availableOrders.map(order => {
                                    // Calculate time remaining based on 30 minute backend window
                                    const timePassedMs = Date.now() - new Date(order.updatedAt).getTime();
                                    const timeRemainingMs = Math.max(0, (30 * 60 * 1000) - timePassedMs);
                                    const minutes = Math.floor(timeRemainingMs / 60000);
                                    const seconds = Math.floor((timeRemainingMs % 60000) / 1000);
                                    const isExpiringSoon = minutes < 5;

                                    return (
                                        <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-primary transition-colors cursor-pointer" onClick={() => {
                                            setSelectedOrder(order);
                                            setShowNewOrderModal(true);
                                        }}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-dark">{order.restaurant?.name}</h4>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isExpiringSoon ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                                                        {minutes > 0 ? `${minutes}m ${seconds}s left` : `${seconds}s left`}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-1">{order.restaurant?.address}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.status === 'ReadyForPickup' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                                                        {order.status === 'ReadyForPickup' ? '✅ Ready to Pickup' : '🍳 Being Prepared'}
                                                    </span>
                                                    <span className="text-xs text-primary font-bold">₹{order.deliveryEarning || '—'}</span>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                                <CheckCircle size={20} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Navigation className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Waiting for orders...</h3>
                            <p className="text-gray-500 mt-2">
                                {isOnline ? 'You are online and visible to nearby restaurants.' : 'Go online to see available orders.'}
                            </p>
                        </div>
                    )}
                </div>

                {isChatOpen && activeOrder && (
                    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 rounded-t-2xl md:rounded-2xl bg-white shadow-2xl border border-gray-100 z-50 flex flex-col pt-2" style={{ height: '500px', maxHeight: '80vh' }}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <MessageCircle size={20} className="text-primary" />
                                <div>
                                    <h3 className="font-bold text-dark">
                                        Chat with Customer
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Coordinate order delivery
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {chatMessages.filter(msg => {
                                return msg.senderRole === 'customer' || msg.senderRole === 'delivery_partner';
                            }).map((msg, index) => {
                                const isMe = msg.senderRole === 'delivery_partner';
                                return (
                                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.senderRole?.replace('_partner', '')}</span>
                                        <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-gray-100 text-dark rounded-bl-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-gray-100 rounded-b-2xl flex gap-2">
                            <input
                                type="text"
                                value={chatText}
                                onChange={(e) => setChatText(e.target.value)}
                                placeholder="Message customer..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button type="submit" disabled={!chatText.trim()} className="p-2 bg-primary text-white rounded-full disabled:opacity-50 hover:bg-red-700 transition">
                                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </form>
                    </div>
                )}

                {/* New Order details Modal inside Dashboard */}
                {showNewOrderModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-slideUp md:animate-fadeIn">
                            <div className="bg-primary p-4 text-white text-center">
                                <h3 className="font-bold text-xl">New Delivery Request!</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-primary">₹{selectedOrder.deliveryEarning || '—'}</h2>
                                    <p className="text-gray-500 text-sm">Delivery Earnings {selectedOrder.distanceKm ? `• ${selectedOrder.distanceKm} km` : ''}</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                                                <MapPin className="text-orange-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">{selectedOrder.restaurant?.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{selectedOrder.restaurant?.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-0.5 h-4 bg-gray-200 ml-5"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                                <Navigation className="text-green-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">Drop Location</p>
                                                <p className="text-xs text-gray-500">{selectedOrder.deliveryAddress?.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={() => { setShowNewOrderModal(false); setSelectedOrder(null); }} className="justify-center border-red-200 text-red-600 hover:bg-red-50" disabled={actionLoading}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={() => handleAcceptOrder(selectedOrder._id)} className="justify-center" disabled={actionLoading}>
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Accept Order'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default DeliveryDashboard;
