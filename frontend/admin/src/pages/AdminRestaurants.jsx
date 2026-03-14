import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Check, X, MapPin } from 'lucide-react';

const AdminRestaurants = () => {
    // Mock Data
    const [restaurants, setRestaurants] = useState([
        { id: 1, name: 'Burger King', location: 'New York, USA', status: 'active', rating: 4.5 },
        { id: 2, name: 'Pizza Hut', location: 'Brooklyn, USA', status: 'pending', rating: 0 },
        { id: 3, name: 'Sushi Place', location: 'Manhattan, USA', status: 'pending', rating: 0 },
        { id: 4, name: 'Taco Bell', location: 'Queens, USA', status: 'active', rating: 4.2 },
    ]);

    const handleAction = (id, action) => {
        setRestaurants(restaurants.map(rest =>
            rest.id === id
                ? { ...rest, status: action === 'approve' ? 'active' : 'rejected' }
                : rest
        ));
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
                        <div key={rest.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-dark">{rest.name}</h3>
                                    <div className="flex items-center gap-1 text-muted text-sm mt-1">
                                        <MapPin size={14} />
                                        <span>{rest.location}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                    ${rest.status === 'active' ? 'bg-green-100 text-green-600' :
                                        rest.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'}`}>
                                    {rest.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex gap-3 mt-6">
                                {rest.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(rest.id, 'approve')}
                                            className="flex-1 bg-green-50 text-green-600 font-medium py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(rest.id, 'reject')}
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
