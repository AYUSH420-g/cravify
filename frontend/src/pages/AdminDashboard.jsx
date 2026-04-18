import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Bike, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-dark mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user, token, loading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        restaurants: 0,
        riders: 0,
        revenue: 0
    });
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                if (res.status === 403) {
                    setAuthError(true);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if(data && typeof data.users !== 'undefined') {
                    setStats(data);
                    setAuthError(false);
                }
            })
            .catch(err => console.error(err));
        } else if (user && user.role !== 'admin') {
            setAuthError(true);
        }
    }, [token, user]);

    if (loading) return <div>Loading...</div>;

    if (authError) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl inline-block">
                        <Users size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Unauthorized</h2>
                        <p className="text-red-700 mb-6">This dashboard is restricted to Admin accounts only.</p>
                        <p className="text-sm text-gray-600 mb-4">Current User: <b>{user?.email}</b></p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition"
                        >
                            Log in as Admin
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-500" />
                    <StatCard title="Restaurants" value={stats.restaurants} icon={Store} color="bg-orange-500" />
                    <StatCard title="Delivery Partners" value={stats.riders} icon={Bike} color="bg-green-500" />
                    <StatCard title="Total Orders" value={stats.orders || 0} icon={Users} color="bg-indigo-500" />
                    <StatCard title="Total Revenue" value={`₹${(stats.revenue || 0).toLocaleString()}`} icon={DollarSign} color="bg-purple-500" />
                </div>

                <h2 className="text-xl font-bold text-dark mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div onClick={() => navigate('/admin/users')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                            <Users size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-lg text-dark mb-1">Manage Users</h3>
                        <p className="text-sm text-gray-500">View and manage customer accounts.</p>
                    </div>

                    <div onClick={() => navigate('/admin/restaurants')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                            <Store size={24} className="text-orange-600" />
                        </div>
                        <h3 className="font-bold text-lg text-dark mb-1">Restaurant Approvals</h3>
                        <p className="text-sm text-gray-500">Approve or reject new restaurants.</p>
                    </div>

                    <div onClick={() => navigate('/admin/delivery-partners')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                            <Bike size={24} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-lg text-dark mb-1">Delivery Partners</h3>
                        <p className="text-sm text-gray-500">Verify rider documents and status.</p>
                    </div>

                    <div onClick={() => navigate('/admin/orders')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                            <DollarSign size={24} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-lg text-dark mb-1">Live Orders</h3>
                        <p className="text-sm text-gray-500">Monitor and cancel platform orders.</p>
                    </div>

                    <div onClick={() => navigate('/admin/settings')} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
                        <div className="bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                            <Users size={24} className="text-gray-600" />
                        </div>
                        <h3 className="font-bold text-lg text-dark mb-1">System Settings</h3>
                        <p className="text-sm text-gray-500">Configure fees and platform modes.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"></div>
            </div>
        </MainLayout>
    );
};

export default AdminDashboard;
