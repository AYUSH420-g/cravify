import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, ShoppingBag, Star, Clock, Check, X } from 'lucide-react';
import Button from '../components/Button';

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
    const [orders, setOrders] = useState([
        { id: 101, items: '2x Paneer Tikka, 1x Naan', amount: '₹450', time: '5 mins ago', status: 'pending' },
        { id: 102, items: '1x Veg Biryani', amount: '₹250', time: '12 mins ago', status: 'pending' },
        { id: 103, items: '3x Burgers, 2x Coke', amount: '₹600', time: '20 mins ago', status: 'preparing' },
    ]);

    const handleAction = (id, action) => {
        setOrders(orders.map(order =>
            order.id === id ? { ...order, status: action === 'accept' ? 'preparing' : 'rejected' } : order
        ));
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-dark">Vendor Dashboard</h1>
                            <p className="text-gray-500">Welcome back, La Pino'z Pizza</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Today's Earnings" value="₹12,450" icon={DollarSign} color="bg-green-500" />
                        <StatCard title="Total Orders" value="45" icon={ShoppingBag} color="bg-blue-500" />
                        <StatCard title="Avg Rating" value="4.5" icon={Star} color="bg-yellow-500" />
                        <StatCard title="Avg Prep Time" value="25m" icon={Clock} color="bg-purple-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Live Orders */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold text-dark mb-4">Live Orders</h2>
                            <div className="space-y-4">
                                {orders.filter(o => o.status !== 'rejected').map((order) => (
                                    <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-500">{order.time}</span>
                                                </div>
                                                <p className="text-gray-500">{order.items}</p>
                                            </div>
                                            <p className="font-bold text-lg text-primary">{order.amount}</p>
                                        </div>

                                        {order.status === 'pending' ? (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleAction(order.id, 'reject')}
                                                    className="flex-1 py-2 border border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction(order.id, 'accept')}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                                                >
                                                    Accept Order
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                <span className="font-bold text-secondary flex items-center gap-2">
                                                    <Clock size={18} /> Preparing...
                                                </span>
                                                <Button size="sm" variant="outline">Mark Ready</Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-2xl">
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
                                <h2 className="text-xl font-bold text-dark">Menu Status</h2>
                                <Button variant="link" size="sm">Manage Menu</Button>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <span className="font-medium">Paneer Tikka</span>
                                    <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <span className="font-medium">Veg Biryani</span>
                                    <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <span className="font-medium text-gray-400">Cheese Burger</span>
                                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button variant="outline" className="w-full">Add New Item</Button>
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
