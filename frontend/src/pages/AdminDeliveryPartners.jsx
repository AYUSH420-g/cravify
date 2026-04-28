import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Search, MapPin, Bike, Loader2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDeliveryPartners = () => {
    const { token } = useAuth();
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter users to only delivery partners
                const deliveryPartners = data.filter(u => u.role === 'delivery_partner');
                setRiders(deliveryPartners);
            }
        } catch (err) {
            console.error('Failed to fetch riders', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return riders;
        const q = searchQuery.toLowerCase();
        return riders.filter(r =>
            r.name?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            r.phone?.toLowerCase().includes(q)
        );
    }, [searchQuery, riders]);

    const isImageUrl = (url) => /\.(png|jpe?g|webp|gif|bmp|avif)(\?.*)?$/i.test(url || '');

    const getDeliveryDocuments = (rider) => {
        const documents = rider?.deliveryDetails?.documents || rider?.documents || rider?.deliveryDocuments;

        if (!documents) return [];

        if (Array.isArray(documents)) {
            return documents
                .filter(Boolean)
                .map((document, index) => {
                    if (typeof document === 'string') {
                        return {
                            key: `document-${index}`,
                            label: `Document ${index + 1}`,
                            url: document
                        };
                    }

                    return {
                        key: document.key || document.name || `document-${index}`,
                        label: document.label || document.name || `Document ${index + 1}`,
                        url: document.url || document.fileUrl || document.file
                    };
                });
        }

        return [
            {
                key: 'licenseUrl',
                label: 'Driving License',
                url: documents.licenseUrl
            },
            {
                key: 'rcUrl',
                label: 'RC Book',
                url: documents.rcUrl
            },
            {
                key: 'aadharUrl',
                label: 'Aadhar Card',
                url: documents.aadharUrl
            }
        ];
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark">Delivery Partners</h1>
                        <p className="text-gray-500 text-sm mt-1">{riders.length} registered partners</p>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search partners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-72 bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Bike size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No delivery partners found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(rider => (
                            <Link to={`/admin/delivery-partners/${rider._id}`} key={rider._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer block">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-3 rounded-full text-primary">
                                                <Bike size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-dark">{rider.name}</h3>
                                                <p className="text-muted text-sm flex items-center gap-1">
                                                     <UserIcon size={12} /> {rider.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4 text-sm text-gray-600">
                                        <p><strong>Phone:</strong> {rider.phone || 'N/A'}</p>
                                        <p><strong>Vehicle:</strong> {rider.deliveryDetails?.vehicleType || rider.riderDetails?.vehicleType || 'Not specified'}</p>
                                        <p><strong>License:</strong> {rider.deliveryDetails?.vehicleNumber || rider.riderDetails?.licenseNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500">Rating</p>
                                            <p className="font-bold text-dark">{rider.deliveryRating?.toFixed(1) || '0.0'} ★</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500">Wallet</p>
                                            <p className="font-bold text-dark">₹{rider.walletBalance || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500">Earned</p>
                                            <p className="font-bold text-dark">₹{rider.totalEarnings || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${rider.isVerified ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {rider.isVerified ? 'ACTIVE' : 'PENDING'}
                                        </span>
                                        <span className="text-xs text-gray-400">Joined {new Date(rider.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminDeliveryPartners;
