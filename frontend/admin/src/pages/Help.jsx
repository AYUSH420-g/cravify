import React from 'react';
import StaticPage from '../components/StaticPage';

const Help = () => {
    return (
        <StaticPage title="Help & Support">
            <h3 className="text-xl font-bold mt-6">Frequently Asked Questions</h3>

            <div className="space-y-6 mt-6">
                <div>
                    <h4 className="font-bold text-lg mb-2">Where is my order?</h4>
                    <p className="text-gray-600">You can track your order live from the 'Order Tracking' page linked in your profile or confirmation email.</p>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">Can I cancel my order?</h4>
                    <p className="text-gray-600">Yes, you can cancel within 60 seconds of placing the order for a full refund. After that, cancellation credits depend on restaurant policy.</p>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2">My payment failed but money was deducted.</h4>
                    <p className="text-gray-600">Don't worry! Any deducted amount for a failed order is automatically refunded within 5-7 business days.</p>
                </div>
            </div>

            <h3 className="text-xl font-bold mt-12 mb-6">Contact Us</h3>
            <p className="mb-4">Still need help? Our support team is available 24/7.</p>
            <p className="font-medium text-primary">Email: support@cravify.com</p>
            <p className="font-medium text-primary">Phone: +91 98765 43210</p>
        </StaticPage>
    );
};

export default Help;
