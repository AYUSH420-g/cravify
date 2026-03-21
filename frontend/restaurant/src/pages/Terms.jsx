import React from 'react';
import StaticPage from '../components/StaticPage';

const Terms = () => {
    return (
        <StaticPage title="Terms & Conditions">
            <p className="text-sm text-gray-500 mb-6">Last updated: October 2025</p>

            <h3 className="text-xl font-bold mt-6">1. Acceptance of Terms</h3>
            <p>By accessing and using the Cravify platform, you agree to comply with and be bound by these Terms and Conditions.</p>

            <h3 className="text-xl font-bold mt-6">2. Use of Service</h3>
            <p>Cravify provides a platform to connect users with restaurants and delivery partners. We do not prepare food or control the quality of food provided by restaurants.</p>

            <h3 className="text-xl font-bold mt-6">3. User Accounts</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

            <h3 className="text-xl font-bold mt-6">4. Orders and Payments</h3>
            <p>All orders are subject to acceptance by the restaurant. Payments must be made through the platform using the available payment methods.</p>
        </StaticPage>
    );
};

export default Terms;
