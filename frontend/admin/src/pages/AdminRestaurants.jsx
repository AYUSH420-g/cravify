import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Check, X, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminRestaurants = () => {
    const { token } = useAuth();
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/restaurants', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRestaurants(data);
                }
            } catch (err) {
                console.error('Failed to fetch restaurants', err);
            }
        };
        if (token) fetchRestaurants();
    }, [token]);

    const handleAction = async (id, action) => {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        try {
            const res = await fetch(`http://localhost:5000/api/admin/restaurants/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ applicationStatus: newStatus })
            });

            if (res.ok) {
                setRestaurants(restaurants.map(rest =>
                    rest._id === id ? { ...rest, applicationStatus: newStatus } : rest
                ));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">Restaurant Approvals</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map(rest => (
                        <div key={rest._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-dark">{rest.name}</h3>
                                    <div className="flex items-center gap-1 text-muted text-sm mt-1">
                                        <MapPin size={14} />
                                        <span>{rest.addresses && rest.addresses.length > 0 ? rest.addresses[0].city : 'Location Not Set'}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                    ${rest.applicationStatus === 'approved' ? 'bg-green-100 text-green-600' :
                                        rest.applicationStatus === 'pending' ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'}`}>
                                    {(rest.applicationStatus || 'pending').toUpperCase()}
                                </span>
                            </div>

                            <div className="flex gap-3 mt-6">
                                {rest.applicationStatus === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(rest._id, 'approve')}
                                            className="flex-1 bg-green-50 text-green-600 font-medium py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(rest._id, 'reject')}
                                            className="flex-1 bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </>
                                ) : (
                                    <button className="w-full bg-gray-50 text-gray-500 font-medium py-2 rounded-lg cursor-not-allowed">
                                        No Actions Available
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminRestaurants;
