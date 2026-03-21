import React from 'react';
import MainLayout from '../layouts/MainLayout';

const Offers = () => {
    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Offers for you</h1>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-dashed border-primary bg-red-50 p-6 rounded-xl">
                        <h3 className="font-bold text-lg text-primary">50% OFF</h3>
                        <p className="text-gray-600">Up to ₹100 on your first order. Code: WELCOME50</p>
                    </div>
                    <div className="border border-dashed border-secondary bg-orange-50 p-6 rounded-xl">
                        <h3 className="font-bold text-lg text-secondary">Free Delivery</h3>
                        <p className="text-gray-600">On all orders above ₹500.</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Offers;
