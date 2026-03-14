import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Search, Eye, XCircle, Clock } from 'lucide-react';

const AdminOrders = () => {
    // Mock Data
    const [orders, setOrders] = useState([
        { id: '#ORD-001', customer: 'Ayush Soni', restaurant: 'Burger King', amount: '₹450.00', status: 'preparing', time: '10 mins ago' },
        { id: '#ORD-002', customer: 'Parin Makwana', restaurant: 'Pizza Hut', amount: '₹325.00', status: 'delivered', time: '2 hours ago' },
        { id: '#ORD-003', customer: 'John Doe', restaurant: 'Taco Bell', amount: '₹150.00', status: 'pending', time: '5 mins ago' },
        { id: '#ORD-004', customer: 'Jane Smith', restaurant: 'Sushi Place', amount: '₹600.00', status: 'cancelled', time: '1 day ago' },
    ]);

    const handleCancel = (id) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            setOrders(orders.map(order =>
                order.id === id ? { ...order, status: 'cancelled' } : order
            ));
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">Platform Orders</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                <th className="p-4 font-semibold text-gray-600">Customer</th>
                                <th className="p-4 font-semibold text-gray-600">Restaurant</th>
                                <th className="p-4 font-semibold text-gray-600">Amount</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Time</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-primary">{order.id}</td>
                                    <td className="p-4 text-dark">{order.customer}</td>
                                    <td className="p-4 text-dark">{order.restaurant}</td>
                                    <td className="p-4 font-medium">{order.amount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-orange-100 text-orange-600'}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm flex items-center gap-1">
                                        <Clock size={14} /> {order.time}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        {['pending', 'preparing'].includes(order.status) && (
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel Order"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
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

export default AdminOrders;
