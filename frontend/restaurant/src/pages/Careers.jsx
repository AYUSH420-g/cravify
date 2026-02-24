import React from 'react';
import StaticPage from '../components/StaticPage';

const Careers = () => {
    return (
        <StaticPage title="Careers">
            <p className="text-lg">Join us in our mission to revolutionize food delivery!</p>
            <p>We are always looking for talented individuals who are passionate, driven, and ready to make an impact. At Cravify, you'll work in a fast-paced environment where your ideas matter.</p>

            <h3 className="text-2xl font-bold mt-8 mb-4">Open Positions</h3>

            <div className="space-y-4">
                <div className="border border-gray-200 p-6 rounded-xl hover:border-primary transition-colors cursor-pointer block">
                    <h4 className="font-bold text-lg">Senior Frontend Engineer</h4>
                    <p className="text-gray-500 text-sm mb-2">Ahmedabad • Full-time</p>
                    <p className="text-sm">We are looking for an experienced React developer to lead our frontend team.</p>
                </div>
                <div className="border border-gray-200 p-6 rounded-xl hover:border-primary transition-colors cursor-pointer block">
                    <h4 className="font-bold text-lg">Backend Developer (Node.js)</h4>
                    <p className="text-gray-500 text-sm mb-2">Remote • Full-time</p>
                    <p className="text-sm">Join our backend team to build scalable APIs and microservices.</p>
                </div>
                <div className="border border-gray-200 p-6 rounded-xl hover:border-primary transition-colors cursor-pointer block">
                    <h4 className="font-bold text-lg">Marketing Manager</h4>
                    <p className="text-gray-500 text-sm mb-2">Ahmedabad • Full-time</p>
                    <p className="text-sm">Drive our growth and brand presence across channels.</p>
                </div>
            </div>

            <p className="mt-8 text-center text-gray-400">Don't see a role that fits? Email your resume to <a href="mailto:carriers@cravify.com" className="text-primary hover:underline">careers@cravify.com</a></p>
        </StaticPage>
    );
};

export default Careers;
