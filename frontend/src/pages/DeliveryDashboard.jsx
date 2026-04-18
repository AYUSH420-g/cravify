import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { MapPin, Navigation, CheckCircle, Clock, Bell, Phone, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const DeliveryDashboard = () => {
    const { token, user } = useAuth();
    const socket = useSocket();
    const [isOnline, setIsOnline] = useState(user?.deliveryDetails?.isOnline || false);
    
    // Live data states
    const [activeOrder, setActiveOrder] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Selected order to accept
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [todayEarnings, setTodayEarnings] = useState(0);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 10000);
        return () => clearInterval(timer);
    }, []);

    const [lastEmit, setLastEmit] = useState(0);

    // Live Geolocation Tracking
    useEffect(() => {
        if (!isOnline || !activeOrder || !socket) return;

        console.log('Starting geolocation watcher...');
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                // Throttle: only emit every 5 seconds
                if (now - lastEmit > 5000) {
                    const { latitude, longitude } = position.coords;
                    console.log(`Sending location: ${latitude}, ${longitude}`);
                    socket.emit('update_location', {
                        orderId: activeOrder._id,
                        userId: user.id,
                        location: { lat: latitude, lng: longitude }
                    });
                    setLastEmit(now);
                }
            },
            (err) => console.error('Geolocation error:', err),
            { enableHighAccuracy: true, maximumAge: 10000 }
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

    useEffect(() => {
        if (!token) return;
        fetchInitialData();
        // Poll both active order and available orders as a socket fallback
        const interval = setInterval(() => {
            fetchActiveOrder();
            if (isOnline) fetchAvailableOrders();
        }, 15000); // Every 15 seconds
        return () => clearInterval(interval);
    }, [token, isOnline]);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchActiveOrder(), fetchAvailableOrders()]);
        setLoading(false);
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
                    setActiveOrder(null);
                    setTodayEarnings(prev => prev + 40);
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
                            <p className="text-gray-500 text-xs">Today's Est Earnings</p>
                            <h3 className="text-xl font-bold text-dark">₹{todayEarnings}</h3>
                        </Link>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 opacity-50 pointer-events-none">
                            <p className="text-gray-500 text-xs">Ride Time</p>
                            <h3 className="text-xl font-bold text-dark">0h 0m</h3>
                        </div>
                        <Link to="/delivery/history" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary transition-colors">
                            <p className="text-gray-500 text-xs">View History</p>
                            <h3 className="text-lg font-bold text-dark">Orders →</h3>
                        </Link>
                        <Link to="/delivery/profile" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Profile & Ratings</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold text-dark">5.0</span>
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
                                    <p className="text-sm text-gray-500">Est. Earnings: ₹40</p>
                                </div>
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {activeOrder.status}
                                </span>
                            </div>

                            <div className="p-6">
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 h-2 rounded-full mb-6 relative">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${getStatusProgress(activeOrder.status)}%` }}
                                    ></div>
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
                                        <div>
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
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                        </div>
                                        <div>
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
                                                    
                                                    <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700 border-green-600" onClick={() => handleStatusUpdate('Delivered')} disabled={actionLoading}>
                                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Complete Delivery'}
                                                    </Button>
                                                </div>
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
                                                    <span className="text-xs text-primary font-bold">₹40.00</span>
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

                {/* New Order details Modal inside Dashboard */}
                {showNewOrderModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-slideUp md:animate-fadeIn">
                            <div className="bg-primary p-4 text-white text-center">
                                <h3 className="font-bold text-xl">New Delivery Request!</h3>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-primary">₹40.00</h2>
                                    <p className="text-gray-500 text-sm">Base Delivery Fate</p>
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
