import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Loader2, Store, MapPin, Phone, Mail, Star, FileText, ArrowLeft, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminRestaurantView = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEarningModal, setShowEarningModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch restaurant details (using customer route since it gets full data)
            const restRes = await fetch(`/api/customer/restaurants/${id}`);
            if (restRes.ok) {
                const restData = await restRes.json();
                setRestaurant(restData);
            }

            // Fetch recent orders for this restaurant
            const ordersRes = await fetch(`/api/admin/orders?restaurant=${id}`, {
                headers: { 'x-auth-token': token }
            });
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData);
            }
        } catch (err) {
            console.error('Failed to fetch restaurant data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!restaurant) {
        return (
            <MainLayout>
                <div className="text-center py-20">
                    <Store size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold">Restaurant not found</h2>
                    <Link to="/admin/restaurants" className="text-primary hover:underline mt-4 inline-block">Back to list</Link>
                </div>
            </MainLayout>
        );
    }

    const completedOrders = orders.filter(o => o.status === 'Delivered');
    const totalSubsidy = completedOrders.reduce((sum, o) => {
        const isFreeDelivery = o.offerCode === 'FREE_DELIVERY' || o.itemTotal >= 500;
        return sum + (isFreeDelivery ? (o.deliveryEarning || 0) : 0);
    }, 0);
    const totalItemSales = completedOrders.reduce((sum, o) => sum + (o.itemTotal || 0), 0);
    const totalRevenue = totalItemSales - totalSubsidy;
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status));

    const EarningDetailModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-primary p-8 text-white text-center relative">
                    <button onClick={() => setShowEarningModal(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">✕</button>
                    <p className="text-red-100 text-sm font-bold uppercase tracking-widest mb-2">Net Revenue Breakdown</p>
                    <h2 className="text-5xl font-black italic">₹{totalRevenue.toFixed(0)}</h2>
                </div>
                <div className="p-8">
                    <h3 className="font-bold text-dark mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-primary" /> Detailed Order Stats
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Total Item Sales</span>
                                    <span className="font-bold text-dark">₹{totalItemSales.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-red-500 font-medium">
                                    <span>Total Delivery Subsidies</span>
                                    <span>- ₹{totalSubsidy.toFixed(0)}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-1" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 font-medium">Delivered Orders</span>
                                    <span className="font-bold text-dark">{completedOrders.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Avg. Net/Order</span>
                                    <span className="font-bold text-dark">₹{completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(1) : 0}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2" />
                                <div className="flex justify-between items-center font-black text-xl">
                                    <span className="text-dark">Total Net Payout</span>
                                    <span className="text-primary">₹{totalRevenue.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button variant="primary" className="w-full mt-8 py-4 rounded-2xl" onClick={() => setShowEarningModal(false)}>Close Overview</Button>
                </div>
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/admin/restaurants" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Restaurants
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-48 bg-gray-200">
                                {restaurant.image ? (
                                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Store size={48} className="text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h1 className="text-2xl font-bold text-dark mb-2">{restaurant.name}</h1>
                                
                                <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                                    <span className={`px-2 py-1 rounded-full text-xs ${restaurant.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {restaurant.isOnline ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                    <div onClick={() => setShowFeedbackModal(true)} className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-yellow-200 transition-colors">
                                        {restaurant.rating || '0.0'} <Star size={12} className="ml-1 fill-yellow-700" />
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600 mb-6">
                                    {restaurant.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                                            <span>{restaurant.address} {restaurant.pincode ? `(${restaurant.pincode})` : ''}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="font-bold text-dark mb-3">Vendor Details</h3>
                                    {restaurant.vendor ? (
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><Store size={14}/> {restaurant.vendor.name}</div>
                                            <div className="flex items-center gap-2"><Mail size={14}/> {restaurant.vendor.email}</div>
                                            <div className="flex items-center gap-2"><Phone size={14}/> {restaurant.vendor.phone || 'N/A'}</div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <FileText size={14}/> FSSAI: {restaurant.vendor.restaurantDetails?.fssai || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14}/> Address: {restaurant.vendor.restaurantDetails?.address || 'N/A'}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Vendor info not available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats, Orders & Menu */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Activity size={24}/></div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Orders</p>
                                    <h3 className="text-xl font-bold text-dark">{activeOrders.length}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-green-50 p-3 rounded-xl text-green-600"><Store size={24}/></div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Delivered</p>
                                    <h3 className="text-xl font-bold text-dark">{completedOrders.length}</h3>
                                </div>
                            </div>
                            <div onClick={() => setShowEarningModal(true)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all active:scale-[0.98]">
                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">₹</div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Revenue <small>(Delivered)</small></p>
                                    <h3 className="text-xl font-bold text-dark">₹{totalRevenue.toFixed(0)}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-lg text-dark">Recent Orders</h3>
                            </div>
                            <div className="p-0">
                                {orders.length > 0 ? (
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                                <tr>
                                                    <th className="px-5 py-3 font-medium">Order ID</th>
                                                    <th className="px-5 py-3 font-medium">Date</th>
                                                    <th className="px-5 py-3 font-medium">Status</th>
                                                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orders.slice(0, 50).map(order => (
                                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-4 font-mono text-xs text-gray-600">#{order._id.slice(-6).toUpperCase()}</td>
                                                        <td className="px-5 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-5 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            {(() => {
                                                                const isFreeDelivery = order.offerCode === 'FREE_DELIVERY' || order.itemTotal >= 500;
                                                                const subsidy = isFreeDelivery ? (order.deliveryEarning || 0) : 0;
                                                                const net = (order.itemTotal || 0) - subsidy;
                                                                return (
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="font-bold text-dark">₹{net.toFixed(0)}</span>
                                                                        {subsidy > 0 && <span className="text-[10px] text-red-500">-₹{subsidy} subsidy</span>}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">No orders yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Menu */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-dark">Menu Overview</h3>
                                <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{restaurant.menu?.length || 0} Items</span>
                            </div>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {restaurant.menu && restaurant.menu.length > 0 ? (
                                    restaurant.menu.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 p-3 border rounded-xl hover:border-primary/30 transition-colors">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                            )}
                                            <div>
                                                <h4 className="font-medium text-sm text-dark line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-primary font-bold text-sm">₹{item.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-4 text-center text-gray-500">No menu items found.</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-lg text-dark">Recent Customer Feedback</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {orders.filter(o => o.restaurantRating).length > 0 ? (
                                    orders.filter(o => o.restaurantRating).slice(0, 5).map((order, idx) => (
                                        <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-dark">{order.user?.name || 'Customer'}</span>
                                                <div className="flex items-center text-yellow-500 text-xs font-bold gap-0.5">
                                                    <Star size={12} className="fill-yellow-500" /> {order.restaurantRating}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 italic">"{order.ratingComment || 'No written feedback provided'}"</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-4 italic">No ratings yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {showEarningModal && <EarningDetailModal />}
                {showFeedbackModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="bg-yellow-500 p-8 text-white text-center relative">
                                <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">✕</button>
                                <p className="text-yellow-100 text-sm font-bold uppercase tracking-widest mb-2">Restaurant Ratings</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Star size={32} className="fill-white text-white" />
                                    <h2 className="text-5xl font-black italic">{restaurant.rating || '0.0'}</h2>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="font-bold text-dark mb-6">Recent Customer Feedback</h3>
                                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {orders.filter(o => o.restaurantRating).length > 0 ? (
                                        orders.filter(o => o.restaurantRating).map((order, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-dark text-sm">{order.user?.name || 'Customer'}</span>
                                                    <div className="flex items-center text-yellow-500 text-xs font-bold gap-0.5">
                                                        <Star size={12} className="fill-yellow-500" /> {order.restaurantRating}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 italic">"{order.ratingComment || 'No written feedback provided'}"</p>
                                                <p className="text-[10px] text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-400 py-4 italic">No ratings yet.</p>
                                    )}
                                </div>
                                <button className="w-full mt-8 py-4 bg-yellow-500 text-white rounded-2xl font-bold shadow-lg shadow-yellow-200" onClick={() => setShowFeedbackModal(false)}>Close Reviews</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminRestaurantView;
