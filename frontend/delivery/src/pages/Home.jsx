import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CategoryItem from '../components/CategoryItem';
import RestaurantCard from '../components/RestaurantCard';
import { Search, MapPin } from 'lucide-react';
import Button from '../components/Button';

// Mock Data
const categories = [
    { id: 1, name: 'Biryani', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80' },
    { id: 4, name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80' },
    { id: 5, name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80' },
    { id: 6, name: 'Cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
];

const restaurants = [
    {
        id: 1,
        name: 'La Pino\'z Pizza',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
        rating: '4.2',
        deliveryTime: '30-35',
        priceForTwo: '₹300 for two',
        cuisines: ['Italian', 'Pizza', 'Fast Food'],
        offer: '50% OFF up to ₹100'
    },
    {
        id: 2,
        name: 'Burger King',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80',
        rating: '4.1',
        deliveryTime: '25-30',
        priceForTwo: '₹250 for two',
        cuisines: ['Burger', 'American'],
        offer: 'Free Whopper'
    },
    {
        id: 3,
        name: 'Kwality Walls',
        image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=600&q=80',
        rating: '4.5',
        deliveryTime: '15-20',
        priceForTwo: '₹150 for two',
        cuisines: ['Ice Cream', 'Desserts'],
        offer: ''
    },
    {
        id: 4,
        name: 'Wow! Momo',
        image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=600&q=80',
        rating: '4.0',
        deliveryTime: '20-25',
        priceForTwo: '₹200 for two',
        cuisines: ['Momos', 'Asian'],
        offer: '60% OFF'
    }
];

const Home = () => {
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center justify-center bg-gray-900">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                        alt="Food Background"
                        className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl w-full">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-lg">
                        Discover the best food & drinks in <span className="text-primary">Gujarat</span>
                    </h1>
                    <p className="text-xl text-gray-200 mb-10 font-light drop-shadow-md">
                        Order from your favorite restaurants & track on the go.
                    </p>

                    <div className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
                        <div className="flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 min-w-[200px]">
                            <MapPin className="text-primary mr-2" />
                            <input
                                type="text"
                                placeholder="Gujarat, India"
                                className="bg-transparent outline-none text-dark w-full placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 py-2">
                            <Search className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search for restaurant, cuisine or a dish"
                                className="bg-transparent outline-none text-dark w-full placeholder:text-gray-400"
                            />
                        </div>
                        <Link to="/search">
                            <Button variant="primary" size="lg" className="md:w-32 h-12 md:h-auto">Search</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-dark mb-8">Inspiration for your first order</h2>
                    <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x">
                        {categories.map(cat => (
                            <CategoryItem key={cat.id} name={cat.name} image={cat.image} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Restaurants */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-dark mb-8">Top brands for you</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {restaurants.map(rest => (
                            <RestaurantCard key={rest.id} {...rest} />
                        ))}
                    </div>
                </div>
            </section>

            {/* More Restaurants */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-dark mb-8">Delivery Restaurants in Gujarat</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* Repeating data for visual bulk */}
                        {[...restaurants, ...restaurants, ...restaurants].map((rest, i) => (
                            <RestaurantCard key={i} {...rest} />
                        ))}
                    </div>
                </div>
            </section>

        </MainLayout>
    );
};

export default Home;
