import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Plus, Trash2, Edit2, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VendorMenu = () => {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItemId, setEditItemId] = useState(null);

    // Form state
    const [newItem, setNewItem] = useState({ name: '', price: '', category: '', isVeg: true, description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, [token]);

    const fetchMenu = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/vendor/menu', { headers: { 'x-auth-token': token } });
            const data = await res.json();
            if (res.ok) setItems(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch(`/api/vendor/menu/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) setItems(data.menu);
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditClick = (item) => {
        setNewItem({
            name: item.name,
            price: item.price,
            category: item.category,
            isVeg: item.isVeg,
            description: item.description || ''
        });
        setEditItemId(item._id);
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditItemId(null);
        setNewItem({ name: '', price: '', category: '', isVeg: true, description: '' });
        setImageFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', newItem.name);
        formData.append('price', String(newItem.price));
        formData.append('category', newItem.category);
        formData.append('isVeg', JSON.stringify(newItem.isVeg));
        formData.append('description', newItem.description);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        const url = editItemId
            ? `/api/vendor/menu/${editItemId}`
            : '/api/vendor/menu';

        const method = editItemId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'x-auth-token': token
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Request failed');
            }

            setItems(data.menu);
            handleCloseModal();

        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-dark">Menu Management</h1>
                            <p className="text-gray-500">Manage your restaurant items and pricing</p>
                        </div>
                        <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Add New Item
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Item Name</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Image</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Category</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500">Price</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 text-center">Dietary</th>
                                    <th className="p-4 text-sm font-semibold text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading menu...</td></tr>
                                ) : items.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">Your menu is empty. Add some items!</td></tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/50">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-dark">{item.name}</span>
                                                    {item.description && <span className="text-xs text-gray-500 line-clamp-1">{item.description}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border" />
                                                ) : <span className="text-xs text-gray-400">No Img</span>}
                                            </td>
                                            <td className="p-4 text-gray-600">{item.category}</td>
                                            <td className="p-4 font-medium text-primary">₹{item.price}</td>
                                            <td className="p-4 text-center">
                                                <div className={`inline-flex w-4 h-4 border-2 rounded-sm items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Item Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-dark">{editItemId ? 'Edit Item' : 'Add New Item'}</h2>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-dark">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                        <input type="text" required className="w-full border rounded-xl px-4 py-2 focus:ring-primary focus:border-primary"
                                            value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Garlic Bread" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                        <input type="number" required min="1" className="w-full border rounded-xl px-4 py-2 focus:ring-primary focus:border-primary"
                                            value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} placeholder="150" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input type="text" required className="w-full border rounded-xl px-4 py-2 focus:ring-primary focus:border-primary"
                                            value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="Starters" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                        <textarea className="w-full border rounded-xl px-4 py-2 focus:ring-primary focus:border-primary" rows="2"
                                            value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Delicious garlic bread with cheese..." />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Dietary Preference</label>
                                        <select className="border rounded-xl px-4 py-2" value={newItem.isVeg} onChange={e => setNewItem({ ...newItem, isVeg: e.target.value === 'true' })}>
                                            <option value="true">Veg 🟢</option>
                                            <option value="false">Non-Veg 🔴</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{editItemId ? 'Update Item Image (Optional)' : 'Item Image (Optional)'}</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2"
                                            onClick={() => document.getElementById('image-upload').click()}>
                                            <Upload className="text-gray-400 w-5 h-5" />
                                            <span className="text-sm text-gray-600 font-medium">{imageFile ? imageFile.name : 'Click to select image file'}</span>
                                        </div>
                                        <input id="image-upload" name="image" type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Button type="submit" variant="primary" className="w-full flex justify-center py-3" disabled={isSubmitting}>
                                        {isSubmitting ? (editItemId ? 'Updating...' : 'Adding...') : (editItemId ? 'Save Changes' : 'Add Item')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default VendorMenu;
