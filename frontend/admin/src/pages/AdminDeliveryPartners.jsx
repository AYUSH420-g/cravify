import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Check, X, FileText, Bike } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDeliveryPartners = () => {
    const { token } = useAuth();
    const [riders, setRiders] = useState([]);

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/delivery-partners', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRiders(data);
                }
            } catch (err) {
                console.error('Failed to fetch delivery partners', err);
            }
        };
        if (token) fetchRiders();
    }, [token]);

    const handleAction = async (id, action) => {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        try {
            const res = await fetch(`http://localhost:5000/api/admin/delivery-partners/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ applicationStatus: newStatus })
            });

            if (res.ok) {
                setRiders(riders.map(rider =>
                    rider._id === id ? { ...rider, applicationStatus: newStatus } : rider
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
                    <h1 className="text-3xl font-bold text-dark">Delivery Partner Approvals</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search riders..."
                            className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {riders.map(rider => (
                        <div key={rider._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Bike size={24} className="text-dark" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-dark">{rider.name}</h3>
                                        <p className="text-muted text-sm">{rider.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                    ${rider.applicationStatus === 'approved' ? 'bg-green-100 text-green-600' :
                                        rider.applicationStatus === 'pending' ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'}`}>
                                    {(rider.applicationStatus || 'pending').toUpperCase()}
                                </span>
                            </div>

                            <div className="mt-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <FileText size={16} />
                                    <span>Documents: <span className="font-medium">{rider.isVerified ? 'Verified' : 'Pending Review'}</span></span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {rider.applicationStatus === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(rider._id, 'approve')}
                                            className="flex-1 bg-green-50 text-green-600 font-medium py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(rider._id, 'reject')}
                                            className="flex-1 bg-red-50 text-red-600 font-medium py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                    </>
                                ) : (
                                    <button className="w-full bg-gray-50 text-gray-500 font-medium py-2 rounded-lg cursor-not-allowed">
                                        {rider.applicationStatus === 'approved' ? 'Partner Verified' : 'Application Rejected'}
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

export default AdminDeliveryPartners;
