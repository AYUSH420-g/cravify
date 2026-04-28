import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Package, MapPin, Star, Settings, LogOut, Plus, Trash2, X, Home, Briefcase, Clock, Wallet, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import RateFoodModal from '../components/RateFoodModal';

const Profile = () => {
    const { token, user: authUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const isAdmin = authUser?.role === 'admin';
    const isRider = authUser?.role === 'delivery_partner';
    const isVendor = authUser?.role === 'restaurant_partner';
    
    const [orders, setOrders] = useState([]);
    const completedOrders = orders.filter(o => o.status === 'Delivered');
    const totalRevenue = completedOrders.reduce((sum, o) => {
        const isFreeDelivery = o.offerCode === 'FREE_DELIVERY' || o.itemTotal >= 500;
        const net = o.itemTotal - (isFreeDelivery ? (o.deliveryEarning || 0) : 0);
        return sum + net;
    }, 0);
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status));
    
    const isSpecialRole = isAdmin || isRider || isVendor;
    const [activeTab, setActiveTab] = useState(isSpecialRole ? 'settings' : 'orders');
    const [walletHistory, setWalletHistory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Address form
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', zip: '', type: 'Home' });
    const [addressSubmitting, setAddressSubmitting] = useState(false);

    // Review modal
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (token) {
            fetchProfile();
            fetchOrders();
            fetchWalletHistory();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/customer/profile', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) setProfile(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchWalletHistory = async () => {
        try {
            const res = await fetch('/api/customer/wallet/history', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) setWalletHistory(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/customer/orders', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!token) {
            alert('Please log in to add an address.');
            navigate('/login');
            return;
        }
        setAddressSubmitting(true);
        try {
            let location = null; // Backend geocodes as fallback
            try {
                const query = encodeURIComponent(`${newAddress.street}, ${newAddress.city}, IND`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    location = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
                }
            } catch (geoErr) {
                console.error('Geocoding failed, backend will retry', geoErr);
            }

            const res = await fetch('/api/customer/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ ...newAddress, location })
            });
            const data = await res.json();
            if (res.ok) {
                setProfile({ ...profile, addresses: data.addresses });
                setShowAddressModal(false);
                setNewAddress({ street: '', city: '', zip: '', type: 'Home' });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAddressSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Remove this address?')) return;
        try {
            const res = await fetch(`/api/customer/addresses/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setProfile({ ...profile, addresses: data.addresses });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRateOrder = (order) => {
        setSelectedOrder(order);
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            const res = await fetch(`/api/customer/orders/${reviewData.orderId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    restaurantRating: reviewData.restaurantRating,
                    deliveryRating: reviewData.deliveryRating,
                    comment: reviewData.comment
                })
            });
            
            const data = await res.json();
            if (res.ok) {
                alert('Thank you for your feedback!');
                fetchOrders(); // Refresh to hide the rate button
            } else {
                alert(data.message || 'Failed to submit rating');
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting rating');
        }
    };

    const handleLogout = () => {
        if (logout) logout();
        navigate('/login');
    };
    
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('500');
    const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);

    const handleTopUp = async () => {
        if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) return;
        setIsTopUpProcessing(true);

        try {
            // 1. Create Razorpay order on backend
            const res = await fetch('/api/payment/wallet/topup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ amount: Number(topUpAmount) })
            });
            const data = await res.json();
            
            if (!res.ok) {
                alert(data.message || 'Failed to initiate payment');
                setIsTopUpProcessing(false);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "Cravify Wallet",
                description: "Top up your wallet",
                order_id: data.orderId,
                handler: async function (response) {
                    // 3. Verify payment on backend
                    const verifyRes = await fetch('/api/payment/wallet/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentId: data.paymentId
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok) {
                        setProfile({ ...profile, walletBalance: verifyData.newBalance });
                        fetchWalletHistory();
                        setIsTopUpProcessing(false);
                        setShowTopUpModal(false);
                        alert(`Successfully added ₹${topUpAmount} to your wallet!`);
                    } else {
                        alert(verifyData.message || 'Payment verification failed');
                        setIsTopUpProcessing(false);
                    }
                },
                prefill: {
                    name: profile?.name,
                    email: profile?.email,
                    contact: profile?.phone
                },
                theme: { color: "#ea2c3a" },
                modal: {
                    ondismiss: function () {
                        setIsTopUpProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (e) {
            console.error('Wallet top-up error:', e);
            alert('Something went wrong. Please try again.');
            setIsTopUpProcessing(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-600';
            case 'Placed': return 'bg-blue-100 text-blue-700';
            case 'Preparing': return 'bg-orange-100 text-orange-700';
            case 'OutForDelivery': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = (status) => {
        if (status === 'OutForDelivery') return 'Out For Delivery';
        return status;
    };

    const getAddressIcon = (type) => {
        if (type === 'Work') return <Briefcase size={16} className="notranslate" />;
        return <Home size={16} className="notranslate" />;
    };

    const userName = profile?.name || authUser?.name || 'User';
    const userEmail = profile?.email || authUser?.email || '';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 bg-dark text-white text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-4 border-4 border-white/10 flex items-center justify-center text-2xl font-bold">{initials}</div>
                                    <h2 className="text-xl font-bold">{userName}</h2>
                                    <p className="text-gray-400 text-sm">{userEmail}</p>
                                    {(isVendor || isAdmin) && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-sm text-gray-400">Net Revenue <small>(Delivered)</small></p>
                                            <h3 className="text-xl font-bold text-white">₹{totalRevenue.toFixed(0)}</h3>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2">
                                    {!isSpecialRole && (
                                        <>
                                            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                <Package size={20} /> {t('orders')}
                                            </button>
                                            <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'addresses' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                <MapPin size={20} /> {t('addresses')}
                                            </button>
                                            <button onClick={() => setActiveTab('wallet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'wallet' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                <Wallet size={20} /> {t('wallet')}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Settings size={20} /> {authUser?.role === 'admin' ? 'Account Settings' : t('settings')}
                                    </button>
                                    
                                    <div className="h-px bg-gray-100 my-2" />
                                    
                                    {!isSpecialRole && (
                                        <div className="px-4 py-4 space-y-4">
                                            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                                                <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
                                                    <Sparkles size={16} className="notranslate" /> ESG Impact
                                                </div>
                                                <p className="text-2xl font-black text-green-600 leading-tight notranslate">
                                                    {profile?.plasticItemsSaved || 0}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-green-500">Plastic pieces saved</p>
                                            </div>

                                            {!isSpecialRole && (
                                                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-2">
                                                    <div className="flex items-center justify-between text-blue-700 font-bold mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <Wallet size={16} className="notranslate" /> Wallet
                                                        </div>
                                                        <button
                                                            onClick={() => setShowTopUpModal(true)}
                                                            className="p-1 hover:bg-blue-100 rounded-lg transition-colors notranslate"
                                                            title="Top Up"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-2xl font-black text-blue-600 leading-tight notranslate">
                                                        ₹{profile?.walletBalance || 0}
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500">Available Credits</p>
                                                </div>
                                            )}

                                            {profile?.referralCode && !(isAdmin || isRider) && (
                                                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                                                    <div className="flex items-center gap-2 text-purple-700 font-bold mb-1">
                                                        <Star size={16} className="notranslate" /> Referral Code
                                                    </div>
                                                    <p className="text-lg font-black text-purple-600 tracking-widest uppercase notranslate">
                                                        {profile.referralCode}
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-purple-500">Invite & Earn ₹50</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-100 my-2" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
                                        <LogOut size={20} /> {t('logout')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="md:col-span-3">
                            <h2 className="text-2xl font-bold text-dark mb-6">
                                {activeTab === 'orders' ? 'Past Orders' :
                                    activeTab === 'addresses' ? 'Saved Addresses' : 'Settings'}
                            </h2>

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    {loading ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                                            Loading your orders...
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p className="text-gray-500 text-lg font-medium">No orders yet</p>
                                            <p className="text-gray-400 text-sm mt-1">Your order history will appear here</p>
                                        </div>
                                    ) : (
                                        orders.map((order) => (
                                            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <img
                                                        src={order.restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80'}
                                                        className="w-full md:w-48 h-32 rounded-xl object-cover"
                                                        alt={order.restaurant?.name || 'Restaurant'}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-dark">{order.restaurant?.name || 'Restaurant'}</h3>
                                                                <p className="text-gray-500 text-sm flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <span className={`px-3 py-1 text-xs font-bold rounded uppercase ${getStatusStyle(order.status)}`}>
                                                                {getStatusLabel(order.status)}
                                                            </span>
                                                        </div>

                                                        {order.status === 'Rejected' && order.rejectionReason && (
                                                            <div className="mt-2 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 italic">
                                                                REJECTION REASON: {order.rejectionReason}
                                                            </div>
                                                        )}

                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                        </p>

                                                        <p className="text-xs text-gray-400 mb-3">
                                                            Order #{order._id.slice(-8).toUpperCase()} • {order.paymentMethod}
                                                            {order.distanceKm > 0 && ` • ${order.distanceKm} km`}
                                                        </p>

                                                        {/* Bill Breakdown */}
                                                        {order.itemTotal > 0 && (
                                                            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5 text-xs">
                                                                <div className="flex justify-between text-gray-500">
                                                                    <span>Item Total</span>
                                                                    <span>₹{order.itemTotal}</span>
                                                                </div>
                                                                <div className="flex justify-between text-gray-500">
                                                                    <span>Delivery Fee</span>
                                                                    <span className={order.deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                                                                        {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-gray-500">
                                                                    <span>Platform Fee</span><span>₹{order.platformFee}</span>
                                                                </div>
                                                                <div className="flex justify-between text-gray-500">
                                                                    <span>GST</span><span>₹{order.gst}</span>
                                                                </div>
                                                                {order.offerDiscount > 0 && (
                                                                    <div className="flex justify-between text-green-600 font-bold">
                                                                        <span>Offer ({order.offerCode})</span><span>-₹{order.offerDiscount}</span>
                                                                    </div>
                                                                )}
                                                                {order.loyaltyPointsUsed > 0 && (
                                                                    <div className="flex justify-between text-green-600 font-bold">
                                                                        <span>Loyalty Points</span><span>-₹{order.loyaltyPointsUsed}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                            <span className="font-bold text-dark text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                                                            <div className="flex gap-3">
                                                                {order.status === 'Delivered' && !order.restaurantRating && (
                                                                    <Button variant="outline" size="sm" onClick={() => handleRateOrder(order)}>Rate Order</Button>
                                                                )}
                                                                {order.restaurantRating && (
                                                                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm bg-yellow-50 px-3 py-1 rounded-lg">
                                                                        <Star size={14} className="fill-current" />
                                                                        <span>Rated {order.restaurantRating}/5</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* ADDRESSES TAB */}
                            {activeTab === 'addresses' && (
                                <div className="space-y-4">
                                    <div className="flex justify-end mb-2">
                                        <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowAddressModal(true)}>
                                            <Plus size={18} /> Add Address
                                        </Button>
                                    </div>

                                    {(!profile?.addresses || profile.addresses.length === 0) ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                            <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p className="text-gray-500 text-lg font-medium">No addresses saved yet</p>
                                            <p className="text-gray-400 text-sm mt-1">Add a delivery address to get started</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {profile.addresses.map((addr) => (
                                                <div key={addr._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative group">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                            {getAddressIcon(addr.type)}
                                                        </div>
                                                        <span className="font-bold text-dark">{addr.type}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm">{addr.street}</p>
                                                    <p className="text-gray-500 text-sm">{addr.city}{addr.zip ? `, ${addr.zip}` : ''}</p>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr._id)}
                                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Address Modal */}
                                    {showAddressModal && (
                                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
                                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-xl font-bold text-dark">Add New Address</h2>
                                                    <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-dark">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                                <form onSubmit={handleAddAddress} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                                                        <select
                                                            className="w-full border rounded-xl px-4 py-2"
                                                            value={newAddress.type}
                                                            onChange={e => setNewAddress({...newAddress, type: e.target.value})}
                                                        >
                                                            <option value="Home">🏠 Home</option>
                                                            <option value="Work">💼 Work</option>
                                                            <option value="Other">📍 Other</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                                        <input
                                                            type="text" required
                                                            className="w-full border rounded-xl px-4 py-2"
                                                            placeholder="123, Main Road, Area Name"
                                                            value={newAddress.street}
                                                            onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                            <input
                                                                type="text" required
                                                                className="w-full border rounded-xl px-4 py-2"
                                                                placeholder="Ahmedabad"
                                                                value={newAddress.city}
                                                                onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                                            <input
                                                                type="text" required
                                                                className="w-full border rounded-xl px-4 py-2"
                                                                placeholder="380009"
                                                                value={newAddress.zip}
                                                                onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" variant="primary" className="w-full py-3" disabled={addressSubmitting}>
                                                        {addressSubmitting ? 'Saving...' : 'Save Address'}
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* WALLET HISTORY TAB */}
                            {activeTab === 'wallet' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-gray-500 text-sm">Your recent transactions and rewards</p>
                                        <Button variant="outline" size="sm" onClick={() => setShowTopUpModal(true)} className="flex items-center gap-2">
                                            <Plus size={16} /> Top Up Wallet
                                        </Button>
                                    </div>

                                    {walletHistory.length === 0 ? (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                            <Wallet size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p className="text-gray-500 text-lg font-medium">No transactions yet</p>
                                            <p className="text-gray-400 text-sm mt-1">Earn ₹50 for every friend you invite!</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4 font-bold">Details</th>
                                                        <th className="px-6 py-4 font-bold">Type</th>
                                                        <th className="px-6 py-4 font-bold">Amount</th>
                                                        <th className="px-6 py-4 font-bold">Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {walletHistory.map((tx) => (
                                                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-dark text-sm">{tx.description}</p>
                                                                <p className="text-[10px] text-gray-400">
                                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                    {tx.type}
                                                                </span>
                                                            </td>
                                                            <td className={`px-6 py-4 font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-gray-700 text-sm">
                                                                ₹{tx.balanceAfter}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <div className="space-y-8">
                                        {/* Security / Change Password (Always visible for Admin) */}
                                        <div className="skiptranslate">
                                            <h4 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
                                                <Settings size={16} className="text-primary" /> Security & Authentication
                                            </h4>
                                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 max-w-md">
                                                <p className="text-sm font-bold text-dark mb-4">Change Account Password</p>
                                                <div className="space-y-4">
                                                    <input type="password" placeholder="Current Password" disabled className="w-full border rounded-xl px-4 py-2 text-sm bg-white" />
                                                    <input type="password" placeholder="New Password" disabled className="w-full border rounded-xl px-4 py-2 text-sm bg-white" />
                                                    <Button variant="outline" size="sm" className="w-full" onClick={() => alert('Password change feature is currently in maintenance mode for security updates.')}>
                                                        Update Password
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Theme & Language (Only for non-admins or as extra) */}
                                        <div className="pt-8 border-t border-gray-100 skiptranslate">
                                            <h4 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
                                                <Sparkles size={16} className="text-primary" /> {t('theme')} & {t('language')}
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 notranslate">
                                                {/* Theme Toggle */}
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div>
                                                        <p className="font-bold text-sm text-dark">{t('theme')}</p>
                                                        <p className="text-xs text-gray-500">{isDarkMode ? t('dark_mode') : t('light_mode')}</p>
                                                    </div>
                                                    <button 
                                                        onClick={toggleTheme}
                                                        className={`w-14 h-8 rounded-full p-1 transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
                                                    >
                                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                                                            {isDarkMode ? '🌙' : '☀️'}
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Language Selector */}
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div>
                                                        <p className="font-bold text-sm text-dark">{t('language')}</p>
                                                        <p className="text-xs text-gray-500">{language === 'en' ? 'English' : 'हिंदी'}</p>
                                                    </div>
                                                    <select 
                                                        value={language}
                                                        onChange={(e) => setLanguage(e.target.value)}
                                                        className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold outline-none text-dark"
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="hi">हिंदी</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-400 mt-4 italic">Detailed account editing coming soon.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RateFoodModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
                order={selectedOrder || {}}
            />

            {/* TOP-UP MODAL (Mock Payment) */}
            {showTopUpModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
                        <div className="bg-blue-600 p-8 text-white text-center relative">
                            <button 
                                onClick={() => !isTopUpProcessing && setShowTopUpModal(false)} 
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                                disabled={isTopUpProcessing}
                            >
                                <X size={24} />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wallet size={32} />
                            </div>
                            <h2 className="text-2xl font-bold">Top Up Wallet</h2>
                            <p className="text-blue-100 text-sm">Mock Payment Gateway (Dev Mode)</p>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            {!isTopUpProcessing ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enter Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full text-4xl font-black text-dark border-none focus:ring-0 p-0 placeholder:text-gray-200"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {['100', '500', '1000'].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setTopUpAmount(amt)}
                                                className={`py-2 rounded-xl border-2 font-bold transition-all ${topUpAmount === amt ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <Button 
                                        variant="primary" 
                                        className="w-full py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                        onClick={handleTopUp}
                                    >
                                        Proceed to Pay ₹{topUpAmount}
                                    </Button>
                                    <p className="text-center text-[10px] text-gray-400 font-medium">This is a simulated transaction for testing purposes.</p>
                                </>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-lg font-bold text-dark">Processing Payment...</p>
                                    <p className="text-gray-500 text-sm animate-pulse">Contacting Mock Bank Servers</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Profile;
