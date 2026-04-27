import React, { useState } from 'react';
import { MapPin, Search, ShoppingBag, User, ChevronDown, Menu, X, LogOut, Grid, Store, Bike, Star, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { isDarkMode } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [navSearch, setNavSearch] = useState('');
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleNavSearch = (e) => {
        if (e.key === 'Enter' && navSearch.trim()) {
            const sanitizedQuery = navSearch.trim().replace(/\.+$/, '');
            navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
            setNavSearch('');
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 md:gap-8">

                {/* Logo */}
                <div className="flex items-center gap-4 md:gap-8 min-w-fit">
                    <Link to="/" className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Cravify</Link>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <div className={`flex items-center gap-6 font-medium text-sm ${isDarkMode ? 'text-gray-300' : 'text-dark'}`}>
                        {(!user || user.role === 'customer') && (
                            <Link to="/search" className="hover:text-primary transition-colors flex items-center gap-2">
                                <Search size={18} />
                                <span>Search</span>
                            </Link>
                        )}
                        {!user && (
                            <>
                                <Link to="/offers" className="hover:text-primary transition-colors">Offers</Link>
                                <Link to="/partner" className="hover:text-primary transition-colors">Add Restaurant</Link>
                                <Link to="/delivery/signup" className="hover:text-primary transition-colors">Ride with Us</Link>
                            </>
                        )}
                        {(!user || user.role === 'customer') && (
                            <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-medium hidden lg:block ${isDarkMode ? 'text-gray-300' : 'text-dark'}`}>Hi, {user.name}</span>

                                {user.role === 'admin' && (
                                    <Link to="/admin/dashboard" className="text-dark hover:text-primary transition-colors" title="Admin Dashboard">
                                        <Grid size={24} />
                                    </Link>
                                )}

                                {user.role === 'restaurant_partner' && (
                                    <div className="flex items-center gap-4">
                                        <Link to="/vendor/dashboard" className="text-dark hover:text-primary transition-colors" title="Vendor Dashboard">
                                            <Store size={24} />
                                        </Link>
                                        <Link to="/vendor/history" className="text-dark hover:text-primary transition-colors" title="Order History">
                                            <History size={24} />
                                        </Link>
                                    </div>
                                )}

                                {user.role === 'delivery_partner' && (
                                    <Link to="/delivery/dashboard" className="text-dark hover:text-primary transition-colors" title="Rider Dashboard">
                                        <Bike size={24} />
                                    </Link>
                                )}

                                <Link to="/profile" className={`hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-dark'}`} title="Profile">
                                    <User size={24} />
                                </Link>
                                <button onClick={handleLogout} className={`hover:text-primary transition-colors ${isDarkMode ? 'text-gray-300' : 'text-dark'}`} title="Logout">
                                    <LogOut size={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-dark hover:text-primary font-medium text-sm transition-colors">Log In</Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}

                        {(!user || user.role === 'customer') && (
                            <Link to="/cart" className={`relative transition-colors ${isDarkMode ? 'text-gray-300' : 'text-dark hover:text-primary'}`}>
                                <ShoppingBag size={24} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    {(!user || user.role === 'customer') && (
                        <Link to="/cart" className={`relative transition-colors ${isDarkMode ? 'text-gray-300' : 'text-dark hover:text-primary'}`}>
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={isDarkMode ? 'text-gray-300' : 'text-dark'}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full shadow-lg border-t p-4 flex flex-col gap-4 transition-colors duration-300 bg-white border-gray-100">
                    {(!user || user.role === 'customer') && (
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-gray-100 px-4 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={navSearch}
                                onChange={e => setNavSearch(e.target.value)}
                                onKeyDown={handleNavSearch}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        </div>
                    )}

                    {user ? (
                        <>
                            <div className="px-2 py-2 font-bold text-dark border-b border-gray-100">Hi, {user.name}</div>

                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin/dashboard" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">📊</span> Dashboard
                                    </Link>
                                    <Link to="/admin/users" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">👥</span> Partner Approvals & Users
                                    </Link>
                                    <Link to="/admin/orders" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">📦</span> Orders
                                    </Link>
                                    <Link to="/admin/settings" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">⚙️</span> Settings
                                    </Link>
                                    <div className="border-b border-gray-100 my-1"></div>
                                </>
                            )}

                            {user.role === 'restaurant_partner' && (
                                <>
                                    <Link to="/vendor/dashboard" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <Store size={20} /> Dashboard
                                    </Link>
                                    <Link to="/vendor/menu" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">📋</span> Menu
                                    </Link>
                                    <Link to="/vendor/orders" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">📦</span> Orders
                                    </Link>
                                    <Link to="/vendor/history" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">📜</span> Order History
                                    </Link>
                                    <div className="border-b border-gray-100 my-1"></div>
                                </>
                            )}

                            {user.role === 'delivery_partner' && (
                                <>
                                    <Link to="/delivery/dashboard" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <Bike size={20} /> Dashboard
                                    </Link>
                                    <Link to="/delivery/history" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">📜</span> History
                                    </Link>
                                    <div className="border-b border-gray-100 my-1"></div>
                                </>
                            )}

                            <Link to="/profile" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                <User size={20} /> Profile
                            </Link>
                            <button onClick={handleLogout} className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg w-full text-left">
                                <LogOut size={20} /> Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 p-2 border-b border-gray-100 pb-4">
                            <Link to="/login">
                                <Button variant="outline" className="w-full justify-center">Log In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button variant="primary" className="w-full justify-center">Sign Up</Button>
                            </Link>
                        </div>
                    )}

                    {(!user || user.role === 'customer') && (
                        <>
                            <Link to="/search" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                <Search size={20} /> Search
                            </Link>
                            {!user && (
                                <>
                                    <Link to="/offers" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">%</span> Offers
                                    </Link>
                                    <Link to="/partner" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">🏪</span> Add Restaurant
                                    </Link>
                                    <Link to="/delivery/signup" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-5 text-center">🛵</span> Ride with Us
                                    </Link>
                                </>
                            )}
                            <Link to="/help" className="flex items-center gap-3 text-dark font-medium p-2 hover:bg-gray-50 rounded-lg">
                                <span className="w-5 text-center">?</span> Help
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
