import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Search, MapPin, Store, Wifi, WifiOff, UtensilsCrossed, Loader2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminRestaurants = () => {
    const { token } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await fetch('/api/admin/restaurants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRestaurants(data);
            }
        } catch (err) {
            console.error('Failed to fetch restaurants', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return restaurants;
        const q = searchQuery.toLowerCase();
        return restaurants.filter(r =>
            r.name?.toLowerCase().includes(q) ||
            r.address?.toLowerCase().includes(q) ||
            (r.cuisines && r.cuisines.some(c => c.toLowerCase().includes(q))) ||
            r.vendor?.name?.toLowerCase().includes(q)
        );
    }, [searchQuery, restaurants]);

    const onlineCount = restaurants.filter(r => r.isOnline).length;
    const offlineCount = restaurants.filter(r => !r.isOnline).length;

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark">All Restaurants</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {restaurants.length} total • <span className="text-green-600">{onlineCount} online</span> • <span className="text-gray-400">{offlineCount} offline</span>
                        </p>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
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
                        <Store size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No restaurants found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(rest => (
                            <Link to={`/admin/restaurants/${rest._id}`} key={rest._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer block">
                                {/* Image */}
                                <div className="h-36 bg-gray-100 relative overflow-hidden">
                                    {rest.image ? (
                                        <img
                                            src={rest.image.startsWith('/uploads') ? rest.image : rest.image}
                                            alt={rest.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                            <Store size={40} className="text-gray-300" />
                                        </div>
                                    )}
                                    {/* Online badge */}
                                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${rest.isOnline ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {rest.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                                        {rest.isOnline ? 'Online' : 'Offline'}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-dark mb-1">{rest.name}</h3>

                                {rest.address && (
                                        <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-2">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            <span className="line-clamp-1">{rest.address} {rest.pincode ? `(${rest.pincode})` : ''}</span>
                                        </div>
                                    )}

                                    {rest.cuisines && rest.cuisines.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {rest.cuisines.map((c, i) => (
                                                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{c}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <UtensilsCrossed size={14} />
                                            <span>{rest.menu?.length || 0} items</span>
                                        </div>
                                        {rest.vendor && (
                                            <span className="text-gray-400 text-xs truncate max-w-[150px]" title={rest.vendor.email}>
                                                by {rest.vendor.name}
                                            </span>
                                        )}
                                    </div>

                                    {(rest.rating > 0 || rest.numRatings > 0) && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="bg-green-700 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">{rest.rating} <Star size={10} className="fill-white"/></span>
                                            <span className="text-xs text-gray-400">({rest.numRatings || 0} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminRestaurants;
