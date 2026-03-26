import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { MapPin, Navigation, CheckCircle, Clock, Bell, Phone, AlertTriangle, Shield, Menu } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeliveryDashboard = () => {
    const { token } = useAuth();
    const [isOnline, setIsOnline] = useState(false);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [newOrder, setNewOrder] = useState(null);

    const [activeOrder, setActiveOrder] = useState(null);
    const [loadingTasks, setLoadingTasks] = useState(true);

    // Fetch initial profile and active tasks
    useEffect(() => {
        if (token) {
            fetchProfile();
            fetchActiveTask();
        }
    }, [token]);

    // Polling for new available orders if online and no active order
    useEffect(() => {
        let interval;
        if (token && isOnline && !activeOrder) {
            fetchAvailableTasks();
            interval = setInterval(fetchAvailableTasks, 10000); // poll every 10s
        }
        return () => clearInterval(interval);
    }, [token, isOnline, activeOrder]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/delivery/profile', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setIsOnline(data.isOnline);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleOnlineStatus = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/delivery/profile/status', {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setIsOnline(data.isOnline);
            }
        } catch (err) {
            console.error(err);
            // Revert optimistically if needed
        }
    };

    const fetchActiveTask = async () => {
        try {
            setLoadingTasks(true);
            const res = await fetch('http://localhost:5000/api/delivery/tasks/active', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setActiveOrder(data || null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTasks(false);
        }
    };

    const fetchAvailableTasks = async () => {
        if (!isOnline || activeOrder || showNewOrderModal) return;
        try {
            const res = await fetch('http://localhost:5000/api/delivery/tasks/available', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const tasks = await res.json();
                if (tasks && tasks.length > 0) {
                    setNewOrder(tasks[0]);
                    setShowNewOrderModal(true);
                } else {
                    setNewOrder(null);
                    setShowNewOrderModal(false);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptOrder = async () => {
        if (!newOrder) return;
        try {
            const res = await fetch(`http://localhost:5000/api/delivery/tasks/${newOrder._id}/accept`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                await fetchActiveTask();
                setShowNewOrderModal(false);
                setNewOrder(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectOrder = () => {
        // Technically just ignoring it so another driver can pick it up
        setShowNewOrderModal(false);
        setNewOrder(null);
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!activeOrder) return;
        try {
            const res = await fetch(`http://localhost:5000/api/delivery/tasks/${activeOrder._id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                if (newStatus === 'delivered') {
                    setActiveOrder(null);
                    fetchProfile(); // update earnings immediately
                } else {
                    await fetchActiveTask();
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusProgress = (status) => {
        const steps = ['pending', 'accepted', 'arrived_at_restaurant', 'picked_up', 'arrived_at_customer', 'delivered'];
        const index = steps.indexOf(status);
        return index >= 0 ? (index / (steps.length - 1)) * 100 : 0;
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                {/* Header for Rider - simplified */}
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                {isOnline ? 'You are Online' : 'You are Offline'}
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleOnlineStatus} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Map Placeholder */}
                    <div className="bg-gray-200 rounded-2xl h-64 w-full mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/OpenStreetMap_Logo_2011.svg')" }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 text-center">
                                <Navigation className="w-8 h-8 text-primary mx-auto mb-2" />
                                <p className="font-bold text-gray-800">Navigation Map</p>
                                <p className="text-xs text-gray-500">Ahmedabad, Gujarat</p>
                            </div>
                        </div>
                        {isOnline && (
                            <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md">
                                <p className="text-xs font-bold text-gray-500">ZONE</p>
                                <p className="text-sm font-bold text-primary">High Demand</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Link to="/earnings" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Total Earnings</p>
                            <h3 className="text-xl font-bold text-dark">₹{profile?.totalEarnings || 0}</h3>
                        </Link>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                            <p className="text-gray-500 text-xs">Completed Orders</p>
                            <h3 className="text-xl font-bold text-dark">{profile?.totalDeliveries || 0}</h3>
                        </div>
                        <Link to="/history" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">History</p>
                            <h3 className="text-xl font-bold text-dark">View</h3>
                        </Link>
                        <Link to="/profile" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Profile</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold text-dark">4.8</span>
                                <span className="text-yellow-500">★</span>
                            </div>
                        </Link>
                    </div>

                    {/* Active Order Card */}
                    {loadingTasks ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
                            <h3 className="text-xl font-bold text-gray-800 animate-pulse">Loading Tasks...</h3>
                        </div>
                    ) : activeOrder ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden mb-8 animate-fadeIn">
                            <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-primary/10">
                                <div>
                                    <h3 className="font-bold text-lg text-dark">Active Order</h3>
                                    <p className="text-sm text-gray-500">Est. Earnings: ₹{activeOrder.earnings}</p>
                                </div>
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {activeOrder.status.replace(/_/g, ' ')}
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
                                            <h4 className="font-bold text-lg">{activeOrder.order?.restaurant?.name || 'Restaurant'}</h4>
                                            <p className="text-gray-500 text-sm">{activeOrder.order?.restaurant?.address || 'Restaurant Address'}</p>
                                            {['accepted', 'arrived_at_restaurant'].includes(activeOrder.status) && (
                                                <div className="mt-2 flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${activeOrder.order?.restaurant?.address}`, '_blank')}>
                                                        <Navigation size={14} className="mr-1" /> Navigate
                                                    </Button>
                                                    {activeOrder.status === 'accepted' && (
                                                        <Button size="sm" variant="primary" onClick={() => handleStatusUpdate('arrived_at_restaurant')}>
                                                            Arrived at Store
                                                        </Button>
                                                    )}
                                                    {activeOrder.status === 'arrived_at_restaurant' && (
                                                        <Button size="sm" variant="primary" onClick={() => handleStatusUpdate('picked_up')}>
                                                            Confirm Pickup
                                                        </Button>
                                                    )}
                                                </div>
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
                                            <h4 className="font-bold text-lg">{activeOrder.order?.user?.name || 'Customer'}</h4>
                                            <p className="text-gray-500 text-sm">
                                                {activeOrder.order?.user?.addresses?.[0]?.street || 'Customer Address'}, {activeOrder.order?.user?.addresses?.[0]?.city}
                                            </p>
                                            {['picked_up', 'arrived_at_customer'].includes(activeOrder.status) && (
                                                <div className="mt-2 flex gap-2 flex-wrap">
                                                    <Button size="sm" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${activeOrder.order?.user?.addresses?.[0]?.street}`, '_blank')}>
                                                        <Navigation size={14} className="mr-1" /> Navigate
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                        <Phone size={14} className="mr-1" /> Call Customer
                                                    </Button>
                                                    {activeOrder.status === 'picked_up' && (
                                                        <Button size="sm" variant="primary" onClick={() => handleStatusUpdate('arrived_at_customer')}>
                                                            Arrived at Location
                                                        </Button>
                                                    )}
                                                    {activeOrder.status === 'arrived_at_customer' && (
                                                        <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700 border-green-600" onClick={() => handleStatusUpdate('delivered')}>
                                                            Complete Delivery
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
                            <div className={`w-16 h-16 ${isOnline ? 'bg-green-100 animate-pulse' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                <Navigation className={isOnline ? 'text-green-500' : 'text-gray-400'} size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{isOnline ? 'Waiting for orders...' : 'You are offline'}</h3>
                            <p className="text-gray-500 mt-2">{isOnline ? 'You are visible to nearby restaurants.' : 'Go online to start receiving orders.'}</p>
                        </div>
                    )}

                    {/* Safety & Tools */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 p-4 bg-white border border-red-100 rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors">
                            <AlertTriangle size={20} />
                            <span className="font-bold">SOS / Emergency</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Shield size={20} />
                            <span className="font-bold">Rider Support</span>
                        </button>
                    </div>
                </div>

                {/* New Order Modal */}
                {showNewOrderModal && newOrder && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-slideUp md:animate-fadeIn">
                            <div className="bg-primary p-4 text-white text-center">
                                <h3 className="font-bold text-xl animate-pulse">New Delivery Request!</h3>
                                <p className="text-sm opacity-90">Accept quickly before someone else picks it up</p>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-primary">₹{newOrder.earnings}</h2>
                                    <p className="text-gray-500 text-sm">Est. Earning</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                <MapPin className="text-orange-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">{newOrder.order?.restaurant?.name || 'Restaurant'}</p>
                                                <p className="text-xs text-gray-500">Pick up location</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-0.5 h-4 bg-gray-200 ml-5"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <Navigation className="text-green-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">Drop Location</p>
                                                <p className="text-xs text-gray-500">{newOrder.order?.user?.name || 'Customer'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={handleRejectOrder} className="justify-center border-red-200 text-red-600 hover:bg-red-50">
                                        Reject
                                    </Button>
                                    <Button variant="primary" onClick={handleAcceptOrder} className="justify-center">
                                        Accept Order
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
