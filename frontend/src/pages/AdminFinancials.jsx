import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign, Percent, Receipt, Gift, Loader2, ArrowLeft, Search, Calendar, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const AdminFinancials = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialType = params.get('type') || 'gst';

    const [activeTab, setActiveTab] = useState(initialType);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Only concern with delivered orders for revenue
                setOrders(data.filter(o => o.status === 'Delivered'));
            }
        } catch (err) {
            console.error('Failed to fetch financials', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        return orders.reduce((acc, curr) => ({
            fees: acc.fees + (curr.platformFee || 0),
            gst: acc.gst + (curr.gst || 0),
            discounts: acc.discounts + (curr.offerDiscount || 0),
            revenue: acc.revenue + (curr.platformFee || 0) + (curr.gst || 0) - (curr.offerDiscount || 0)
        }), { fees: 0, gst: 0, discounts: 0, revenue: 0 });
    }, [orders]);

    const filteredData = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return orders.filter(o => 
            o._id.toLowerCase().includes(q) || 
            o.user?.name?.toLowerCase().includes(q) ||
            o.offerCode?.toLowerCase().includes(q)
        );
    }, [searchQuery, orders]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors mb-6 font-medium group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Formula Wrapper */}
                <div className="bg-purple-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <p className="text-purple-100 text-sm font-bold mb-2 uppercase tracking-wider opacity-80 underline decoration-purple-400 decoration-2 underline-offset-4">Calculation Formula</p>
                                <h1 className="text-2xl md:text-4xl font-black mb-2">Revenue = Platform Fees + GST - Discounts</h1>
                                <p className="text-purple-200 text-sm opacity-75">Calculated in real-time from all delivered orders across Gujarat.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-right">
                                <p className="text-purple-100 text-xs font-bold uppercase mb-1">Total Net Revenue</p>
                                <p className="text-4xl font-black">₹{stats.revenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Sub-Stats Selection Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button 
                        onClick={() => setActiveTab('gst')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left group ${activeTab === 'gst' ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeTab === 'gst' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'}`}>
                            <Receipt size={24} />
                        </div>
                        <h3 className={`font-bold text-lg mb-1 ${activeTab === 'gst' ? 'text-blue-700' : 'text-dark'}`}>GST Collection</h3>
                        <p className="text-sm text-gray-500 mb-2">18% on total transaction value.</p>
                        <p className={`text-2xl font-black ${activeTab === 'gst' ? 'text-blue-600' : 'text-dark'}`}>₹{stats.gst.toLocaleString()}</p>
                    </button>

                    <button 
                        onClick={() => setActiveTab('discounts')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left group ${activeTab === 'discounts' ? 'border-red-500 bg-red-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeTab === 'discounts' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500'}`}>
                            <Gift size={24} />
                        </div>
                        <h3 className={`font-bold text-lg mb-1 ${activeTab === 'discounts' ? 'text-red-700' : 'text-dark'}`}>Platform Discounts</h3>
                        <p className="text-sm text-gray-500 mb-2">Total discounts funded by platform.</p>
                        <p className={`text-2xl font-black ${activeTab === 'discounts' ? 'text-red-600' : 'text-dark'}`}>₹{stats.discounts.toLocaleString()}</p>
                    </button>

                    <button 
                        onClick={() => setActiveTab('fees')}
                        className={`p-6 rounded-2xl border-2 transition-all text-left group ${activeTab === 'fees' ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeTab === 'fees' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-500'}`}>
                            <DollarSign size={24} />
                        </div>
                        <h3 className={`font-bold text-lg mb-1 ${activeTab === 'fees' ? 'text-green-700' : 'text-dark'}`}>Platform Fees</h3>
                        <p className="text-sm text-gray-500 mb-2">Flat commission per transaction.</p>
                        <p className={`text-2xl font-black ${activeTab === 'fees' ? 'text-green-600' : 'text-dark'}`}>₹{stats.fees.toLocaleString()}</p>
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search by Order ID or User..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-bold text-gray-600">Order ID</th>
                                <th className="p-4 font-bold text-gray-600">Customer</th>
                                <th className="p-4 font-bold text-gray-600">Date</th>
                                {activeTab === 'gst' && <th className="p-4 font-bold text-gray-600 text-right">GST Collected</th>}
                                {activeTab === 'discounts' && (
                                    <>
                                        <th className="p-4 font-bold text-gray-600">Coupon Used</th>
                                        <th className="p-4 font-bold text-gray-600 text-right">Discount</th>
                                    </>
                                )}
                                {activeTab === 'fees' && <th className="p-4 font-bold text-gray-600 text-right">Platform Fee</th>}
                                <th className="p-4 font-bold text-gray-600 text-right">Order Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="p-12 text-center text-gray-400 font-medium">
                                        No transaction data found for this category.
                                    </td>
                                </tr>
                            ) : filteredData.map(order => (
                                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-gray-500 uppercase">#{order._id.slice(-8)}</td>
                                    <td className="p-4 font-medium text-dark">{order.user?.name || 'Anonymous'}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    
                                    {activeTab === 'gst' && (
                                        <td className="p-4 text-right font-bold text-blue-600">₹{order.gst?.toFixed(2)}</td>
                                    )}
                                    
                                    {activeTab === 'discounts' && (
                                        <>
                                            <td className="p-4">
                                                {order.offerCode ? (
                                                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-100">
                                                        {order.offerCode}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-bold text-red-600">-₹{order.offerDiscount?.toFixed(2)}</td>
                                        </>
                                    )}
                                    
                                    {activeTab === 'fees' && (
                                        <td className="p-4 text-right font-bold text-green-600">₹{order.platformFee?.toFixed(2)}</td>
                                    )}
                                    
                                    <td className="p-4 text-right font-black text-dark">₹{order.totalAmount?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminFinancials;
