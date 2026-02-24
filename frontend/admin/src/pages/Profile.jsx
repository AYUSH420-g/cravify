import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Package, MapPin, Star, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RateFoodModal from '../components/RateFoodModal';

const Profile = () => {
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');

    const handleRateOrder = (order) => {
        setSelectedOrder(order);
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = (reviewData) => {
        // Mock submission
        console.log('Review Submitted:', reviewData);
        // In a real app, this would be an API call
        alert('Thank you for your feedback!');
    };

    // Mock Orders with IDs for reference
    const orders = [
        {
            id: 'ORD-101',
            restaurant: "La Pino'z Pizza",
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=200&q=80",
            date: "24 Sep 2024, 08:30 PM",
            location: "Lower Manhattan",
            status: "Delivered",
            statusColor: "bg-gray-100 text-gray-600",
            items: "1 x Paneer Butter Masala, 2 x Garlic Naan",
            total: "₹300.00"
        },
        {
            id: 'ORD-102',
            restaurant: "Burger King",
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=200&q=80",
            date: "20 Sep 2024, 01:15 PM",
            location: "Brooklyn",
            status: "Delivered",
            statusColor: "bg-green-100 text-green-700",
            items: "2 x Whopper, 1 x Coke",
            total: "₹250.00"
        }
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 bg-dark text-white text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-4 border-4 border-white/10 flex items-center justify-center text-2xl font-bold">JD</div>
                                    <h2 className="text-xl font-bold">John Doe</h2>
                                    <p className="text-gray-400 text-sm">john.doe@example.com</p>
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
                                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
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

                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
                                            <img src={order.image} className="w-full md:w-48 h-32 rounded-xl object-cover" alt={order.restaurant} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-dark">{order.restaurant}</h3>
                                                        <p className="text-gray-500 text-sm">{order.location} | {order.date}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded uppercase ${order.statusColor}`}>{order.status}</span>
                                                </div>

                                                <p className="text-gray-600 text-sm mb-4">
                                                    {order.items}
                                                </p>

                                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <span className="font-bold text-dark">Total Paid: {order.total}</span>
                                                    <div className="flex gap-3">
                                                        <Button variant="outline" size="sm" onClick={() => handleRateOrder(order)}>Rate Order</Button>
                                                        <Button variant="primary" size="sm">Reorder</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                                    <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No addresses saved yet.</p>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                                    <Settings size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>Account settings coming soon.</p>
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
