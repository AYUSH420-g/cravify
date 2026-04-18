import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Ban, CheckCircle, Clock, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); 
    // Tabs: 'pending', 'customers', 'restaurants', 'riders'
    const { user, token, loading } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (token && user?.role === 'admin') fetchUsers();
        if (user && user.role !== 'admin') setAuthError(true);
    }, [token, user]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
                setAuthError(false);
            } else if (res.status === 403) {
                setAuthError(true);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const approveUser = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Approve this partner?")) return;
        try {
            const res = await fetch(`/api/admin/approve/${id}`, { 
                method: 'PUT', 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (res.ok) fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const rejectUser = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Reject and delete this partner request?")) return;
        try {
            const res = await fetch(`/api/admin/reject/${id}`, { 
                method: 'DELETE', 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (res.ok) {
                fetchUsers();
                if(selectedUser && selectedUser._id === id) setSelectedUser(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Categorization Logic
    const pendingData = allUsers.filter(u => !u.isVerified && u.role !== 'customer' && u.role !== 'admin');
    const customersData = allUsers.filter(u => u.role === 'customer');
    const restaurantsData = allUsers.filter(u => u.role === 'restaurant_partner' && u.isVerified);
    const ridersData = allUsers.filter(u => u.role === 'delivery_partner' && u.isVerified);

    let activeData = [];
    if (activeTab === 'pending') activeData = pendingData;
    if (activeTab === 'customers') activeData = customersData;
    if (activeTab === 'restaurants') activeData = restaurantsData;
    if (activeTab === 'riders') activeData = ridersData;

    const filteredData = activeData.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Relative base for physical files served by Vite proxy
    const API_BASE = ''; 

    if (authError) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl inline-block">
                        <Ban size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
                        <p className="text-red-700 mb-6">You must be logged in as an Administrator to view this page.</p>
                        <p className="text-sm text-gray-600 mb-4">You are currently logged in as: <b>{user?.email}</b> ({user?.role})</p>
                        <Button variant="primary" onClick={() => window.location.href='/login'}>Switch to Admin Account</Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-dark">User Management</h1>

                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                {/* Advanced Categorization Tabs */}
                <div className="flex flex-wrap gap-6 mb-6 border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 font-medium flex items-center gap-2 transition-colors ${activeTab === 'pending' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Approvals
                        {pendingData.length > 0 && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingData.length}</span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('restaurants')}
                        className={`pb-3 font-medium transition-colors ${activeTab === 'restaurants' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Restaurants ({restaurantsData.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('riders')}
                        className={`pb-3 font-medium transition-colors ${activeTab === 'riders' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Delivery Fleet ({ridersData.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('customers')}
                        className={`pb-3 font-medium transition-colors ${activeTab === 'customers' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Customers ({customersData.length})
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Name / Business</th>
                                <th className="p-4 font-semibold text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Phone</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No users found in this category.
                                    </td>
                                </tr>
                            ) : filteredData.map(user => (
                                <tr 
                                    key={user._id} 
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td className="p-4">
                                        <p className="font-medium text-dark">{user.name}</p>
                                        {user.restaurantDetails?.restaurantName && (
                                            <p className="text-xs text-gray-500">{user.restaurantDetails.restaurantName}</p>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500">{user.email}</td>
                                    <td className="p-4 text-gray-500">{user.phone || 'N/A'}</td>
                                    <td className="p-4">
                                        {user.isVerified || user.role === 'customer' ? (
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-orange-500">
                                                <Clock size={14} /> Pending Review
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        {activeTab === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                    }}
                                                    className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-red-700 transition shadow-sm flex items-center gap-2"
                                                >
                                                    Review Application <ExternalLink size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => approveUser(user._id, e)}
                                                    className="p-2 rounded-lg transition-colors text-green-600 bg-green-50 hover:bg-green-100"
                                                    title="Quick Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="px-4 py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition"
                                            >
                                                View Profile
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detailed Information Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {selectedUser.name}'s Profile
                                </h3>
                                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium uppercase">Role</p>
                                        <p className="font-semibold">{selectedUser.role.replace('_', ' ')}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium uppercase">Account Status</p>
                                        <p className="font-semibold">{selectedUser.isVerified || selectedUser.role==='customer' ? 'Active' : 'Pending Approval'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                                        <p className="font-semibold">{selectedUser.email}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium uppercase">Phone Number</p>
                                        <p className="font-semibold">{selectedUser.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                {selectedUser.restaurantDetails?.restaurantName && (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
                                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                                            <h4 className="font-bold text-gray-800">Business & Legal Particulars</h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase">Restaurant Name</p>
                                                    <p className="font-medium">{selectedUser.restaurantDetails.restaurantName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase">Primary Cuisine</p>
                                                    <p className="font-medium">{selectedUser.restaurantDetails.cuisine}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 uppercase">Full Address</p>
                                                    <p className="font-medium">{selectedUser.restaurantDetails.address}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 uppercase">FSSAI License No.</p>
                                                    <p className="font-medium">{selectedUser.restaurantDetails.fssai}</p>
                                                </div>
                                            </div>

                                            {/* Physical Documents Links */}
                                            {selectedUser.restaurantDetails.documents && (
                                                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                                                    <h5 className="text-sm font-bold text-gray-700">Uploaded Documents</h5>
                                                    
                                                    {selectedUser.restaurantDetails.documents.fssaiCertUrl && (
                                                        <a href={`${API_BASE}${selectedUser.restaurantDetails.documents.fssaiCertUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition">
                                                            <span className="font-medium text-sm">FSSAI Certificate (PNG)</span>
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                    
                                                    {selectedUser.restaurantDetails.documents.gstCertUrl && (
                                                        <a href={`${API_BASE}${selectedUser.restaurantDetails.documents.gstCertUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                                                            <span className="font-medium text-sm">GST Certificate (PDF)</span>
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}

                                                    {selectedUser.restaurantDetails.documents.menuCardUrl && (
                                                        <a href={`${API_BASE}${selectedUser.restaurantDetails.documents.menuCardUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                                                            <span className="font-medium text-sm">Sample Menu Card (PDF)</span>
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Approvals Footer via Details View */}
                            {(!selectedUser.isVerified && selectedUser.role !== 'customer') && (
                                <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50 sticky bottom-0">
                                    <button
                                        onClick={(e) => approveUser(selectedUser._id, e)}
                                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-sm"
                                    >
                                        Approve Vendor
                                    </button>
                                    <button
                                        onClick={(e) => rejectUser(selectedUser._id, e)}
                                        className="flex-1 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition"
                                    >
                                        Reject & Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};

export default AdminUsers;
