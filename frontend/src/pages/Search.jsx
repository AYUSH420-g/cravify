import React from 'react';
import MainLayout from '../layouts/MainLayout';

const Search = () => {
    const [query, setQuery] = React.useState('');

    // Mock Data for Search
    const allRestaurants = [
        {
            id: 1,
            name: "La Pino'z Pizza",
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
            rating: "4.2",
            deliveryTime: "30-35 mins",
            priceForTwo: "₹300 for two",
            cuisines: ["Italian", "Pizza", "Fast Food"],
            offer: "50% OFF up to ₹100",
            tags: ["pizza", "italian", "cheese"]
        },
        {
            id: 2,
            name: "Biryani Blues",
            image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
            rating: "4.4",
            deliveryTime: "40-45 mins",
            priceForTwo: "₹400 for two",
            cuisines: ["Biryani", "North Indian"],
            offer: "20% OFF",
            tags: ["biryani", "rice", "mughlai"]
        },
        {
            id: 3,
            name: "Pizza Hut",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
            rating: "4.0",
            deliveryTime: "35-40 mins",
            priceForTwo: "₹350 for two",
            cuisines: ["Pizza", "Fast Food"],
            offer: "Free Garlic Bread",
            tags: ["pizza", "fast food"]
        },
        {
            id: 4,
            name: "Behrouz Biryani",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
            rating: "4.5",
            deliveryTime: "45-50 mins",
            priceForTwo: "₹600 for two",
            cuisines: ["Biryani", "Mughlai"],
            offer: "Royal Feast",
            tags: ["biryani", "premium", "mughlai"]
        }
    ];

    const filteredRestaurants = query
        ? allRestaurants.filter(rest =>
            rest.name.toLowerCase().includes(query.toLowerCase()) ||
            rest.tags.some(tag => tag.includes(query.toLowerCase()))
        )
        : [];

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Search</h1>
                <input
                    type="text"
                    placeholder="Search for restaurants and food..."
                    className="w-full p-4 border rounded-xl bg-gray-50 mb-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {query && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Results for "{query}"</h2>
                        {filteredRestaurants.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRestaurants.map(rest => (
                                    <div key={rest.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="h-48 rounded-lg overflow-hidden mb-4">
                                            <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="font-bold text-lg">{rest.name}</h3>
                                        <p className="text-gray-500 text-sm mb-2">{rest.cuisines.join(", ")}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">{rest.rating} ★</span>
                                            <span className="text-gray-500">{rest.deliveryTime}</span>
                                            <span className="text-gray-500">{rest.priceForTwo}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No restaurants found matching "{query}"</p>
                        )}
                    </div>
                )}

                {!query && (
                    <div>
                        <p className="text-gray-500 mb-4">Popular Cuisines:</p>
                        <div className="flex gap-3">
                            <button onClick={() => setQuery('Pizza')} className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">Pizza</button>
                            <button onClick={() => setQuery('Biryani')} className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">Biryani</button>
                            <button onClick={() => setQuery('Burger')} className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">Burger</button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Search;
