import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, ShoppingBag, Star, Clock, Check, X } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-4 rounded-xl ${color} text-white`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-dark">{value}</h3>
        </div>
    </div>
);

const VendorDashboard = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ todayEarnings: 0, totalLiveOrders: 0, menuItemsCount: 0 });
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/vendor/dashboard', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setRestaurant(data.restaurant);
                setStats(data.stats);
                setOrders(data.liveOrders);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboard();
            const interval = setInterval(fetchDashboard, 15000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const toggleStatus = async () => {
        try {
            const res = await fetch('/api/vendor/status', {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setRestaurant({ ...restaurant, isOnline: data.isOnline });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleOrderAction = async (id, actionStatus) => {
        try {
            const res = await fetch(`/api/vendor/orders/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify({ status: actionStatus })
            });
            if (res.ok) {
                // Use functional update to avoid stale closure
                setOrders(prev => {
                    if (['Cancelled', 'Rejected'].includes(actionStatus)) {
                        return prev.filter(o => o._id !== id);
                    }
                    return prev.map(order => order._id === id ? { ...order, status: actionStatus } : order);
                });
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.message || 'Failed to update'}`);
                fetchDashboard();
            }
        } catch (e) {
            console.error(e);
            alert('Network error updating order');
        }
    };

    if (loading) return <MainLayout><div className="flex justify-center py-20 text-xl font-bold">Loading Dashboard...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-dark">Vendor Dashboard</h1>
                            <p className="text-gray-500">Welcome back, {restaurant?.name || 'Partner'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={toggleStatus}
                                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors duration-200 ${restaurant?.isOnline ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${restaurant?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span> 
                                {restaurant?.isOnline ? 'Online' : 'Offline'}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Today's Earnings" value={`₹${stats.todayEarnings}`} icon={DollarSign} color="bg-green-500" />
                        <StatCard title="Live Orders" value={stats.totalLiveOrders} icon={ShoppingBag} color="bg-blue-500" />
                        <StatCard title="Menu Items" value={stats.menuItemsCount} icon={Star} color="bg-yellow-500" />
                        <StatCard title="Avg Rating" value={restaurant?.rating || '0.0'} icon={Clock} color="bg-purple-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Live Orders */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold text-dark mb-4">Live Orders</h2>
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2 font-medium">
                                                    {order.user ? `Customer: ${order.user.name} (${order.user.phone || 'N/A'})` : 'Customer Info Unavailable'}
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                                                </p>
                                            </div>
                                            <p className="font-bold text-lg text-primary">₹{order.totalAmount}</p>
                                        </div>

                                        {order.status === 'Placed' ? (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleOrderAction(order._id, 'Rejected')}
                                                    className="flex-1 py-2 border border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleOrderAction(order._id, 'Preparing')}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                                                >
                                                    Accept Order
                                                </button>
                                            </div>
                                        ) : order.status === 'Preparing' ? (
                                            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                <span className="font-bold text-secondary flex items-center gap-2">
                                                    <Clock size={18} /> Preparing...
                                                </span>
                                                <Button size="sm" variant="outline" onClick={() => handleOrderAction(order._id, 'ReadyForPickup')}>
                                                    ✅ Mark Ready
                                                </Button>
                                            </div>
                                        ) : order.status === 'ReadyForPickup' ? (
                                            <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                                <span className="font-bold text-yellow-600 flex items-center gap-2">
                                                    <Check size={18} /> Food Ready
                                                </span>
                                                <span className="text-sm text-gray-400 italic">Waiting for rider...</span>
                                            </div>
                                        ) : order.status === 'OutForDelivery' ? (
                                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <span className="font-bold text-blue-600 flex items-center gap-2">
                                                    🚴 Out For Delivery
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <span className="font-bold text-gray-500">
                                                    {order.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">No active orders right now.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Overview */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-dark">Menu Overview</h2>
                                <Link to="/vendor/menu">
                                    <Button variant="link" size="sm">Manage</Button>
                                </Link>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                {restaurant?.menu?.slice(0, 5).map(item => (
                                    <div key={item._id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="font-medium text-dark">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-500">₹{item.price}</span>
                                    </div>
                                ))}
                                {(!restaurant?.menu || restaurant.menu.length === 0) && (
                                    <div className="text-center text-sm text-gray-400 py-4">No menu items found. Add some to get started!</div>
                                )}
                                <div className="pt-2">
                                    <Link to="/vendor/menu">
                                        <Button variant="outline" className="w-full">Edit Menu</Button>
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default VendorDashboard;
