import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { MapPin, Navigation, CheckCircle, Clock, Bell, Phone, AlertTriangle, Shield, Menu, X, MessageSquare, Send } from 'lucide-react';

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
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'customer', text: 'Hi, are you on the way?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);

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
            interval = setInterval(fetchAvailableTasks, 3000); // poll every 3s for fast sync
        }
        return () => clearInterval(interval);
    }, [token, isOnline, activeOrder]);

    // Added polling for activeTask to get real-time updates from restaurant side just in case
    useEffect(() => {
        let activeInterval;
        if (token && activeOrder) {
            activeInterval = setInterval(fetchActiveTask, 10000);
        }
        return () => clearInterval(activeInterval);
    }, [token, activeOrder]);


    const fetchProfile = async () => {
        try {
            const res = await fetch('http://localhost:5003/api/delivery/profile', {
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
            const res = await fetch('http://localhost:5003/api/delivery/profile/status', {
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
            const res = await fetch('http://localhost:5003/api/delivery/tasks/active', {
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
            const res = await fetch('http://localhost:5003/api/delivery/tasks/available', {
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
            const res = await fetch(`http://localhost:5003/api/delivery/tasks/${newOrder._id}/accept`, {
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
            const res = await fetch(`http://localhost:5003/api/delivery/tasks/${activeOrder._id}/status`, {
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

    const handleSOS = () => {
        setShowSOSModal(true);
    };

    // Calculate map query based on active order or city default
    const getMapQuery = () => {
        if (activeOrder) {
            if (['accepted', 'arrived_at_restaurant'].includes(activeOrder.status) && activeOrder.order?.restaurant) {
                return `${activeOrder.order.restaurant.lat || ''},${activeOrder.order.restaurant.lng || ''} ${activeOrder.order.restaurant.address}`;
            } else if (activeOrder.order?.deliveryAddress) {
                const addr = activeOrder.order.deliveryAddress;
                return `${addr.street || ''}, ${addr.city || ''}, ${addr.zip || ''}`;
            }
        }
        return `Ahmedabad, Gujarat`; // Default 
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
                    {/* Map Placement - Dynamic iFrame */}
                    <div className="bg-gray-200 rounded-2xl h-64 w-full mb-6 relative overflow-hidden group border border-gray-300 shadow-inner">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            style={{ border: 0 }} 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(getMapQuery())}&z=14&output=embed`} 
                            allowFullScreen
                            title="Dynamic Navigation Map"
                        ></iframe>
                        {isOnline && !activeOrder && (
                            <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md pointer-events-none">
                                <p className="text-xs font-bold text-gray-500">ZONE</p>
                                <p className="text-sm font-bold text-primary animate-pulse">Searching...</p>
                            </div>
                        )}
                        {activeOrder && (
                            <div className="absolute top-4 right-4 bg-primary p-2 text-white rounded-lg shadow-md pointer-events-none">
                                <p className="text-sm font-bold flex items-center gap-1"><Navigation size={14}/> Navigating</p>
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
                            <h3 className="text-xl font-bold text-dark">View &gt;</h3>
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
                                                {activeOrder.order?.deliveryAddress?.street || 'Customer Address'}, {activeOrder.order?.deliveryAddress?.city}
                                            </p>
                                            {['picked_up', 'arrived_at_customer'].includes(activeOrder.status) && (
                                                <div className="mt-2 flex gap-2 flex-wrap">
                                                    <Button size="sm" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${activeOrder.order?.deliveryAddress?.street},${activeOrder.order?.deliveryAddress?.city}`, '_blank')}>
                                                        <Navigation size={14} className="mr-1" /> Navigate
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                        <Phone size={14} className="mr-1" /> Call Customer
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => setShowChatModal(true)}>
                                                        <MessageSquare size={14} className="mr-1" /> Chat with Customer
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
                        <button onClick={handleSOS} className="flex items-center justify-center gap-2 p-4 bg-white border border-red-100 rounded-xl shadow-sm text-red-600 hover:bg-red-50 transition-colors">
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
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-slideUp md:animate-fadeIn shadow-2xl">
                            <div className="bg-primary p-4 text-white text-center shadow-inner">
                                <h3 className="font-bold text-xl animate-pulse flex items-center justify-center gap-2"><Bell size={20} /> New Delivery Request!</h3>
                                <p className="text-sm opacity-90 mt-1">Accept quickly to earn rewards</p>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-4xl font-black text-primary">₹{newOrder.earnings}</h2>
                                    <p className="text-gray-500 text-sm font-medium mt-1">Estimated Earnings</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                <MapPin className="text-orange-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm text-dark">{newOrder.order?.restaurant?.name || 'Restaurant'}</p>
                                                <p className="text-xs text-gray-500">{newOrder.order?.restaurant?.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-0.5 h-6 bg-gray-200 ml-5"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <Navigation className="text-green-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm text-dark">{newOrder.order?.user?.name || 'Customer'}</p>
                                                <p className="text-xs text-gray-500">{newOrder.order?.deliveryAddress?.street}, {newOrder.order?.deliveryAddress?.city}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={handleRejectOrder} className="justify-center border-red-200 text-red-600 hover:bg-red-50">
                                        Reject
                                    </Button>
                                    <Button variant="primary" onClick={handleAcceptOrder} className="justify-center text-lg py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                                        Accept Order
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SOS Emergency Modal */}
                {showSOSModal && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-red-50 border-2 border-red-500 rounded-2xl w-full max-w-sm overflow-hidden animate-fadeIn shadow-2xl relative">
                            <button onClick={() => setShowSOSModal(false)} className="absolute top-2 right-2 p-2 bg-white/50 hover:bg-white rounded-full transition-colors">
                                <X size={20} className="text-gray-600" />
                            </button>
                            <div className="p-8 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-pulse mb-6 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                    <AlertTriangle size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-red-700 mb-2">Emergency SOS</h2>
                                <p className="text-gray-600 text-sm mb-8">This will immediately notify local authorities and share your live location with Cravify Support.</p>
                                
                                <button 
                                    onClick={() => {
                                        alert('SOS Triggered! Location successfully transmitted. Support will contact you immediately.');
                                        setShowSOSModal(false);
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                                >
                                    DRAG TO TRIGGER SOS
                                </button>
                                
                                <button onClick={() => setShowSOSModal(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Chat Modal */}
                {showChatModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col h-[500px] overflow-hidden shadow-2xl relative animate-fadeIn">
                            {/* Chat Header */}
                            <div className="bg-primary p-4 text-white flex justify-between items-center shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                        {activeOrder?.order?.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{activeOrder?.order?.user?.name || 'Customer'}</h3>
                                        <p className="text-xs text-white/80">Online</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {/* Chat Body */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                                <div className="text-center text-xs text-gray-400 mb-2">Today</div>
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.sender === 'rider' ? 'bg-primary text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'}`}>
                                        <p>{msg.text}</p>
                                        <span className={`text-[10px] block mt-1 ${msg.sender === 'rider' ? 'text-white/70 text-right' : 'text-gray-400'}`}>{msg.time}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Chat Input */}
                            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && chatMessage.trim()) {
                                            setChatHistory([...chatHistory, { sender: 'rider', text: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                                            setChatMessage('');
                                        }
                                    }}
                                />
                                <button 
                                    className="w-10 h-10 bg-primary hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!chatMessage.trim()}
                                    onClick={() => {
                                        if (chatMessage.trim()) {
                                            setChatHistory([...chatHistory, { sender: 'rider', text: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                                            setChatMessage('');
                                        }
                                    }}
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default DeliveryDashboard;
