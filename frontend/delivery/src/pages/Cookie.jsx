import React from 'react';
import StaticPage from '../components/StaticPage';

const Cookie = () => {
    return (
        <StaticPage title="Cookie Policy">
            <p>We use cookies to enhance your experience on our platform.</p>

            <h3 className="text-xl font-bold mt-6">What are Cookies?</h3>
            <p>Cookies are small text files stored on your device that help us remember your preferences and improve site functionality.</p>

            <h3 className="text-xl font-bold mt-6">Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., login status, cart items).</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site.</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements.</li>
            </ul>

            <h3 className="text-xl font-bold mt-6">Managing Cookies</h3>
            <p>You can control and manage cookies through your browser settings.</p>
        </StaticPage>
    );
};

export default Cookie;
