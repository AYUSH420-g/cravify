import React from 'react';
import StaticPage from '../components/StaticPage';

const Privacy = () => {
    return (
        <StaticPage title="Privacy Policy">
            <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>

            <h3 className="text-xl font-bold mt-6">Information We Collect</h3>
            <p>We collect information you provide directly to us, such as your name, email address, phone number, and delivery address when you create an account or place an order.</p>

            <h3 className="text-xl font-bold mt-6">How We Use Information</h3>
            <p>We use your information to facilitate order delivery, improve our services, and communicate with you about promotions and updates.</p>

            <h3 className="text-xl font-bold mt-6">Data Security</h3>
            <p>We implement industry-standard security measures to protect your data from unauthorized access or disclosure.</p>
        </StaticPage>
    );
};

export default Privacy;
