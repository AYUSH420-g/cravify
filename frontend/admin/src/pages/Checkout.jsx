import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import { Home, Briefcase, MapPin, CreditCard, Wallet, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

const Checkout = () => {
    const [selectedAddress, setSelectedAddress] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState('card');

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-dark mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Address & Payment */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Address Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-3">
                                        <MapPin className="text-dark" /> Select Address
                                    </h2>
                                    <Button variant="ghost" size="sm" className="text-primary hover:text-red-700 hover:bg-red-50">Add New</Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === 1 ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedAddress(1)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Home size={16} className={selectedAddress === 1 ? 'text-primary' : 'text-gray-400'} />
                                            <span className="font-bold">Home</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            123, CG Road, Navrangpura, Ahmedabad, 380009
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">25 mins</p>
                                    </div>

                                    <div
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === 2 ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedAddress(2)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={16} className={selectedAddress === 2 ? 'text-primary' : 'text-gray-400'} />
                                            <span className="font-bold">Work</span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            GIFT City, Gandhinagar, Gujarat
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">35 mins</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                    <Wallet className="text-dark" /> Payment Method
                                </h2>

                                <div className="space-y-3">
                                    <div
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'upi' ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedPayment('upi')}
                                    >
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="font-bold text-xs text-primary">UPI</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">UPI</h3>
                                            <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'upi' ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedPayment === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'card' ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedPayment('card')}
                                    >
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <CreditCard size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Credit / Debit Card</h3>
                                            <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'card' ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedPayment === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPayment === 'cod' ? 'border-primary bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                                        onClick={() => setSelectedPayment('cod')}
                                    >
                                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                                            <Banknote size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Cash on Delivery</h3>
                                            <p className="text-sm text-gray-500">Pay cash at your doorstep</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                                            {selectedPayment === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="font-bold text-lg mb-4">La Pino'z Pizza</h3>
                                <p className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">Ordered items</p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">7 cheese x 1</span>
                                        <span className="font-medium">₹250.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Choco Lava Cake 2</span>
                                        <span className="font-medium">₹80.00</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pb-6 border-b border-gray-100">
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Item Total</span>
                                        <span>₹330.00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Delivery Fee</span>
                                        <span>₹40.00</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Service Tax</span>
                                        <span>₹23.00</span>
                                    </div>
                                </div>

                                <div className="flex justify-between font-bold text-xl py-6">
                                    <span>To Pay</span>
                                    <span>₹393.00</span>
                                </div>

                                <Link to="/order-tracking" className="block w-full">
                                    <Button variant="primary" size="lg" className="w-full">Place Order</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Checkout;
