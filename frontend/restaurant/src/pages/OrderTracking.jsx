import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Phone, MessageSquare, MapPin, CheckCircle } from 'lucide-react';

const OrderTracking = () => {
    return (
        <MainLayout>
            <div className="min-h-screen bg-white">
                {/* Progress Bar Header */}
                <div className="bg-dark text-white py-12">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-8">Arriving in 25 mins</h1>

                        <div className="flex items-center justify-between relative px-4 md:px-12">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-700 -z-0"></div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3/4 h-1 bg-green-500 -z-0"></div>

                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={16} /></div>
                                <span className="text-xs font-medium text-gray-400">Ordered</span>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={16} /></div>
                                <span className="text-xs font-medium text-gray-400">Preparing</span>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={16} /></div>
                                <span className="text-xs font-medium text-gray-400">Picked Up</span>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500 border-4 border-dark flex items-center justify-center text-white animate-pulse">4</div>
                                <span className="text-xs font-bold text-white">Out for Delivery</span>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">5</div>
                                <span className="text-xs font-medium text-gray-400">Delivered</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Map Placeholder */}
                    <div className="lg:col-span-2 bg-gray-100 rounded-3xl h-[500px] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.006,40.7128,13,0/800x600?access_token=YOUR_TOKEN')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all" />
                        <div className="relative z-10 bg-white p-6 rounded-2xl shadow-xl text-center">
                            <MapPin className="mx-auto text-primary mb-2" size={32} />
                            <h3 className="font-bold text-lg">Live Tracking Map</h3>
                            <p className="text-gray-500">Map view would be integrated here</p>
                        </div>
                    </div>

                    {/* Details Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Delivery Partner */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark mb-4">Delivery Partner</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Driver" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                                <div>
                                    <h4 className="font-bold text-lg">Michael Scott</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded">4.8 ★</span>
                                        <span className="text-gray-400 text-xs">1.2k orders</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark hover:bg-gray-50"><Phone size={18} /> Call</Button>
                                <Button variant="outline" className="flex-1 gap-2 border-gray-200 text-dark hover:bg-gray-50"><MessageSquare size={18} /> Chat</Button>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-dark mb-4">Order Details</h3>
                            <p className="text-gray-500 text-sm mb-4">Order #CRV-88219</p>
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark font-medium">1 x 7 cheese</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-dark font-medium">2 x Choco Lava Cake</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold">
                                <span>Total</span>
                                <span>₹393.00</span>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full mt-4 text-primary">Need Help?</Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default OrderTracking;
