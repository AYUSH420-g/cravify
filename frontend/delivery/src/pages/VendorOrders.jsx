import React from 'react';
import MainLayout from '../layouts/MainLayout';

const VendorOrders = () => {
    const orders = [
        { id: '#ORD-101', customer: 'John Doe', items: '2x Paneer Tikka', amount: '₹450', date: 'Oct 24, 2025', status: 'Delivered' },
        { id: '#ORD-102', customer: 'Jane Smith', items: '1x Biryani', amount: '₹350', date: 'Oct 24, 2025', status: 'Cancelled' },
        { id: '#ORD-103', customer: 'Mike Ross', items: '4x Burgers', amount: '₹800', date: 'Oct 23, 2025', status: 'Delivered' },
    ];

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-dark mb-8">Order History</h1>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Order ID</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Customer</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Items</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Amount</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Date</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-bold text-primary">{order.id}</td>
                                        <td className="p-4 text-dark font-medium">{order.customer}</td>
                                        <td className="p-4 text-gray-600">{order.items}</td>
                                        <td className="p-4 font-bold">{order.amount}</td>
                                        <td className="p-4 text-gray-500 text-sm">{order.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default VendorOrders;
