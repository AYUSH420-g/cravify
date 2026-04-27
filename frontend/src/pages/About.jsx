import React from 'react';
import StaticPage from '../components/StaticPage';

const About = () => {
    return (
        <StaticPage title="About Us">
            <div className="space-y-6">
                <p className="text-lg leading-relaxed">
                    Welcome to <span className="text-primary font-bold">Cravify</span>, where technology meets taste. We are a hyper-local food delivery ecosystem dedicated to transforming the way you experience flavor. Founded with a vision to bridge the gap between hungry foodies and the best culinary artists in Gujarat, we've built a platform that is fast, reliable, and incredibly intuitive.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-primary text-2xl">🚀</span> Fast & Reliable
                        </h3>
                        <p className="text-gray-500">Our advanced logistics engine ensures your food reaches you while it's still steaming hot. Real-time tracking keeps you informed every step of the way.</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-primary text-2xl">🛡️</span> Quality & Hygiene
                        </h3>
                        <p className="text-gray-500">We partner only with verified restaurants that maintain the highest standards of cleanliness and food safety, so you can eat with complete peace of mind.</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-primary text-2xl">🎙️</span> Tech-Driven
                        </h3>
                        <p className="text-gray-500">From voice-activated searching to AI-driven restaurant recommendations, we use cutting-edge technology to make ordering as easy as speaking.</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-primary text-2xl">🤝</span> Empowering Partners
                        </h3>
                        <p className="text-gray-500">Cravify isn't just an app; it's an opportunity. We empower local restaurant owners and delivery partners with tools to grow their businesses and livelihoods.</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Our Mission</h3>
                    <p className="text-gray-600 italic">"To deliver happiness and satisfy every craving by creating a seamless connection between the kitchen and the doorstep."</p>
                </div>

                <div className="py-6">
                    <h3 className="text-2xl font-black mb-4 tracking-tight">Our Journey</h3>
                    <p className="text-gray-500 leading-relaxed">
                        What started as a simple idea in Gujarat has evolved into a robust network of hundreds of restaurants and thousands of satisfied customers. We are constantly innovating, adding features like wallet loyalty points and dynamic tracking to ensure that Cravify remains the most loved food delivery platform in the region.
                    </p>
                </div>
            </div>
        </StaticPage>
    );
};

export default About;
