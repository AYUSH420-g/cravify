import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { MapPin, Navigation, CheckCircle, Clock, Bell, Phone, AlertTriangle, Shield, Menu, MessageSquare, Send, X } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const DeliveryDashboard = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, earnings, profile
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    
    // Dynamic Stats
    const [todaysEarnings, setTodaysEarnings] = useState(850);
    const [ordersCount, setOrdersCount] = useState(12);
    const [rideTime, setRideTime] = useState("4h 30m");

    // Chat Modal UI State
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { sender: 'customer', text: 'Hi, are you on the way?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);

    // Mock Active Order State
    const [activeOrder, setActiveOrder] = useState({
        id: 'ORD-205',
        restaurant: {
            name: "La Pino'z Pizza",
            address: "Shop 4, CG Road, Ahmedabad",
            lat: 23.0225,
            lng: 72.5714
        },
        customer: {
            name: "Aryan Sharma",
            address: "Flat 402, Galaxy Apt, Ahmedabad",
            phone: "+91 98765 43210"
        },
        items: [
            { name: "Paneer Tikka Pizza", qty: 1 },
            { name: "Coke", qty: 2 }
        ],
        status: 'picked_up', // accepted, arrived_at_restaurant, picked_up, arrived_at_customer, delivered
        earnings: 45
    });

    // Mock New Order Request
    useEffect(() => {
        if (isOnline && !activeOrder) {
            const timer = setTimeout(() => {
                setShowNewOrderModal(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, activeOrder]);

    const handleStatusUpdate = (newStatus) => {
        setActiveOrder({ ...activeOrder, status: newStatus });
        if (newStatus === 'delivered') {
            // Update earnings logic
            setTodaysEarnings(prev => prev + activeOrder.earnings);
            setOrdersCount(prev => prev + 1);
        }
    };

    const handleAcceptOrder = () => {
        setActiveOrder({
            id: 'ORD-NEW-001',
            restaurant: { name: "Burger King", address: "Alpha One Mall, Ahmedabad" },
            customer: { name: "Priya Patel", address: "B-202, Shivalik Shilp" },
            items: [{ name: "Whopper Meal", qty: 1 }],
            status: 'accepted',
            earnings: 35
        });
        setShowNewOrderModal(false);
    };

    const getStatusProgress = (status) => {
        const steps = ['accepted', 'arrived_at_restaurant', 'picked_up', 'arrived_at_customer', 'delivered'];
        return (steps.indexOf(status) + 1) * 20;
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
                            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Map Placeholder */}
                    <div className="bg-gray-200 rounded-2xl h-64 w-full mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/OpenStreetMap_Logo_2011.svg')" }}></div> {/* Using generic map placeholder */}
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
                                <p className="text-sm font-bold text-primary">CG Road (High Demand)</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Link to="/delivery/earnings" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Today's Earnings</p>
                            <h3 className="text-xl font-bold text-dark">₹{todaysEarnings}</h3>
                        </Link>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs">Orders</p>
                            <h3 className="text-xl font-bold text-dark">{ordersCount}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs">Ride Time</p>
                            <h3 className="text-xl font-bold text-dark">{rideTime}</h3>
                        </div>
                        <Link to="/delivery/profile" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer">
                            <p className="text-gray-500 text-xs">Profile & Ratings</p>
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold text-dark">4.8</span>
                                <span className="text-yellow-500">★</span>
                            </div>
                        </Link>
                    </div>

                    {/* Active Order Card */}
                    {activeOrder ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden mb-8 animate-fadeIn">
                            <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-primary/10">
                                <div>
                                    <h3 className="font-bold text-lg text-dark">Active Order #{activeOrder.id}</h3>
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
                                            <h4 className="font-bold text-lg">{activeOrder.restaurant.name}</h4>
                                            <p className="text-gray-500 text-sm">{activeOrder.restaurant.address}</p>
                                            {['accepted', 'arrived_at_restaurant'].includes(activeOrder.status) && (
                                                <div className="mt-2 flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${activeOrder.restaurant.address}`, '_blank')}>
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
                                            <h4 className="font-bold text-lg">{activeOrder.customer.name}</h4>
                                            <p className="text-gray-500 text-sm">{activeOrder.customer.address}</p>
                                            {['picked_up', 'arrived_at_customer'].includes(activeOrder.status) && (
                                                <div className="mt-2 flex gap-2 flex-wrap">
                                                    <Button size="sm" variant="outline" onClick={() => window.open(`https://maps.google.com/?q=${activeOrder.customer.address}`, '_blank')}>
                                                        <Navigation size={14} className="mr-1" /> Navigate
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                        <Phone size={14} className="mr-1" /> Call Customer
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => setShowChatModal(true)}>
                                                        <MessageSquare size={14} className="mr-1" /> Message
                                                    </Button>
                                                    {activeOrder.status === 'picked_up' && (
                                                        <Button size="sm" variant="primary" onClick={() => handleStatusUpdate('arrived_at_customer')}>
                                                            Arrived at Location
                                                        </Button>
                                                    )}
                                                    {activeOrder.status === 'arrived_at_customer' && (
                                                        <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700 border-green-600" onClick={() => {
                                                            handleStatusUpdate('delivered');
                                                            setTimeout(() => setActiveOrder(null), 2000); // Clear order after delivery
                                                        }}>
                                                            Complete Delivery
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
                                    <p className="font-bold mb-2">Order Items:</p>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {activeOrder.items.map((item, idx) => (
                                            <li key={idx}>{item.qty}x {item.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Navigation className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Waiting for orders...</h3>
                            <p className="text-gray-500 mt-2">You are online and visible to nearby restaurants.</p>
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
                {showNewOrderModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-slideUp md:animate-fadeIn">
                            <div className="bg-primary p-4 text-white text-center">
                                <h3 className="font-bold text-xl animate-pulse">New Delivery Request!</h3>
                                <p className="text-sm opacity-90">30 seconds to accept</p>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-primary">₹35.00</h2>
                                    <p className="text-gray-500 text-sm">Est. Earning (Incl. Tips)</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                <MapPin className="text-orange-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-sm">Burger King</p>
                                                <p className="text-xs text-gray-500">2.5 km away</p>
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
                                                <p className="text-xs text-gray-500">5.1 km trip</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" onClick={() => setShowNewOrderModal(false)} className="justify-center border-red-200 text-red-600 hover:bg-red-50">
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
                {/* Chat Modal */}
                {showChatModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col h-[500px] overflow-hidden shadow-2xl relative animate-fadeIn">
                            <div className="bg-primary p-4 text-white flex justify-between items-center shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                                        {activeOrder?.customer?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{activeOrder?.customer?.name || 'Customer'}</h3>
                                        <p className="text-xs text-white/80">Online</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                                <div className="text-center text-xs text-gray-400 mb-2">Today</div>
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.sender === 'rider' ? 'bg-primary text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'}`}>
                                        <p>{msg.text}</p>
                                        <span className={`text-[10px] block mt-1 ${msg.sender === 'rider' ? 'text-white/70 text-right' : 'text-gray-400'}`}>{msg.time}</span>
                                    </div>
                                ))}
                            </div>
                            
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
