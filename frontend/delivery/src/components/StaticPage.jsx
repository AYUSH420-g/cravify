import React from 'react';
import MainLayout from '../layouts/MainLayout';

const StaticPage = ({ title, children }) => {
    return (
        <MainLayout>
            <div className="bg-dark text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 pb-16">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 text-dark leading-relaxed space-y-6">
                    {children}
                </div>
            </div>
        </MainLayout>
    );
};

export default StaticPage;
