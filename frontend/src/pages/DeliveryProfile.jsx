import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { ChevronLeft, Star, Clock, MapPin, LogOut, FileText, Bike, Loader2, TrendingUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeliveryProfile = () => {
    const { token, user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/delivery/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileData(data);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchProfile();
    }, [token]);

    const riderProfile = profileData?.riderProfile || {};
    const rating = riderProfile.rating || user?.deliveryRating || 0;
    const numRatings = riderProfile.numRatings || user?.numDeliveryRatings || 0;
    const name = riderProfile.name || user?.name || 'Rider';
    const email = riderProfile.email || user?.email || '';
    const phone = riderProfile.phone || user?.phone || 'Not set';
    const vehicleType = riderProfile.vehicleType || 'Not specified';
    const vehicleNumber = riderProfile.vehicleNumber || 'Not provided';
    const deliveriesCount = profileData?.deliveriesCount || 0;
    const totalEarnings = profileData?.totalEarnings || 0;
    const avgEarning = profileData?.avgEarning || 0;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                        <Link to="/delivery/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Profile & Stats</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        {/* User Info */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full overflow-hidden flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                                <p className="text-gray-500 text-sm">{email} • {phone}</p>
                                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                    <Star size={16} fill="currentColor" />
                                    <span className="font-bold">{rating.toFixed(1)}</span>
                                    <span className="text-gray-400 text-xs">({numRatings} ratings)</span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Package size={20} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">{deliveriesCount}</h3>
                                <p className="text-xs text-gray-500">Total Deliveries</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">₹{totalEarnings}</h3>
                                <p className="text-xs text-gray-500">Total Earned</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Star size={20} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">₹{avgEarning}</h3>
                                <p className="text-xs text-gray-500">Avg per Delivery</p>
                            </div>
                        </div>

                        {/* Vehicle & Documents */}
                        <h3 className="font-bold text-lg mb-4">Vehicle & Settings</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                            <div className="p-4 border-b border-gray-50 flex items-center gap-4">
                                <Bike className="text-gray-400" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Vehicle Type</h4>
                                    <p className="text-xs text-gray-500">{vehicleType} {vehicleNumber ? `(${vehicleNumber})` : ''}</p>
                                </div>
                            </div>
                            <div className="p-4 border-b border-gray-50 flex items-center gap-4">
                                <FileText className="text-gray-400" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Documents</h4>
                                    <p className="text-xs text-green-500">{user?.isVerified ? 'Verified' : 'Pending Verification'}</p>
                                </div>
                            </div>
                            <div className="p-4 border-b border-gray-50 flex items-center gap-4">
                                <MapPin className="text-gray-400" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">Service Area</h4>
                                    <p className="text-xs text-gray-500">{user?.deliveryDetails?.city || 'Gujarat, India'}</p>
                                </div>
                            </div>
                            <button onClick={() => { logout(); window.location.href = '/login'; }} className="p-4 flex items-center gap-4 w-full hover:bg-gray-50 text-left">
                                <LogOut className="text-red-500" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-medium text-red-500">Logout</h4>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default DeliveryProfile;
