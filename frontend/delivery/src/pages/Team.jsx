import React from 'react';
import StaticPage from '../components/StaticPage';

const Team = () => {
    return (
        <StaticPage title="Our Team">
            <p>Cravify is built by a diverse group of individuals who share a common love for food and innovation.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="flex items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="CEO" className="w-20 h-20 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-lg">Ayush Soni</h3>
                        <p className="text-primary font-medium">Co-Founder & CEO</p>
                        <p className="text-sm text-gray-500">Visionary leader driving Cravify's growth.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/men/44.jpg" alt="CTO" className="w-20 h-20 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-lg">Parin Makwana</h3>
                        <p className="text-primary font-medium">Co-Founder & CTO</p>
                        <p className="text-sm text-gray-500">Tech genius behind our robust platform.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/men/86.jpg" alt="COO" className="w-20 h-20 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-lg">Nevil Nandasana</h3>
                        <p className="text-primary font-medium">COO</p>
                        <p className="text-sm text-gray-500">Ensuring smooth operations and logistics.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Product Head" className="w-20 h-20 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-lg">Hitarth Shah</h3>
                        <p className="text-primary font-medium">Head of Product</p>
                        <p className="text-sm text-gray-500">Crafting the best user experience.</p>
                    </div>
                </div>
            </div>
        </StaticPage>
    );
};

export default Team;
