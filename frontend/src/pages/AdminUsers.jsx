import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Ban, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminUsers = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminAPI.getUsers();
                setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users', err);
            }
        };

        if (token) fetchUsers();
    }, [token]);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        try {
            await adminAPI.toggleUserStatus(id, newStatus);
            setUsers(users.map(user =>
                user._id === id ? { ...user, status: newStatus } : user
            ));
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    // Filter users by search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">User Management</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Role</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-dark">{user.name}</td>
                                    <td className="p-4 text-gray-500">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                                user.role === 'restaurant_partner' ? 'bg-orange-100 text-orange-600' :
                                                    user.role === 'delivery_partner' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1.5 text-sm font-medium
                                            ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                            {user.status === 'active' ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(user._id, user.status)}
                                            className={`p-2 rounded-lg transition-colors
                                                ${user.status === 'active'
                                                    ? 'text-red-500 hover:bg-red-50'
                                                    : 'text-green-500 hover:bg-green-50'}`}
                                            title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                        >
                                            {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminUsers;
