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
                headers: { Authorization: `Bearer ${token}` }
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
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status));

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
                                    <span className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                                        {restaurant.rating || '0.0'} <Star size={12} className="ml-1 fill-yellow-700" />
                                    </span>
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
                                                <FileText size={14}/> FSSAI: {restaurant.vendor.vendorDetails?.fssaiNumber || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText size={14}/> GST: {restaurant.vendor.vendorDetails?.gstNumber || 'N/A'}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-400">Vendor info not available</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificates / Documents block if needed */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                             <h3 className="font-bold text-dark mb-4">Certificates</h3>
                             {restaurant.vendor && restaurant.vendor.documents && restaurant.vendor.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {restaurant.vendor.documents.map((doc, idx) => (
                                        <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 text-sm">
                                            <FileText size={16} className="mr-2 text-primary" />
                                            <span className="flex-1 truncate">{doc.label || `Document ${idx+1}`}</span>
                                        </a>
                                    ))}
                                </div>
                             ) : (
                                <p className="text-sm text-gray-500">No certificates uploaded.</p>
                             )}
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
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">₹</div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Revenue</p>
                                    <h3 className="text-xl font-bold text-dark">₹{totalRevenue}</h3>
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
                                                        <td className="px-5 py-4 text-right font-medium text-dark">₹{order.totalAmount}</td>
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
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    {!item.isAvailable && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Out of stock</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full p-4 text-center text-gray-500">No menu items found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminRestaurantView;
