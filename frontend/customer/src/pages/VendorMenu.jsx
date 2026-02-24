import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const VendorMenu = () => {
    const [items, setItems] = useState([
        { id: 1, name: 'Paneer Tikka', price: '₹250', category: 'Starters', isVeg: true, available: true },
        { id: 2, name: 'Chicken Biryani', price: '₹350', category: 'Main Course', isVeg: false, available: true },
        { id: 3, name: 'Cola', price: '₹60', category: 'Beverages', isVeg: true, available: false },
    ]);

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-dark">Menu Management</h1>
                            <p className="text-gray-500">Manage your restaurant items and pricing</p>
                        </div>
                        <Button variant="primary" className="flex items-center gap-2">
                            <Plus size={18} /> Add New Item
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Item Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Category</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Price</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                                </div>
                                                <span className="font-bold text-dark">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{item.category}</td>
                                        <td className="p-4 font-medium">{item.price}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${item.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
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

export default VendorMenu;
