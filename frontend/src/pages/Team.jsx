import React from 'react';
import StaticPage from '../components/StaticPage';

const Team = () => {
    return (
        <StaticPage title="Our Team">
            <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
                <p className="text-gray-500 text-lg">Cravify is driven by a passionate group of innovators dedicated to redefining food delivery. Meet the minds behind the platform.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 mt-12">
                {[
                    { name: 'Ayush Soni', role: 'Co-Founder & CEO', desc: "Visionary leader driving Cravify's growth and strategic direction.", img: "/ayush.png" },
                    { name: 'Parin Makwana', role: 'Co-Founder & CTO', desc: "Tech architect behind our high-performance, real-time ecosystem.", img: "/parin.png" },
                    { name: 'Nevil Nandasana', role: 'COO', desc: "Operations master ensuring seamless logistics and partner success.", img: "/nevil.png" },
                    { name: 'Hitarth Shah', role: 'Head of Product', desc: "UI/UX enthusiast crafting the most intuitive user journeys.", img: "/hitarth.png" }
                ].map((member, index) => (
                    <div key={index} className="group relative bg-white p-6 rounded-3xl border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                        <div className="flex items-center gap-6">
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-primary/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500"></div>
                                <img 
                                    src={member.img} 
                                    alt={member.name} 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10" 
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-xl text-dark tracking-tight">{member.name}</h3>
                                <p className="text-primary font-bold text-sm uppercase tracking-wider mb-2">{member.role}</p>
                                <p className="text-sm text-gray-400 leading-relaxed">{member.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </StaticPage>
    );
};

export default Team;
