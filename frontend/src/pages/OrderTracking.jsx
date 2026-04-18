import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Phone, MessageSquare, MapPin, CheckCircle, Package, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

const OrderTracking = () => {
    const { token } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [riderLocation, setRiderLocation] = useState(null);

    useEffect(() => {
        fetchLatestActiveOrder();
        // Setup polling every 10 seconds to keep tracking updated
        const interval = setInterval(fetchLatestActiveOrder, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (order && socket) {
            // Join the tracking room for this specific order
            socket.emit('join_order_room', order._id);

            const handleLocationUpdate = (data) => {
                if (data.orderId === order._id) {
                    setRiderLocation(data.location);
                }
            };

            // Listen for real-time status updates (partner assigned, status change, etc.)
            const handleStatusUpdate = (updatedOrder) => {
                if (updatedOrder?._id === order._id) {
                    setOrder(updatedOrder);
                    // Update rider location if partner has lastKnownLocation
                    if (updatedOrder.deliveryPartner?.lastKnownLocation) {
                        setRiderLocation(updatedOrder.deliveryPartner.lastKnownLocation);
                    }
                }
            };

            socket.on('location_update', handleLocationUpdate);
            socket.on('ORDER_STATUS_UPDATED', handleStatusUpdate);

            return () => {
                socket.off('location_update', handleLocationUpdate);
                socket.off('ORDER_STATUS_UPDATED', handleStatusUpdate);
            };
        }
    }, [order?._id, socket]);

    const fetchLatestActiveOrder = async () => {
        try {
            const res = await fetch('/api/customer/orders', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                // Find highest priority active order (not cancelled, not delivered)
                const activeOrders = data.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
                if (activeOrders.length > 0) {
                    activeOrders.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    const currentOrder = activeOrders[0];
                    setOrder(currentOrder);

                    // If we have a partner and no live location yet, use their last known position
                    if (currentOrder.deliveryPartner && !riderLocation) {
                        setRiderLocation(currentOrder.deliveryPartner.lastKnownLocation);
                    }
                } else {
                    // Fallback to most recent only if we don't already have an active order context
                    if (!order && data.length > 0) {
                        setOrder(data[0]);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch order', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-white py-16 flex flex-col items-center justify-center">
                    <Package size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-dark mb-2">No Active Orders</h2>
                    <p className="text-gray-500 mb-6 text-center max-w-sm">
                        You don't have any recent orders to track.
                    </p>
                    <Button onClick={() => navigate('/')} variant="primary">Browse Restaurants</Button>
                </div>
            </MainLayout>
        );
    }

    const isDelivered = order.status === 'Delivered';
    const isCancelled = order.status === 'Cancelled';
    const isRejected = order.status === 'Rejected';
    const isActive = !isDelivered && !isCancelled && !isRejected;

    // Define steps
    const steps = [
        { key: 'Placed', label: 'Ordered', value: 1 },
        { key: 'Preparing', label: 'Preparing', value: 2 },
        { key: 'ReadyForPickup', label: 'Ready', value: 3 },
        { key: 'OutForDelivery', label: 'On Way', value: 4 },
        { key: 'Delivered', label: 'Delivered', value: 5 }
    ];

    // Get current progress value
    let progressValue = 1;
    if (order.status === 'Preparing') progressValue = 2;
    if (order.status === 'ReadyForPickup') progressValue = 3;
    if (order.status === 'OutForDelivery') progressValue = 4;
    if (order.status === 'Delivered') progressValue = 5;
    if (isCancelled || isRejected) progressValue = 0;

    const progressPercentage = ((progressValue - 1) / (steps.length - 1)) * 100;

    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Progress Bar Header */}
                <div className={`${isCancelled || isRejected ? 'bg-red-900' : 'bg-dark'} text-white py-12`}>
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {isCancelled ? 'Order Cancelled' : 
                             isRejected ? 'Order Declined by Restaurant' :
                             isDelivered ? 'Order Delivered Successfully' : 
                             `Arriving from ${order.restaurant?.name || 'Restaurant'}`}
                        </h1>
                        {isRejected && order.rejectionReason && (
                            <p className="text-red-200 text-sm mb-6">Reason: {order.rejectionReason}</p>
                        )}
                        {isCancelled && (
                             <p className="text-red-200 text-sm mb-6">Your order was cancelled by an admin.</p>
                        )}

                        {!(isCancelled || isRejected) && (
                            <div className="flex items-center justify-between relative px-4 md:px-12 mt-12 mb-4">
                                {/* Base line */}
                                <div className="absolute left-10 md:left-20 right-10 md:right-20 top-1/2 -translate-y-1/2 h-1 bg-gray-700 -z-0"></div>
                                {/* Active line */}
                                <div 
                                    className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-0 transition-all duration-500"
                                    style={{ width: `calc(${progressPercentage}% - 40px)` }}
                                ></div>

                                {steps.map((step, index) => {
                                    const isCompleted = progressValue > step.value;
                                    const isCurrent = progressValue === step.value;
                                    
                                    return (
                                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                                                ${isCompleted ? 'bg-green-500 text-white' : 
                                                  isCurrent ? 'bg-green-500 text-white border-4 border-dark animate-pulse' : 
                                                  'bg-gray-700 text-gray-400'}`}
                                            >
                                                {isCompleted ? <CheckCircle size={16} /> : step.value}
                                            </div>
                                            <span className={`text-xs absolute -bottom-6 whitespace-nowrap 
                                                ${isCurrent || isCompleted ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Live Tracking Map */}
                    <div className="lg:col-span-2 bg-gray-100 rounded-3xl h-[500px] relative overflow-hidden shadow-inner border border-gray-200">
                        <MapComponent 
                            riderLocation={riderLocation}
                            restaurantLocation={order.restaurant?.location}
                            customerLocation={{ lat: (order.restaurant?.location?.lat || 23.0225) + 0.01, lng: (order.restaurant?.location?.lng || 72.5714) + 0.01 }}
                        />
                    </div>

                    {/* Details Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Delivery Partner */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark mb-4">Delivery Partner</h3>
                            {isActive && order.deliveryPartner ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-primary italic">
                                            {order.deliveryPartner.name?.charAt(0) || 'DP'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{order.deliveryPartner.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-gray-500 text-xs">On the way to you</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark hover:bg-gray-50" onClick={() => window.location.href = `tel:${order.deliveryPartner.phone}`}>
                                            <Phone size={18} /> Call
                                        </Button>
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark hover:bg-gray-50">
                                            <MessageSquare size={18} /> Chat
                                        </Button>
                                    </div>
                                </>
                            ) : isActive && progressValue >= 2 ? (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-600">
                                            DP
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">Assigning Partner...</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-xs">Waiting for rider acceptance</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 opacity-50 pointer-events-none">
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark"><Phone size={18} /> Call</Button>
                                        <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark"><MessageSquare size={18} /> Chat</Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 text-sm">
                                        {isDelivered ? 'Order has been delivered.' : 
                                         isCancelled ? 'Order was cancelled.' : 
                                         isRejected ? 'Order could not be prepared.' :
                                         'Partner details will appear when order is dispatched.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark mb-4">Order Details</h3>
                            <p className="text-gray-500 text-sm mb-4">Order #{order._id.slice(-8).toUpperCase()}</p>
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-dark font-medium">{item.quantity} x {item.name}</span>
                                        <span className="text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-primary text-xl">₹{order.totalAmount?.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2 font-medium">Paid via {order.paymentMethod}</p>
                            
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-4 text-primary"
                                onClick={() => navigate('/help')}
                            >
                                Need Help?
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default OrderTracking;
