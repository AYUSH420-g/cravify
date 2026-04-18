import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Home, Briefcase, MapPin, CreditCard, Wallet, Banknote, CheckCircle, Plus, X, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ADDRESS_ICONS = {
    Home: Home,
    Work: Briefcase,
    Other: MapPin,
};

const Checkout = () => {
    const { cartItems, restaurant, cartTotal, clearCart } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [placing, setPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Add-address modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', zip: '', type: 'Home' });
    const [addingAddress, setAddingAddress] = useState(false);

    const deliveryFee = 40;
    const platformFee = 5;
    const gst = Math.round(cartTotal * 0.05);
    const totalToPay = cartTotal + deliveryFee + platformFee + gst;

    const paymentMethodMap = { upi: 'UPI', card: 'Card', cod: 'COD' };

    // ── Fetch saved addresses on mount ──
    useEffect(() => {
        if (!token) {
            setLoadingAddresses(false);
            return;
        }
        const fetchAddresses = async () => {
            try {
                const res = await fetch('/api/customer/profile', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (res.ok && data.addresses) {
                    setAddresses(data.addresses);
                    if (data.addresses.length > 0) {
                        setSelectedAddressId(data.addresses[0]._id);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch addresses', e);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [token]);

    // ── Add new address ──
    const handleAddAddress = async () => {
        if (!newAddress.street || !newAddress.city || !newAddress.zip) {
            alert('Please fill all address fields.');
            return;
        }
        setAddingAddress(true);
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
                setAddresses(data.addresses);
                // select the newly added address (last in the array)
                const added = data.addresses[data.addresses.length - 1];
                setSelectedAddressId(added._id);
                setShowAddModal(false);
                setNewAddress({ street: '', city: '', zip: '', type: 'Home' });
            } else {
                alert(data.message || 'Failed to add address');
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong adding address.');
        } finally {
            setAddingAddress(false);
        }
    };

    // ── Delete an address ──
    const handleDeleteAddress = async (id) => {
        try {
            const res = await fetch(`/api/customer/addresses/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setAddresses(data.addresses);
                if (selectedAddressId === id) {
                    setSelectedAddressId(data.addresses.length > 0 ? data.addresses[0]._id : null);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ── Place Order ──
    const handlePlaceOrder = async () => {
        if (!token) {
            alert('Please log in to place an order.');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const selectedAddr = addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddr) {
            alert('Please select a delivery address.');
            return;
        }

        setPlacing(true);

        try {
            const restaurantId = restaurant._id || restaurant.id;
            const items = cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    restaurantId,
                    items,
                    deliveryAddress: {
                        street: selectedAddr.street,
                        city: selectedAddr.city,
                        zip: selectedAddr.zip
                    },
                    paymentMethod: paymentMethodMap[selectedPayment]
                })
            });

            const data = await res.json();
            if (res.ok) {
                setOrderPlaced(true);
                clearCart();
                setTimeout(() => navigate('/order-tracking'), 3000);
            } else {
                alert(data.message || 'Failed to place order');
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    // ── Order placed success screen ──
    if (orderPlaced) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-section flex items-center justify-center">
                    <div className="text-center bg-white p-12 rounded-3xl shadow-lg border border-gray-100 max-w-md">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-dark mb-2">Order Placed Successfully! 🎉</h2>
                        <p className="text-gray-500 mb-6">Your order has been sent to the restaurant. They will start preparing it shortly.</p>
                        <p className="text-sm text-gray-400">Redirecting to order tracking...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // ── Empty cart ──
    if (cartItems.length === 0) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-section flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-dark mb-4">Your cart is empty</h2>
                        <Button variant="primary" onClick={() => navigate('/')}>Browse Restaurants</Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-dark mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Address & Payment */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* ─── Address Section ─── */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        <MapPin className="text-dark" /> Select Address
                                    </h2>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-red-700 transition-colors cursor-pointer"
                                    >
                                        <Plus size={16} /> Add New
                                    </button>
                                </div>

                                {loadingAddresses ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 size={28} className="animate-spin text-primary" />
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-10">
                                        <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 mb-4">No saved addresses yet</p>
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors cursor-pointer"
                                        >
                                            <Plus size={16} /> Add Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map(addr => {
                                            const Icon = ADDRESS_ICONS[addr.type] || MapPin;
                                            const isSelected = selectedAddressId === addr._id;
                                            return (
                                                <div
                                                    key={addr._id}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${isSelected ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                                    onClick={() => setSelectedAddressId(addr._id)}
                                                >
                                                    {/* Delete button */}
                                                    <button
                                                        className="absolute top-3 right-3 p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAddress(addr._id);
                                                        }}
                                                        title="Remove address"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Icon size={16} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                                                        <span className="font-bold">{addr.type || 'Address'}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                        {addr.street}, {addr.city}, {addr.zip}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ─── Payment Section ─── */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                    <Wallet className="text-dark" /> Payment Method
                                </h2>

                                <div className="space-y-3">
                                    <div
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'upi' ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedPayment('upi')}
                                    >
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="font-bold text-xs text-primary">UPI</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">UPI</h3>
                                            <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'upi' ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedPayment === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'card' ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedPayment('card')}
                                    >
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <CreditCard size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Credit / Debit Card</h3>
                                            <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedPayment === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'cod' ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedPayment('cod')}
                                    >
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <Banknote size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Cash on Delivery</h3>
                                            <p className="text-sm text-gray-500">Pay cash at your doorstep</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedPayment === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="font-bold text-lg mb-4">{restaurant?.name || 'Restaurant'}</h3>
                                <p className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">Ordered items</p>

                                <div className="space-y-4 mb-6">
                                    {cartItems.map(item => (
                                        <div key={item._id || item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.name} x {item.quantity}</span>
                                            <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Item Total</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Delivery Fee</span>
                                        <span>₹{deliveryFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Service Tax</span>
                                        <span>₹{gst.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between font-bold text-xl py-6">
                                    <span>To Pay</span>
                                    <span>₹{totalToPay.toFixed(2)}</span>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={handlePlaceOrder}
                                    disabled={placing || !selectedAddressId}
                                >
                                    {placing ? 'Placing Order...' : 'Place Order'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Add Address Modal ─── */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <MapPin size={18} className="text-primary" /> Add New Address
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Type selector */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-2 block">Address Type</label>
                                <div className="flex gap-3">
                                    {['Home', 'Work', 'Other'].map(type => {
                                        const Icon = ADDRESS_ICONS[type];
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setNewAddress(p => ({ ...p, type }))}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${newAddress.type === type ? 'border-primary bg-red-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                            >
                                                <Icon size={14} /> {type}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Street */}
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Street / Area</label>
                                <input
                                    type="text"
                                    value={newAddress.street}
                                    onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))}
                                    placeholder="e.g. 123, MG Road, Navrangpura"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            {/* City & ZIP */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">City</label>
                                    <input
                                        type="text"
                                        value={newAddress.city}
                                        onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))}
                                        placeholder="Ahmedabad"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">ZIP Code</label>
                                    <input
                                        type="text"
                                        value={newAddress.zip}
                                        onChange={e => setNewAddress(p => ({ ...p, zip: e.target.value }))}
                                        placeholder="380009"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddAddress}
                                disabled={addingAddress}
                                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                {addingAddress ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Checkout;
