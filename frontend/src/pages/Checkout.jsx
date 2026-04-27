import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Home, Briefcase, MapPin, CreditCard, Wallet, Banknote, CheckCircle, Plus, X, Trash2, Loader2, Gift, Star, Sparkles, Clock } from 'lucide-react';
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
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [profile, setProfile] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [deliveryLocation, setDeliveryLocation] = useState(null);

    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [placing, setPlacing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);

    // Loyalty
    const [loyaltyBalance, setLoyaltyBalance] = useState(0);
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);

    // ESG & Tips
    const [noCutlery, setNoCutlery] = useState(false);
    const [tipAmount, setTipAmount] = useState(0);

    // Add-address modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPromoList, setShowPromoList] = useState(false);
    const [availableOffers, setAvailableOffers] = useState([]);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', zip: '', type: 'Home' });
    const [addingAddress, setAddingAddress] = useState(false);
    const [deliveryInstructions, setDeliveryInstructions] = useState([]); // New state for instructions

    // Offer / Dynamic fees
    const [offerCode, setOfferCode] = useState('');
    const [appliedOffer, setAppliedOffer] = useState('');
    const [feeBreakdown, setFeeBreakdown] = useState(null);
    const [feeLoading, setFeeLoading] = useState(false);

    const [systemSettings, setSystemSettings] = useState(null);
    const deliveryFee = feeBreakdown ? feeBreakdown.deliveryFee : (cartTotal >= 500 ? 0 : 40);
    const platformFee = feeBreakdown?.platformFee ?? systemSettings?.platformFee ?? 5;
    const gst = feeBreakdown?.gst ?? Math.round((cartTotal + deliveryFee + platformFee) * 0.18);
    const offerDiscount = feeBreakdown?.offerDiscount ?? (cartTotal >= 500 ? (feeBreakdown?.deliveryFee ?? 0) : 0);
    const distanceKm = feeBreakdown?.distanceKm ?? 0;
    const loyaltyDiscount = usePoints ? Math.min(redeemPoints, Math.floor((cartTotal + deliveryFee + platformFee + gst - offerDiscount) * 0.5)) : 0;
    const totalToPay = Math.max(0, cartTotal + deliveryFee + platformFee + gst - offerDiscount - loyaltyDiscount + Number(tipAmount));
    const pointsWillEarn = Math.floor(cartTotal / 10);

    // ── Fetch saved addresses + loyalty on mount ──
    useEffect(() => {
        if (!token) {
            setLoadingAddresses(false);
            return;
        }
        const fetchData = async () => {
            try {
                const [profileRes, loyaltyRes, settingsRes] = await Promise.all([
                    fetch('/api/customer/profile', { headers: { 'x-auth-token': token } }),
                    fetch('/api/loyalty/balance', { headers: { 'x-auth-token': token } }),
                    fetch('/api/admin/settings/public')
                ]);
                const profileData = await profileRes.json();
                if (profileRes.ok) {
                    setProfile(profileData);
                    if (profileData.addresses) {
                        setAddresses(profileData.addresses);
                        if (profileData.addresses.length > 0) {
                            setSelectedAddressId(profileData.addresses[0]._id);
                        }
                    }
                }
                const loyaltyData = await loyaltyRes.json();
                if (loyaltyRes.ok) {
                    setLoyaltyBalance(loyaltyData.points || 0);
                    setRedeemPoints(loyaltyData.points || 0);
                }
                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setSystemSettings(settingsData);
                }
            } catch (e) {
                console.error('Failed to fetch data', e);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchData();
    }, [token]);

    // Recalculate fees when address or offer changes
    useEffect(() => {
        if (!token || !restaurant || cartItems.length === 0) return;
        const selectedAddr = addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddr) return;

        const calcFees = async () => {
            setFeeLoading(true);
            try {
                const res = await fetch('/api/customer/calculate-fees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({
                        restaurantId: restaurant._id || restaurant.id,
                        deliveryPincode: selectedAddr.zip,
                        itemTotal: cartTotal,
                        offerCode: appliedOffer,
                        paymentMethod: selectedPayment === 'razorpay' ? 'Razorpay' : 'COD',
                        deliveryLocation // Send coordinates for precise distance
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setFeeBreakdown(data.breakdown);
                } else if (!res.ok) {
                    if (appliedOffer) {
                        alert(data.message || 'Invalid promo code');
                        setAppliedOffer('');
                        setOfferCode('');
                    }
                }
            } catch (e) {
                console.error('Fee calc failed:', e);
            } finally {
                setFeeLoading(false);
            }
        };
        calcFees();
    }, [selectedAddressId, appliedOffer, cartTotal, selectedPayment, deliveryLocation]);

    // Browser geolocation as a fallback
    const [browserLocation, setBrowserLocation] = useState(null);
    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setBrowserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (err) => {
                console.warn('Unable to capture delivery coordinates', err?.message || err);
            },
            { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 }
        );
    }, []);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch('/api/customer/offers');
                const data = await res.json();
                if (res.ok) setAvailableOffers(data.offers || []);
            } catch (e) { console.error('Promo fetch failed:', e); }
        };
        fetchOffers();
    }, []);

    const PromoListModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-primary p-6 text-white text-center relative">
                    <button onClick={() => setShowPromoList(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">✕</button>
                    <Gift className="mx-auto mb-2" size={32} />
                    <h2 className="text-2xl font-black italic uppercase">Available Coupons</h2>
                    <p className="text-red-100 text-xs">Save more on your delicious cravings!</p>
                </div>
                <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 custom-scrollbar">
                    {availableOffers.map((offer, idx) => (
                        <div key={idx} className="border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-primary/30 transition-colors relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">{offer.code}</span>
                                    <h3 className="font-bold text-dark mt-1">{offer.title}</h3>
                                </div>
                                <button 
                                    onClick={() => {
                                        setOfferCode(offer.code);
                                        setAppliedOffer(offer.code);
                                        setShowPromoList(false);
                                    }}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    APPLY
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{offer.description}</p>
                            <div className="pt-2 border-t border-gray-50 text-[9px] text-gray-400 font-medium">
                                <ul>
                                    <li>• Min order: ₹{offer.minOrder}</li>
                                    <li>• Max discount: ₹200</li>
                                    <li>• Standard T&C Apply</li>
                                </ul>
                            </div>
                        </div>
                    ))}
                    {availableOffers.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No special promos right now. Check back soon!</p>
                    )}
                </div>
                <div className="p-6 bg-gray-50">
                    <button onClick={() => setShowPromoList(false)} className="w-full py-3 bg-dark text-white rounded-xl font-bold text-sm">Close</button>
                </div>
            </div>
        </div>
    );

    // Sync deliveryLocation with selected address's geocoded coordinates
    useEffect(() => {
        if (selectedAddressId && addresses.length > 0) {
            const selectedAddr = addresses.find(a => a._id === selectedAddressId);
            if (selectedAddr?.location?.lat && selectedAddr?.location?.lng) {
                setDeliveryLocation(selectedAddr.location);
            } else if (browserLocation) {
                setDeliveryLocation(browserLocation);
            }
        } else if (browserLocation) {
            setDeliveryLocation(browserLocation);
        }
    }, [selectedAddressId, addresses, browserLocation]);

    // ── Add new address ──
    const handleAddAddress = async () => {
        if (!token) {
            alert('Please log in to add an address.');
            navigate('/login');
            return;
        }
        if (!newAddress.street || !newAddress.city || !newAddress.zip) {
            alert('Please fill all address fields.');
            return;
        }
        setAddingAddress(true);
        try {
            let location = null; // Backend will geocode if null
            try {
                const query = encodeURIComponent(`${newAddress.street}, ${newAddress.city}, IND`);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    location = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
                }
            } catch (geoErr) {
                console.error('Geocoding failed', geoErr);
                // Backend will attempt geocoding as fallback
            }

            const res = await fetch('/api/customer/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ ...newAddress, location })
            });
            const data = await res.json();
            if (res.ok) {
                setAddresses(data.addresses);
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

    // ── Load Razorpay script dynamically ──
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // ── Place Order (COD) ──
    const handlePlaceOrderCOD = async () => {
        const selectedAddr = addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddr) { alert('Please select a delivery address.'); return; }

        setPlacing(true);
        try {
            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    restaurantId: restaurant._id || restaurant.id,
                    items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
                    deliveryAddress: { street: selectedAddr.street, city: selectedAddr.city, zip: selectedAddr.zip },
                    deliveryLocation,
                    paymentMethod: 'COD',
                    loyaltyPointsToRedeem: loyaltyDiscount,
                    offerCode: appliedOffer,
                    noCutlery,
                    tipAmount: Number(tipAmount),
                    deliveryInstructions: deliveryInstructions.join(', ') // Send instructions
                })
            });
            const data = await res.json();
            if (res.ok) {
                setEarnedPoints(data.pointsEarned || 0);
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

    // ── Place Order (Razorpay) ──
    const handlePlaceOrderRazorpay = async () => {
        const selectedAddr = addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddr) { alert('Please select a delivery address.'); return; }

        setPlacing(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('Failed to load Razorpay. Please check your internet connection.');
                setPlacing(false);
                return;
            }

            // Step 1: Create Razorpay order
            const createRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    amount: totalToPay,
                    loyaltyPointsToRedeem: loyaltyDiscount
                })
            });
            const createData = await createRes.json();
            if (!createRes.ok) {
                alert(createData.message || 'Failed to create payment');
                setPlacing(false);
                return;
            }

            // Step 2: Open Razorpay popup
            const options = {
                key: createData.key,
                amount: createData.amount,
                currency: createData.currency,
                name: 'Cravify',
                description: `Order from ${restaurant?.name || 'Restaurant'}`,
                order_id: createData.orderId,
                handler: async function (response) {
                    // Step 3: Verify payment on backend
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                paymentId: createData.paymentId,
                                orderData: {
                                    restaurantId: restaurant._id || restaurant.id,
                                    items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
                                    deliveryAddress: { street: selectedAddr.street, city: selectedAddr.city, zip: selectedAddr.zip },
                                    deliveryLocation,
                                    paymentMethod: selectedPayment === 'upi' ? 'UPI' : 'Card',
                                    loyaltyPointsUsed: loyaltyDiscount,
                                    noCutlery,
                                    tipAmount: Number(tipAmount),
                                    deliveryInstructions: deliveryInstructions.join(', ')
                                }
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                            setEarnedPoints(verifyData.pointsEarned || 0);
                            setOrderPlaced(true);
                            clearCart();
                            setTimeout(() => navigate('/order-tracking'), 3000);
                        } else {
                            alert(verifyData.message || 'Payment verification failed');
                        }
                    } catch (e) {
                        console.error(e);
                        alert('Payment verification failed. Please contact support.');
                    }
                    setPlacing(false);
                },
                modal: {
                    ondismiss: () => setPlacing(false)
                },
                prefill: { name: user?.name || 'Customer', email: user?.email || 'customer@cravify.com' },
                theme: { color: '#E23744' }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
        } catch (e) {
            console.error(e);
            alert('Something went wrong. Please try again.');
            setPlacing(false);
        }
    };

    // ── Place Order (Wallet) ──
    const handlePlaceOrderWallet = async () => {
        if ((profile?.walletBalance || 0) < totalToPay) {
            alert('Insufficient wallet balance. Please top up or choose another payment method.');
            return;
        }

        const selectedAddr = addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddr) { alert('Please select a delivery address.'); return; }

        setPlacing(true);
        try {
            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    restaurantId: restaurant._id || restaurant.id,
                    items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
                    deliveryAddress: { street: selectedAddr.street, city: selectedAddr.city, zip: selectedAddr.zip },
                    deliveryLocation,
                    paymentMethod: 'Wallet',
                    loyaltyPointsToRedeem: loyaltyDiscount,
                    offerCode: appliedOffer,
                    noCutlery,
                    tipAmount: Number(tipAmount),
                    deliveryInstructions: deliveryInstructions.join(', ')
                })
            });
            const data = await res.json();
            if (res.ok) {
                setEarnedPoints(data.pointsEarned || 0);
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

    const handlePlaceOrder = () => {
        if (!token) { alert('Please log in to place an order.'); navigate('/login'); return; }
        if (cartItems.length === 0) { alert('Your cart is empty!'); return; }
        
        if (selectedPayment === 'cod') {
            handlePlaceOrderCOD();
        } else if (selectedPayment === 'wallet') {
            handlePlaceOrderWallet();
        } else {
            handlePlaceOrderRazorpay();
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
                        <p className="text-gray-500 mb-4">Your order has been sent to the restaurant.</p>
                        {earnedPoints > 0 && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center justify-center gap-2 text-yellow-700 font-bold">
                                    <Star size={18} className="text-yellow-500" />
                                    You'll earn {earnedPoints} loyalty points!
                                </div>
                                <p className="text-xs text-yellow-600 mt-1">Points credited after delivery</p>
                            </div>
                        )}
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
                                        onClick={() => {
                                            if (!token) {
                                                alert('Please log in to add an address.');
                                                navigate('/login');
                                                return;
                                            }
                                            setShowAddModal(true);
                                        }}
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
                                            onClick={() => {
                                                if (!token) {
                                                    alert('Please log in to add an address.');
                                                    navigate('/login');
                                                    return;
                                                }
                                                setShowAddModal(true);
                                            }}
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
                                                    <button
                                                        className="absolute top-3 right-3 p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
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
                                    {[
                                        { id: 'upi', icon: <span className="font-bold text-xs text-primary">UPI</span>, title: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                                        { id: 'card', icon: <CreditCard size={20} className="text-primary" />, title: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex' },
                                        { id: 'wallet', icon: <Wallet size={20} className="text-primary" />, title: 'Cravify Wallet', desc: `Balance: ₹${profile?.walletBalance || 0}` },
                                        { id: 'cod', icon: <Banknote size={20} className="text-primary" />, title: 'Cash on Delivery', desc: 'Pay cash at your doorstep' }
                                    ].map(pm => (
                                        <div
                                            key={pm.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === pm.id ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                            onClick={() => setSelectedPayment(pm.id)}
                                        >
                                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                                {pm.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold">{pm.title}</h3>
                                                <p className="text-sm text-gray-500">{pm.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === pm.id ? 'border-primary' : 'border-gray-300'}`}>
                                                {selectedPayment === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ─── ESG (No Cutlery) Section ─── */}
                            <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                        <Sparkles size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-green-800">Environmental Impact</h3>
                                        <p className="text-sm text-green-600 mb-4 leading-relaxed">
                                            Opt-out of plastic cutlery and napkins. Help us reduce plastic waste in Gujarat!
                                        </p>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={noCutlery}
                                                onChange={(e) => setNoCutlery(e.target.checked)}
                                                className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500" 
                                            />
                                            <span className="font-bold text-green-700 group-hover:text-green-800 transition-colors">Don't send cutlery with this order</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Delivery Instructions Section ─── */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
                                    <Clock className="text-dark" size={22} /> Delivery Instructions
                                </h2>
                                <div className="flex gap-4">
                                    {[
                                        { id: 'avoid_call', label: 'Avoid calling', icon: '🤫' },
                                        { id: 'leave_door', label: 'Leave at door', icon: '🚪' }
                                    ].map(inst => {
                                        const isSelected = deliveryInstructions.includes(inst.label);
                                        return (
                                            <button
                                                key={inst.id}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setDeliveryInstructions(prev => prev.filter(i => i !== inst.label));
                                                    } else {
                                                        setDeliveryInstructions(prev => [...prev, inst.label]);
                                                    }
                                                }}
                                                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-primary bg-red-50 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                            >
                                                <span className="text-2xl">{inst.icon}</span>
                                                <span className="text-sm font-bold">{inst.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─── Rider Tip Section ─── */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
                                    <Gift className="text-dark" /> Add a Tip for Rider
                                </h2>
                                <p className="text-sm text-gray-500 mb-6 italic">100% of the tip goes to the delivery partner.</p>
                                
                                <div className="flex flex-wrap gap-3">
                                    {[10, 20, 30, 50].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setTipAmount(tipAmount === amt ? 0 : amt)}
                                            className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${tipAmount === amt ? 'border-primary bg-red-50 text-primary' : 'border-gray-100 text-gray-600 hover:border-gray-200'}`}
                                        >
                                            ₹{amt}
                                        </button>
                                    ))}
                                    <div className="relative flex-1 min-w-[120px]">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input 
                                            type="number"
                                            placeholder="Custom"
                                            value={tipAmount || ''}
                                            onChange={(e) => setTipAmount(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary focus:outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ─── Loyalty Points Section ─── */}
                            {loyaltyBalance > 0 && (
                                <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-6 rounded-2xl shadow-sm border border-yellow-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-800">
                                            <Gift className="text-yellow-600" size={22} /> Loyalty Points
                                        </h2>
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                                            {loyaltyBalance} pts available
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={usePoints}
                                                onChange={(e) => setUsePoints(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                        </label>
                                        <div>
                                            <p className="font-semibold text-yellow-800">
                                                Use {Math.min(redeemPoints, Math.floor((cartTotal + deliveryFee + platformFee + gst) * 0.5))} points
                                            </p>
                                            <p className="text-xs text-yellow-600">Save ₹{loyaltyDiscount} on this order (max 50% of total)</p>
                                        </div>
                                    </div>
                                </div>
                            )}
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

                                {/* Offer Code Input */}
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Have a promo code?</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={offerCode}
                                            onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                                            disabled={!!appliedOffer}
                                            className="min-w-0 flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50"
                                        />
                                        {appliedOffer ? (
                                            <button
                                                onClick={() => { setAppliedOffer(''); setOfferCode(''); }}
                                                className="shrink-0 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => { if (offerCode.trim()) setAppliedOffer(offerCode.trim()); }}
                                                disabled={!offerCode.trim()}
                                                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowPromoList(true)}
                                        className="text-[10px] font-bold text-primary hover:underline mt-2 flex items-center gap-1 uppercase tracking-wider"
                                    >
                                        <Gift size={10} /> View Available Promos & Coupons
                                    </button>
                                    {appliedOffer && offerDiscount > 0 && (
                                        <p className="text-green-600 text-xs mt-2 font-bold">✅ Code {appliedOffer} applied — you save ₹{offerDiscount}!</p>
                                    )}
                                    {cartTotal >= 500 && !appliedOffer && (
                                        <p className="text-green-600 text-xs mt-2 font-medium">🎉 Free delivery auto-applied on orders above ₹500!</p>
                                    )}
                                </div>

                                <div className="space-y-3 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Item Total</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Delivery Fee {distanceKm > 0 ? `(${distanceKm} km)` : ''}</span>
                                        <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                                            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Platform Fee</span>
                                        <span>₹{platformFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>GST (18%)</span>
                                        <span>₹{gst.toFixed(2)}</span>
                                    </div>
                                    {offerDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 text-sm font-bold">
                                            <span className="flex items-center gap-1"><Gift size={14} /> Offer Discount</span>
                                            <span>-₹{offerDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {loyaltyDiscount > 0 && (
                                        <div className="flex justify-between text-green-600 text-sm font-bold">
                                            <span className="flex items-center gap-1"><Sparkles size={14} /> Loyalty Discount</span>
                                            <span>-₹{loyaltyDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {tipAmount > 0 && (
                                        <div className="flex justify-between text-dark text-sm font-bold">
                                            <span className="flex items-center gap-1"><Gift size={14} /> Rider Tip</span>
                                            <span>₹{Number(tipAmount).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between font-bold text-xl py-4">
                                    <span>To Pay</span>
                                    <span>₹{totalToPay.toFixed(2)}</span>
                                </div>

                                {/* Points earning preview */}
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-4 flex items-center gap-2 text-yellow-700 text-sm">
                                    <Star size={16} className="text-yellow-500 shrink-0" />
                                    <span>You'll earn <strong>{pointsWillEarn} points</strong> on this order!</span>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={handlePlaceOrder}
                                    disabled={placing || !selectedAddressId}
                                >
                                    {placing ? 'Processing...' : selectedPayment === 'cod' ? `Place Order • ₹${totalToPay.toFixed(2)}` : `Pay ₹${totalToPay.toFixed(2)}`}
                                </Button>

                                {selectedPayment !== 'cod' && (
                                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                                        <CreditCard size={12} /> Secured by Razorpay
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Add Address Modal ─── */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <MapPin size={18} className="text-primary" /> Add New Address
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
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
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Street / Area</label>
                                <input type="text" value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} placeholder="e.g. 123, MG Road, Navrangpura" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">City</label>
                                    <input type="text" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} placeholder="Ahmedabad" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">ZIP Code</label>
                                    <input type="text" value={newAddress.zip} onChange={e => setNewAddress(p => ({ ...p, zip: e.target.value }))} placeholder="380009" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleAddAddress} disabled={addingAddress} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer">
                                {addingAddress ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Promos Modal */}
            {showPromoList && <PromoListModal />}
        </MainLayout>
    );
};

export default Checkout;
