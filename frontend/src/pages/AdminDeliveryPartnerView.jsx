import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Loader2, Bike, MapPin, Phone, Mail, Star, FileText, ArrowLeft, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDeliveryPartnerView = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [rider, setRider] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // Fetch rider details (from all users)
            const usersRes = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (usersRes.ok) {
                const users = await usersRes.json();
                const foundRider = users.find(u => u._id === id);
                setRider(foundRider);
            }

            // Fetch recent deliveries for this rider
            const ordersRes = await fetch(`/api/admin/orders?deliveryPartner=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData);
            }
        } catch (err) {
            console.error('Failed to fetch rider data', err);
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

    if (!rider) {
        return (
            <MainLayout>
                <div className="text-center py-20">
                    <Bike size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold">Delivery Partner not found</h2>
                    <Link to="/admin/delivery-partners" className="text-primary hover:underline mt-4 inline-block">Back to list</Link>
                </div>
            </MainLayout>
        );
    }

    const completedOrders = orders.filter(o => o.status === 'Delivered');
    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Rejected'].includes(o.status));
    
    // For documents
    const documents = rider.deliveryDetails?.documents || rider.documents || rider.deliveryDocuments || [];

    const isImageUrl = (url) => /\.(png|jpe?g|webp|gif|bmp|avif)(\?.*)?$/i.test(url || '');

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/admin/delivery-partners" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Delivery Partners
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                    <Bike size={32} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-dark">{rider.name}</h1>
                                    <p className="text-sm text-gray-500">Joined {new Date(rider.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-6 text-sm font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs ${rider.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {rider.isVerified ? 'ACTIVE' : 'PENDING'}
                                </span>
                                <span className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                                    {rider.deliveryRating?.toFixed(1) || '0.0'} <Star size={12} className="ml-1 fill-yellow-700" />
                                </span>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3"><Mail size={16} className="text-gray-400"/> {rider.email}</div>
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3"><Phone size={16} className="text-gray-400"/> {rider.phone || 'N/A'}</div>
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-3"><Bike size={16} className="text-gray-400"/> {rider.deliveryDetails?.vehicleType || 'Not specified'}</div>
                                <div className="flex items-center gap-3"><FileText size={16} className="text-gray-400"/> {rider.deliveryDetails?.vehicleNumber || 'Not specified'}</div>
                            </div>
                        </div>

                        {/* Documents block */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                             <h3 className="font-bold text-dark mb-4">Verification Documents</h3>
                             {documents.length > 0 ? (
                                <div className="space-y-3">
                                    {documents.map((doc, idx) => {
                                        const url = doc.url || doc;
                                        const label = doc.label || `Document ${idx+1}`;
                                        if (!url) return null;
                                        
                                        return (
                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block border rounded-xl overflow-hidden hover:border-primary transition-colors">
                                                {isImageUrl(url) ? (
                                                    <div className="h-24 bg-gray-100"><img src={url} alt={label} className="w-full h-full object-cover"/></div>
                                                ) : (
                                                    <div className="h-12 flex items-center justify-center bg-gray-100 text-xs text-gray-500">View File</div>
                                                )}
                                                <div className="p-2 text-xs font-medium text-center bg-gray-50 border-t">{label}</div>
                                            </a>
                                        );
                                    })}
                                </div>
                             ) : (
                                <p className="text-sm text-gray-500">No documents uploaded.</p>
                             )}
                        </div>
                    </div>

                    {/* Right Column: Stats & Orders */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Bike size={24}/></div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Deliveries</p>
                                    <h3 className="text-xl font-bold text-dark">{completedOrders.length}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-green-50 p-3 rounded-xl text-green-600">₹</div>
                                <div>
                                    <p className="text-sm text-gray-500">Wallet Balance</p>
                                    <h3 className="text-xl font-bold text-dark">₹{rider.walletBalance || 0}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="bg-purple-50 p-3 rounded-xl text-purple-600">₹</div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Earned</p>
                                    <h3 className="text-xl font-bold text-dark">₹{rider.totalEarnings || 0}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Current/Active Order */}
                        {activeOrders.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-primary/20 overflow-hidden">
                                <div className="bg-primary/5 p-4 border-b border-primary/10">
                                    <h3 className="font-bold text-lg text-dark flex items-center gap-2"><Navigation size={18} className="text-primary"/> Currently Delivering</h3>
                                </div>
                                <div className="p-5">
                                    {activeOrders.map(order => (
                                        <div key={order._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-3 border border-gray-100">
                                            <div>
                                                <span className="text-xs text-gray-500 font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                                                <h4 className="font-bold text-dark mt-1">{order.restaurant?.name || 'Restaurant'}</h4>
                                                <p className="text-sm text-gray-600">To: {order.deliveryAddress?.street || 'Customer Address'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{order.status}</span>
                                                <p className="text-sm font-bold text-dark mt-2">Earn: ₹{order.deliveryEarning || 40}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Orders History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-lg text-dark">Delivery History</h3>
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
                                                    <th className="px-5 py-3 font-medium text-right">Earning</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled').slice(0, 50).map(order => (
                                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-5 py-4 font-mono text-xs text-gray-600">#{order._id.slice(-6).toUpperCase()}</td>
                                                        <td className="px-5 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-5 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-medium text-dark">
                                                            {order.status === 'Delivered' ? `₹${order.deliveryEarning || 40}` : '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">No delivery history yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminDeliveryPartnerView;
