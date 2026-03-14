import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Ban, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
    // Mock Data
    const [users, setUsers] = useState([
        { id: 1, name: 'Ayush Soni', email: 'ayush@example.com', role: 'customer', status: 'active' },
        { id: 2, name: 'Parin Makwana', email: 'parin@example.com', role: 'restaurant_partner', status: 'active' },
        { id: 3, name: 'Nevil Nandasana', email: 'nevil@example.com', role: 'delivery_partner', status: 'active' },
        { id: 4, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'blocked' },
        { id: 5, name: 'Jane Smith', email: 'jane@example.com', role: 'customer', status: 'active' },
    ]);

    const toggleStatus = (id) => {
        setUsers(users.map(user =>
            user.id === id
                ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
                : user
        ));
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">User Management</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
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
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                                            onClick={() => toggleStatus(user.id)}
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
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminUsers;
