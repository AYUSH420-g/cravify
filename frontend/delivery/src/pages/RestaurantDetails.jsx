import React from 'react';
import MainLayout from '../layouts/MainLayout';
import MenuItem from '../components/MenuItem';
import CartSidebar from '../components/CartSidebar';
import { Star, Clock, MapPin, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';

const RestaurantDetails = () => {
    const { id } = useParams();

    // Mock Restaurant Info
    const restaurant = {
        name: "La Pino'z Pizza",
        cuisines: "Italian, Pizza, Fast Food",
        address: "Lower Manhattan, New York",
        rating: 4.2,
        deliveryTime: "30-35 mins",
        priceForTwo: "₹300 for two",
        totalRatings: "10K+",
        offer: "50% OFF up to ₹100"
    };

    // Mock Menu Data
    const menuCategories = [
        {
            title: 'Recommended',
            items: [
                { id: 101, name: 'Paneer Tikka Pizza', price: 450, description: 'Spicy paneer tikka chunks with onions and capsicum.', isVeg: true, votes: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80' },
                { id: 102, name: '7 cheese pizza', price: 150, description: 'Freshly baked 7 cheese pizza.', isVeg: true, votes: true, image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=300&q=80' },
            ]
        },
        {
            title: 'Pizzas',
            items: [
                { id: 201, name: 'Farmhouse Pizza', price: 395, description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom.', isVeg: true, votes: false, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
                { id: 202, name: 'Chicken Pepperoni', price: 495, description: 'Classic American pepperoni pizza.', isVeg: false, votes: true, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80' },
                { id: 203, name: 'Margherita', price: 245, description: 'Classic cheese pizza.', isVeg: true, votes: false, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80' },
            ]
        },
        {
            title: 'Beverages',
            items: [
                { id: 301, name: 'Coke (500ml)', price: 60, description: 'Sparkling soft drink.', isVeg: true, votes: false, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80' },
                { id: 302, name: 'Choco Lava Cake', price: 99, description: 'Molten chocolate cake.', isVeg: true, votes: true, image: 'https://images.unsplash.com/photo-1617305855653-839556d1f057?auto=format&fit=crop&w=300&q=80' }
            ]
        }
    ];

    return (
        <MainLayout>
            {/* Restaurant Header */}
            <div className="bg-dark text-white pt-8 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
                            <p className="text-gray-400 mb-1">{restaurant.cuisines}</p>
                            <p className="text-gray-400 text-sm mb-4 flex items-center gap-1"><MapPin size={14} /> {restaurant.address}</p>

                            <div className="flex items-center gap-4 text-sm font-bold">
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-600 rounded text-white">
                                    <span>{restaurant.rating}</span>
                                    <Star size={12} fill="currentColor" />
                                </div>
                                <span className="text-gray-400">|</span>
                                <span className="text-white">{restaurant.totalRatings} Ratings</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-white">{restaurant.deliveryTime}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-white">{restaurant.priceForTwo}</span>
                            </div>
                        </div>

                        <div className="border border-white/20 rounded-xl p-4 min-w-[300px] bg-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2 uppercase tracking-wide">
                                <span className="text-xl">OFFER</span>
                            </div>
                            <div className="text-white text-lg font-bold">{restaurant.offer}</div>
                            <div className="text-gray-400 text-xs mt-1">Use code CRAVIFY50 | T&C apply</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Search Sticky Bar */}
            <div className="sticky top-20 z-30 bg-white shadow-sm border-b border-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto scrollbar-hide">
                        {menuCategories.map(cat => (
                            <a key={cat.title} href={`#${cat.title}`} className="text-dark font-medium whitespace-nowrap hover:text-primary transition-colors cursor-pointer border-b-2 border-transparent hover:border-primary pb-1">
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
                    {menuCategories.map(cat => (
                        <div key={cat.title} id={cat.title} className="mb-8 scroll-mt-40">
                            <h3 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
                                {cat.title}
                                <span className="text-base font-normal text-gray-400">({cat.items.length})</span>
                            </h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 md:px-6">
                                {cat.items.map(item => <MenuItem key={item.id} {...item} restaurant={restaurant} />)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Right */}
                <div className="hidden lg:block lg:col-span-1">
                    <CartSidebar />
                </div>
            </div>
        </MainLayout>
    );
};

export default RestaurantDetails;
