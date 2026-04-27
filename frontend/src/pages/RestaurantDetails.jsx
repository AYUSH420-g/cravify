import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import MenuItem from '../components/MenuItem';
import CartSidebar from '../components/CartSidebar';
import { Star, Clock, MapPin, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RestaurantDetails = () => {
    const { isDarkMode } = useTheme();
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuCategories, setMenuCategories] = useState([]);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await fetch(`/api/customer/restaurants/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setRestaurant(data);
                    // Group menu items by category
                    const grouped = {};
                    (data.menu || []).forEach(item => {
                        const cat = item.category || 'Other';
                        if (!grouped[cat]) grouped[cat] = [];
                        grouped[cat].push(item);
                    });
                    const categories = Object.keys(grouped).map(title => ({
                        title,
                        items: grouped[title]
                    }));
                    setMenuCategories(categories);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    if (loading) {
        return <MainLayout><div className="flex justify-center py-20 text-xl font-bold">Loading Restaurant...</div></MainLayout>;
    }

    if (!restaurant) {
        return <MainLayout><div className="flex justify-center py-20 text-xl text-gray-500">Restaurant not found.</div></MainLayout>;
    }

    // Build a restaurant object for the cart context (identifies which restaurant items belong to)
    const restaurantForCart = {
        id: restaurant._id,
        name: restaurant.name,
        image: restaurant.image
    };

    return (
        <MainLayout>
            {/* Restaurant Header */}
            <div className="bg-gray-950 text-white pt-8 pb-12 border-b border-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">{restaurant.name}</h1>
                            <p className="text-gray-400 mb-1">{(restaurant.cuisines || []).join(', ')}</p>
                            <p className="text-gray-400 text-sm mb-4 flex items-center gap-1"><MapPin size={14} /> {restaurant.address || 'Address not available'}</p>

                            <div className="flex items-center gap-4 text-sm font-bold">
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-600 rounded text-white">
                                    <span>{restaurant.rating || '0.0'}</span>
                                    <Star size={12} fill="currentColor" />
                                </div>
                                <span className="text-gray-400">|</span>
                                <span className="text-white">{restaurant.deliveryTime || '30-40'} mins</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-white">{restaurant.menu?.length || 0} items</span>
                            </div>
                        </div>

                        <div className="border border-white/10 rounded-xl p-4 min-w-[300px] bg-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2 uppercase tracking-wide">
                                <span className="text-xl">{restaurant.isOnline ? '🟢 OPEN' : '🔴 CLOSED'}</span>
                            </div>
                            <div className="text-white text-lg font-bold">{restaurant.name}</div>
                            <div className="text-gray-400 text-xs mt-1">{(restaurant.cuisines || []).join(' • ')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Search Sticky Bar */}
            <div className="sticky top-20 z-30 bg-white shadow-sm border-b border-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto scrollbar-hide">
                        {menuCategories.map(cat => (
                            <a key={cat.title} href={`#${cat.title}`} className={`font-medium whitespace-nowrap hover:text-primary transition-colors cursor-pointer border-b-2 border-transparent hover:border-primary pb-1 ${isDarkMode ? 'text-gray-300' : 'text-dark'}`}>
                                {cat.title}
                            </a>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search in menu..."
                            className="w-full bg-gray-100 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Menu Left */}
                <div className="lg:col-span-3">
                    {menuCategories.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <p className="text-lg font-bold">No menu items available yet.</p>
                            <p className="text-sm mt-2">This restaurant hasn't added any items to their menu.</p>
                        </div>
                    ) : (
                        menuCategories.map(cat => (
                            <div key={cat.title} id={cat.title} className="mb-8 scroll-mt-40">
                                <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                                    {cat.title}
                                    <span className="text-base font-normal text-gray-400">({cat.items.length})</span>
                                </h3>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 md:px-6">
                                    {cat.items.map(item => (
                                        <MenuItem
                                            key={item._id}
                                            id={item._id}
                                            name={item.name}
                                            price={item.price}
                                            description={item.description || ''}
                                            image={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                                            isVeg={item.isVeg}
                                            votes={item.bestseller}
                                            restaurant={restaurantForCart}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Right */}
                <div className="hidden lg:block lg:col-span-1">
                    {restaurant.isOnline && (!useAuth().user || useAuth().user.role === 'customer') && <CartSidebar />}
                    {useAuth().user && useAuth().user.role !== 'customer' && (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                            <p className="text-gray-400 text-sm font-medium">
                                {useAuth().user.role.replace('_', ' ').toUpperCase()}s cannot place orders
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default RestaurantDetails;
