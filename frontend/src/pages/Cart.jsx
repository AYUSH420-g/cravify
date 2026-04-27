import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Cart = () => {
    const { cartItems, restaurant, updateQuantity, removeFromCart, cartTotal, platformFee } = useCart();

    if (cartItems.length === 0) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-section py-16 flex flex-col items-center justify-center">
                    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add items from a restaurant to get started</p>
                    <Link to="/">
                        <Button variant="primary" size="lg">Browse Restaurants</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-dark mb-8">Your Cart</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            {/* Restaurant Info in Cart */}
                            {restaurant && (
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                    <img src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=100&q=80'} className="w-16 h-16 rounded-lg object-cover" alt={restaurant.name} />
                                    <div>
                                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                                        <p className="text-xs text-gray-400">Ordering from {restaurant.address}</p>
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                {cartItems.map((item, index) => (
                                    <div key={item._id || item.id} className={`flex items-center justify-between ${index < cartItems.length - 1 ? 'pb-6 border-b border-gray-100 mb-6' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-4 h-4 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded-sm shrink-0`}>
                                                <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-dark">{item.name}</h3>
                                                <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-gray-50">
                                                <button onClick={() => updateQuantity(item._id || item.id, 'minus')} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-dark font-bold">-</button>
                                                <span className="mx-2 font-medium w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id || item.id, 'plus')} className="w-6 h-6 flex items-center justify-center text-green-600 font-bold">+</button>
                                            </div>
                                            <div className="font-bold w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Bill */}
                        <div className="md:col-span-1">
                            {(() => {
                                const totalToPay = cartTotal + platformFee;

                                return (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                        <h3 className="font-bold text-lg mb-6">Bill Details</h3>

                                        <div className="space-y-3 pb-6 border-b border-gray-100">
                                            <div className="flex justify-between text-gray-500 text-sm">
                                                <span>Item Total</span>
                                                <span>₹{cartTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-500 text-sm">
                                                <span>Platform Fee</span>
                                                <span>₹{platformFee.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between font-black text-xl py-6 italic text-dark">
                                            <span>Subtotal</span>
                                            <span>₹{totalToPay.toFixed(2)}</span>
                                        </div>

                                        <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-tighter">
                                                💡 Delivery fee, GST, and special offers will be calculated at the checkout page.
                                            </p>
                                        </div>

                                        <Link to="/checkout" className="block w-full">
                                            <Button variant="primary" size="lg" className="w-full rounded-xl py-4 shadow-lg shadow-primary/20">Proceed to Checkout</Button>
                                        </Link>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Cart;
