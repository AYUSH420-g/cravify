import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { ChevronLeft, Star, Clock, Shield, MapPin, Settings, LogOut, FileText, Bike } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { getDeliveryStats } from '../utils/deliveryState';

const DeliveryProfile = () => {
    const stats = getDeliveryStats();
    const dynamicRatings = 124 + Math.floor(stats.ordersCount / 2);
    const dynamicAcceptance = Math.min(100, 95 + Math.floor(stats.ordersCount / 5));
    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
                <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                        <Link to="/delivery/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">Profile & Stats</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* User Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Ramesh+Kumar&background=random" alt="Rider" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">Ramesh Kumar</h2>
                            <p className="text-gray-500 text-sm">ID: DRV-88219 • Joined Nov 2024</p>
                            <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                <Star size={16} fill="currentColor" />
                                <span className="font-bold">4.8</span>
                                <span className="text-gray-400 text-xs">({dynamicRatings} ratings)</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircleIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">{dynamicAcceptance}%</h3>
                            <p className="text-xs text-gray-500">Order Acceptance</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">95%</h3>
                            <p className="text-xs text-gray-500">On-Time Delivery</p>
                        </div>
                    </div>

                    {/* Shift & Vehicle */}
                    <h3 className="font-bold text-lg mb-4">Settings & Documents</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                            <Bike className="text-gray-400" size={20} />
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">Vehicle Type</h4>
                                <p className="text-xs text-gray-500">Honda Activa (GJ-01-AB-1234)</p>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-300" size={20} />
                        </div>
                        <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                            <FileText className="text-gray-400" size={20} />
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">Documents</h4>
                                <p className="text-xs text-green-500">Verified</p>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-300" size={20} />
                        </div>
                        <div className="p-4 border-b border-gray-50 flex items-center gap-4 hover:bg-gray-50 cursor-pointer">
                            <Clock className="text-gray-400" size={20} />
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-800">Shift Preferences</h4>
                                <p className="text-xs text-gray-500">Full Time (10 AM - 8 PM)</p>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-300" size={20} />
                        </div>
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer pb-20">
                            <LogOut className="text-red-500" size={20} />
                            <div className="flex-1">
                                <h4 className="font-medium text-red-500">Logout</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

export default DeliveryProfile;
