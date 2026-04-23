import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-3xl font-bold text-white mb-6">Cravify</h2>
                        <p className="text-gray-400 mb-6">Delicious food delivered to your doorstep in minutes.</p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:bg-primary transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:bg-primary transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:bg-primary transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full text-white hover:bg-primary transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Company</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/team" className="hover:text-white transition-colors">Team</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/help" className="hover:text-white transition-colors">Help & Support</Link></li>
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Legal</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/refund" className="hover:text-white transition-colors">Refund & Cancellation</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/cookie" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>© 2024 Cravify. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
