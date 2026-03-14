import React from 'react';
import StaticPage from '../components/StaticPage';

const Refund = () => {
    return (
        <StaticPage title="Refund & Cancellation Policy">
            <h3 className="text-xl font-bold mt-6">Calculations</h3>
            <p>Refunds are processed based on the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>If the restaurant cancels your order, you will receive a 100% refund.</li>
                <li>If you cancel within 60 seconds of placing the order, you will receive a 100% refund.</li>
                <li>If you cancel after 60 seconds, no refund will be issued as food preparation would have started.</li>
                <li>In case of missing items or poor quality (verified by photo proof), a partial or full refund may be initiated by support.</li>
            </ul>

            <h3 className="text-xl font-bold mt-6">Processing Time</h3>
            <p>Refunds usually take 5-7 business days to reflect in your original payment source.</p>
        </StaticPage>
    );
};

export default Refund;
