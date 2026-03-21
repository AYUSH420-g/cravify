import React from 'react';
import StaticPage from '../components/StaticPage';

const Blog = () => {
    return (
        <StaticPage title="The Cravify Blog">
            <p className="text-lg mb-8">Stories, news, and tips from the world of food.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="cursor-pointer group">
                    <div className="h-48 overflow-hidden rounded-xl mb-4">
                        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" alt="Blog 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span>Food Culture</span>
                        <span>•</span>
                        <span>Oct 12, 2025</span>
                    </div>
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">Top 10 Street Foods to Try in Ahmedabad</h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">Ahmedabad is a melting pot of cultures and flavors. From Vada Pav to Pav Bhaji, here are the must-try dishes...</p>
                </div>

                <div className="cursor-pointer group">
                    <div className="h-48 overflow-hidden rounded-xl mb-4">
                        <img src="https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=600&q=80" alt="Blog 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span>Health</span>
                        <span>•</span>
                        <span>Sep 28, 2025</span>
                    </div>
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">Eating Healthy on a Budget</h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">Who said healthy food has to be expensive? Discover affordable and nutritious meal options available on Cravify.</p>
                </div>
            </div>
        </StaticPage>
    );
};

export default Blog;
