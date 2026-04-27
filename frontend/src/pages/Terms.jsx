import React from 'react';
import StaticPage from '../components/StaticPage';

const Terms = () => {
    return (
        <StaticPage title="Terms & Conditions">
            <div className="space-y-8">
                <div>
                    <p className="text-sm text-gray-400 mb-6 font-medium">Last updated: April 2026</p>
                    <p className="text-gray-600 leading-relaxed">
                        These Terms and Conditions govern your use of the Cravify website, mobile application, and services. By using our platform, you agree to be bound by these terms. If you do not agree, please refrain from using our services.
                    </p>
                </div>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-gray-100 pb-2">1. Nature of Service</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Cravify is a multi-vendor platform that facilitates the sale of food and beverages between independent restaurants ("Restaurant Partners") and customers. We also facilitate the delivery of these orders via independent "Delivery Partners". Cravify does not prepare food and is not responsible for the quality, safety, or legal compliance of the food items.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-gray-100 pb-2">2. User Accounts & Eligibility</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        To use certain features, you must register for an account. You agree to provide accurate information and maintain the security of your credentials. You must be at least 18 years old or use the service under the supervision of a parent or legal guardian.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-gray-100 pb-2">3. Ordering & Payments</h3>
                    <ul className="list-disc pl-5 text-gray-500 text-sm space-y-2">
                        <li>All orders placed are subject to availability and acceptance by the Restaurant Partner.</li>
                        <li>Prices listed include applicable taxes unless stated otherwise. Delivery fees and platform fees are calculated at checkout.</li>
                        <li>Payments must be made through our integrated payment gateways. Cash on delivery may be available for specific regions.</li>
                        <li>Cravify reserves the right to cancel orders in case of suspected fraud or technical errors.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-gray-100 pb-2">4. Cancellations & Refunds</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Orders can only be cancelled before they are accepted by the restaurant. Once preparation has started, cancellations are not eligible for a full refund. Refunds for missing items or poor quality are subject to investigation and may be issued as Cravify Wallet credits.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold border-b border-gray-100 pb-2">5. Wallet & Loyalty Points</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Wallet credits and loyalty points earned on the platform are non-transferable and cannot be exchanged for cash. They may have an expiration date as specified in the promotion.
                    </p>
                </section>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mt-12">
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Need clarification?</p>
                    <p className="text-sm text-gray-600">If you have any questions regarding these terms, please contact our support team at <span className="font-bold underline">support@cravify.com</span></p>
                </div>
            </div>
        </StaticPage>
    );
};

export default Terms;
