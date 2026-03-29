import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Tag, CheckCircle, Ban, Plus, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const AdminOffers = () => {
    const { token } = useAuth();
    const [promos, setPromos] = useState([]);
    const [newPromo, setNewPromo] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: 0,
        expiryDate: ''
    });

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const data = await adminAPI.getPromos();
                setPromos(data);
            } catch (err) {
                console.error('Failed to fetch promos', err);
            }
        };
        if (token) fetchPromos();
    }, [token]);

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newPromo };
            if (!payload.expiryDate) {
                // Default expiry 30 days from now
                const d = new Date();
                d.setDate(d.getDate() + 30);
                payload.expiryDate = d.toISOString();
            }

            const data = await adminAPI.createPromo(payload);
            setPromos([data.promo, ...promos]);
            setNewPromo({
                code: '', description: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, expiryDate: ''
            });
        } catch (err) {
            console.error('Failed to create promo', err);
            alert(`Error: ${err.message || 'Failed to create promo'}`);
        }
    };

    const togglePromo = async (id) => {
        try {
            const data = await adminAPI.togglePromo(id);
            setPromos(promos.map(p => p._id === id ? data.promo : p));
        } catch (err) {
            console.error('Failed to toggle promo', err);
        }
    };

    const deletePromo = async (id) => {
        if (!window.confirm("Delete this promo permanently?")) return;
        try {
            await adminAPI.deletePromo(id);
            setPromos(promos.filter(p => p._id !== id));
        } catch (err) {
            console.error('Failed to delete promo', err);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-dark">Promotional Campaigns</h1>
                </div>

                {/* Create Promo Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-xl font-bold text-dark mb-4">Create New Promo</h2>
                    <form onSubmit={handleCreatePromo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                            <input type="text" required placeholder="e.g. SUMMER50" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" required placeholder="50% off up to ₹100" value={newPromo.description} onChange={e => setNewPromo({...newPromo, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                            <select value={newPromo.discountType} onChange={e => setNewPromo({...newPromo, discountType: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary">
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                            <input type="number" required min="1" value={newPromo.discountValue} onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="flex items-end">
                            <Button variant="primary" type="submit" className="w-full py-2 flex justify-center items-center gap-2">
                                <Plus size={18} /> Add Promo
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Promos List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Code</th>
                                <th className="p-4 font-semibold text-gray-600">Details</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.map(promo => (
                                <tr key={promo._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="text-primary" size={18} />
                                            <span className="font-bold text-dark">{promo.code}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-dark">{promo.description}</p>
                                        <p className="text-sm text-gray-500">
                                            Discounts {promo.discountValue}{promo.discountType === 'percentage' ? '%' : '₹'}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${promo.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {promo.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2 justify-end">
                                        <button onClick={() => togglePromo(promo._id)} className={`p-2 rounded-lg transition-colors ${promo.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`} title={promo.isActive ? 'Disable Promo' : 'Enable Promo'}>
                                            {promo.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                        <button onClick={() => deletePromo(promo._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">No promotional campaigns found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminOffers;
