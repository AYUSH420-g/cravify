import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CategoryItem from '../components/CategoryItem';
import RestaurantCard from '../components/RestaurantCard';
import { Search, MapPin, X } from 'lucide-react';
import Button from '../components/Button';

// Static categories (these don't come from DB)
const categories = [
    { id: 1, name: 'Biryani', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80' },
    { id: 2, name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
    { id: 3, name: 'Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80' },
    { id: 4, name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80' },
    { id: 5, name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80' },
    { id: 6, name: 'Cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
];

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroSearch, setHeroSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch('/api/customer/restaurants');
                const data = await res.json();
                if (res.ok) {
                    setRestaurants(data);
                }
            } catch (e) {
                console.error('Failed to fetch restaurants:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    // Live-filter restaurants from the hero search bar (regex, case-insensitive)
    const filteredRestaurants = useMemo(() => {
        if (!heroSearch.trim()) return restaurants;
        try {
            const regex = new RegExp(heroSearch.trim(), 'i');
            return restaurants.filter(r =>
                regex.test(r.name) ||
                (r.cuisines && r.cuisines.some(c => regex.test(c))) ||
                (r.menu && r.menu.some(m => regex.test(m.name)))
            );
        } catch {
            // If the user types an invalid regex character, fall back to simple includes
            const q = heroSearch.trim().toLowerCase();
            return restaurants.filter(r =>
                r.name.toLowerCase().includes(q) ||
                (r.cuisines && r.cuisines.some(c => c.toLowerCase().includes(q)))
            );
        }
    }, [heroSearch, restaurants]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (heroSearch.trim()) {
            navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
        } else {
            navigate('/search');
        }
    };

    const isSearching = heroSearch.trim().length > 0;

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

                    <form onSubmit={handleSearchSubmit} className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
                        <div className="flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 min-w-[200px]">
                            <MapPin className="text-primary mr-2" />
                            <input
                                type="text"
                                placeholder="Gujarat, India"
                                className="bg-transparent outline-none text-dark w-full placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 py-2 relative">
                            <Search className="text-gray-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search for restaurant, cuisine or a dish"
                                className="bg-transparent outline-none text-dark w-full placeholder:text-gray-400"
                                value={heroSearch}
                                onChange={e => setHeroSearch(e.target.value)}
                            />
                            {heroSearch && (
                                <button
                                    type="button"
                                    onClick={() => setHeroSearch('')}
                                    className="text-gray-400 hover:text-gray-600 ml-1 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <Button type="submit" variant="primary" size="lg" className="md:w-32 h-12 md:h-auto">Search</Button>
                    </form>
                </div>
            </section>

            {/* Live search results (replaces categories + restaurants when typing) */}
            {isSearching ? (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-dark">
                                Results for "<span className="text-primary">{heroSearch}</span>"
                            </h2>
                            <button
                                onClick={() => setHeroSearch('')}
                                className="text-sm font-medium text-primary hover:text-red-700 flex items-center gap-1 cursor-pointer"
                            >
                                <X size={14} /> Clear
                            </button>
                        </div>

                        {filteredRestaurants.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {filteredRestaurants.map(rest => (
                                    <RestaurantCard
                                        key={rest._id}
                                        id={rest._id}
                                        name={rest.name}
                                        image={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                                        rating={rest.rating || '0.0'}
                                        deliveryTime={rest.deliveryTime || '30-40'}
                                        priceForTwo={rest.menu && rest.menu.length > 0 ? `${Math.min(...rest.menu.map(m => m.price))} - ${Math.max(...rest.menu.map(m => m.price))}` : 'N/A'}
                                        cuisines={rest.cuisines || []}
                                        offer=""
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No restaurants found matching "<strong>{heroSearch}</strong>"</p>
                                <p className="text-gray-400 text-sm mt-2">Try a different name, cuisine, or dish</p>
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <>
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
                            <h2 className="text-3xl font-bold text-dark mb-8">Top restaurants for you</h2>
                            {loading ? (
                                <div className="text-center py-12 text-gray-500 text-lg">Loading restaurants...</div>
                            ) : restaurants.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No restaurants are online right now.</p>
                                    <p className="text-gray-400 text-sm mt-2">Check back later or become a partner!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {restaurants.map(rest => (
                                        <RestaurantCard
                                            key={rest._id}
                                            id={rest._id}
                                            name={rest.name}
                                            image={rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                                            rating={rest.rating || '0.0'}
                                            deliveryTime={rest.deliveryTime || '30-40'}
                                            priceForTwo={rest.menu && rest.menu.length > 0 ? `${Math.min(...rest.menu.map(m => m.price))} - ${Math.max(...rest.menu.map(m => m.price))}` : 'N/A'}
                                            cuisines={rest.cuisines || []}
                                            offer=""
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

        </MainLayout>
    );
};

export default Home;
