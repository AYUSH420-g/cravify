import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { DollarSign } from 'lucide-react';

const DeliveryHistory = () => {
    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold text-dark mb-6">Earnings & History</h1>

                    <div className="bg-dark text-white p-6 rounded-2xl mb-8 flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Total Earnings (This Week)</p>
                            <h2 className="text-4xl font-bold">₹4,250</h2>
                        </div>
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-dark">Order #ORD-20{i}</h4>
                                    <p className="text-sm text-gray-500">Oct {20 + i}, 2025 • 4.5km</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600 text-lg">+₹{40 + i * 5}</p>
                                    <p className="text-xs text-gray-400">Paid</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default DeliveryHistory;
