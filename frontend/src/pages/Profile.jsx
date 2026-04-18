import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Package, MapPin, Star, Settings, LogOut, Plus, Trash2, X, Home, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RateFoodModal from '../components/RateFoodModal';

const Profile = () => {
    const { token, user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
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

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/customer/orders', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setAddressSubmitting(true);
        try {
            const res = await fetch('/api/customer/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newAddress)
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

    const handleSubmitReview = (reviewData) => {
        console.log('Review Submitted:', reviewData);
        alert('Thank you for your feedback!');
    };

    const handleLogout = () => {
        if (logout) logout();
        navigate('/login');
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
        if (type === 'Work') return <Briefcase size={16} />;
        return <Home size={16} />;
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
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Package size={20} /> Orders
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('addresses')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'addresses' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <MapPin size={20} /> Addresses
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <Settings size={20} /> Settings
                                    </button>
                                    <div className="h-px bg-gray-100 my-2" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
                                        <LogOut size={20} /> Logout
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

                                                        <p className="text-gray-600 text-sm mb-2">
                                                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                                        </p>

                                                        <p className="text-xs text-gray-400 mb-4">
                                                            Order #{order._id.slice(-8).toUpperCase()} • {order.paymentMethod}
                                                        </p>

                                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                            <span className="font-bold text-dark text-lg">₹{order.totalAmount.toFixed(2)}</span>
                                                            <div className="flex gap-3">
                                                                {order.status === 'Delivered' && (
                                                                    <Button variant="outline" size="sm" onClick={() => handleRateOrder(order)}>Rate Order</Button>
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

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input type="text" className="w-full border rounded-xl px-4 py-2 bg-gray-50" value={userName} disabled />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" className="w-full border rounded-xl px-4 py-2 bg-gray-50" value={userEmail} disabled />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input type="text" className="w-full border rounded-xl px-4 py-2 bg-gray-50" value={profile?.phone || 'Not set'} disabled />
                                        </div>
                                        <p className="text-sm text-gray-400">Account settings editing coming soon.</p>
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
        </MainLayout>
    );
};

export default Profile;
