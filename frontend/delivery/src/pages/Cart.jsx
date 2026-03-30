import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, updateQuantity, cartTotal } = useCart();
    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-3xl mx-auto px-4">
                    <Link to="/" className="inline-flex items-center text-primary font-medium mb-6 hover:underline">
                        <ArrowLeft size={16} className="mr-2" /> Back to Home
                    </Link>

                    <h1 className="text-3xl font-bold text-dark mb-8">Your Cart</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left: Items */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Restaurant Info in Cart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <img src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=100&q=80" className="w-16 h-16 rounded-lg object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg">La Pino'z Pizza</h3>
                                    <p className="text-gray-500 text-sm">Praladnagar,Ahmadabad</p>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                {cartItems.length > 0 ? cartItems.map((item, index) => (
                                    <div key={item.id || index} className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6 last:mb-0 last:pb-0 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-4 h-4 border border-green-600 flex items-center justify-center rounded-sm shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-dark">{item.name}</h3>
                                                <p className="text-sm text-gray-500">₹{item.price?.toFixed(2) || item.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-gray-50">
                                                <button onClick={() => updateQuantity(item.id, 'minus')} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-dark font-bold">-</button>
                                                <span className="mx-2 font-medium w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 'plus')} className="w-6 h-6 flex items-center justify-center text-green-600 font-bold">+</button>
                                            </div>
                                            <div className="font-bold w-16 text-right">₹{((item.price || 0) * item.quantity).toFixed(2)}</div>
                                        </div>
                                    </div>
                                )) : <div className="text-center text-gray-500 py-4">Your cart is empty.</div>}
                            </div>

                            {/* Delivery Instructions */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold mb-4">Delivery Instructions</h3>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    <button className="px-4 py-2 border border-gray-200 rounded-xl hover:border-primary hover:text-primary transition-colors text-sm shrink-0">Avoid calling</button>
                                    <button className="px-4 py-2 border border-gray-200 rounded-xl hover:border-primary hover:text-primary transition-colors text-sm shrink-0">Leave at door</button>
                                    <button className="px-4 py-2 border border-gray-200 rounded-xl hover:border-primary hover:text-primary transition-colors text-sm shrink-0">Directions to reach</button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Bill */}
                        <div className="md:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="font-bold text-lg mb-6">Bill Details</h3>

                                <div className="space-y-3 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Item Total</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Delivery Fee</span>
                                        <span>₹40.00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Platform Fee</span>
                                        <span>₹5.00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>GST and Restaurant Charges</span>
                                        <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between font-bold text-xl py-6">
                                    <span>To Pay</span>
                                    <span>₹{(cartTotal + 40 + 5 + cartTotal * 0.05).toFixed(2)}</span>
                                </div>

                                <Link to="/checkout" className="block w-full">
                                    <Button variant="primary" size="lg" className="w-full">Proceed to Pay</Button>
                                </Link>

                                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-sm mb-1">Review your order and address details to avoid cancellations</h4>
                                    <p className="text-xs text-red-500">Note: If you cancel within 60 seconds of placing your order, a 100% refund will be issued. No refund for cancellations made after 60 seconds.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Cart;
