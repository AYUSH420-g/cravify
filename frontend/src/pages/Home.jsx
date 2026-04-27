import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import CategoryItem from '../components/CategoryItem';
import RestaurantCard from '../components/RestaurantCard';
import { Search, MapPin, X, LayoutDashboard, Mic, Volume2 } from 'lucide-react';
import Button from '../components/Button';
import SurpriseMeButton from '../components/SurpriseMeButton';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
// Using native SpeechRecognition for better reliability

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
    const [categories, setCategories] = useState([]);
    const [inspirationItems, setInspirationItems] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isDarkMode } = useTheme();

    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceStatus, setVoiceStatus] = useState('Initializing...');

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support voice search. Please use Chrome or Edge.');
            return;
        }

        // Show UI immediately
        setIsListening(true);
        setVoiceStatus('Requesting Microphone...');
        setVoiceTranscript('');

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-IN';
            recognition.interimResults = true;
            recognition.continuous = true; // Keep listening even during short pauses
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setVoiceStatus('Listening...');
                console.log('Voice recognition started');
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const currentTranscript = finalTranscript || interimTranscript;
                if (currentTranscript) {
                    const cleanedTranscript = currentTranscript.replace(/[.,!?]$/, '').trim();
                    setVoiceTranscript(cleanedTranscript);
                    setHeroSearch(cleanedTranscript);
                    setVoiceStatus('I hear you...');
                }
            };

            recognition.onend = () => {
                // If it ended but we still have the overlay open, it might be a timeout
                if (isListening) {
                    console.log('Recognition ended unexpectedly. Restarting...');
                    try { recognition.start(); } catch (e) { }
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'no-speech') {
                    setVoiceStatus('Still listening... speak clearly');
                    // Don't close the modal, just keep waiting
                    return;
                }
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please check your browser settings.');
                    setIsListening(false);
                }
            };

            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition', err);
            setIsListening(false);
        }
    };
    const isRestricted = user && user.role !== 'customer';

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch('/api/customer/restaurants');
                const data = await res.json();
                if (res.ok) {
                    setRestaurants(data);
                    
                    // ── Derived categories from DB cuisines ──
                    const cuisineSet = new Set();
                    data.forEach(r => r.cuisines?.forEach(c => cuisineSet.add(c)));
                    const dbCategories = Array.from(cuisineSet).map((name, idx) => ({
                        id: idx,
                        name,
                        image: `https://source.unsplash.com/featured/300x300/?food,${name.toLowerCase()}`
                    })).slice(0, 10);
                    setCategories(dbCategories);

                    // ── Derived random inspiration items ──
                    const allProducts = [];
                    data.forEach(r => {
                        r.menu?.forEach(item => {
                            allProducts.push({ ...item, restaurantId: r._id });
                        });
                    });
                    const shuffled = allProducts.sort(() => 0.5 - Math.random()).slice(0, 8);
                    setInspirationItems(shuffled);
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
            <section className={`relative h-[500px] flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
                        alt="Food Background"
                        className={`w-full h-full object-cover transition-all duration-1000 ${isDarkMode ? 'opacity-40' : 'opacity-20'} hover:scale-105`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-black/80 via-black/20 to-black/60' : 'from-white/80 via-white/20 to-white/60'}`} />
                </div>

                <div className={`relative z-10 text-center px-4 max-w-4xl w-full ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight drop-shadow-sm">
                        Discover the best food & drinks in <span className="text-primary">Gujarat</span>
                    </h1>
                    <p className={`text-xl mb-10 font-light ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                        {isRestricted ? `Welcome back to the ${user.role.replace('_partner', '').charAt(0).toUpperCase() + user.role.replace('_partner', '').slice(1)} Control Center.` : t('welcome')}
                    </p>

                    {isRestricted ? (
                        <div className="flex justify-center">
                            <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'restaurant_partner' ? '/vendor/dashboard' : '/delivery/dashboard'}>
                                <Button variant="primary" size="lg" className="flex items-center gap-2 px-8 py-6 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                                    <LayoutDashboard size={24} />
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="w-full max-w-3xl mx-auto space-y-4">
                            {/* Listening Overlay */}
                            {isListening && (
                                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
                                    <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl text-center space-y-8 scale-in-center">
                                        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                                            <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse"></div>
                                            <div className="relative bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                                                <Mic size={32} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-dark mb-3">{voiceStatus}</h3>
                                            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-4">Speak your craving</p>
                                            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                                                <p className="text-primary text-2xl font-bold min-h-[60px] italic leading-relaxed">
                                                    {voiceTranscript ? `"${voiceTranscript}"` : '...'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-2xl py-4 font-bold border-2"
                                                onClick={() => setIsListening(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                className="flex-1 rounded-2xl py-4 font-bold shadow-lg shadow-primary/20"
                                                onClick={() => {
                                                    if (voiceTranscript) {
                                                        const finalCleaned = voiceTranscript.replace(/[.,!?]$/, '').trim();
                                                        navigate(`/search?q=${encodeURIComponent(finalCleaned)}`);
                                                    }
                                                }}
                                            >
                                                Search Now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSearchSubmit} className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 relative z-10">
                                <div className="flex-1 flex items-center px-4 py-2 relative group">
                                    <Search className="text-gray-400 mr-2 shrink-0 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t('search_placeholder')}
                                        className="!bg-transparent outline-none text-dark w-full placeholder:text-gray-400 font-medium"
                                        value={heroSearch}
                                        onChange={e => setHeroSearch(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleVoiceSearch}
                                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-primary'}`}
                                            title="Voice Search"
                                        >
                                            <Mic size={18} />
                                        </button>
                                        {heroSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setHeroSearch('')}
                                                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <Button type="submit" variant="primary" size="lg" className="md:w-32 h-12 md:h-auto rounded-xl">Search</Button>
                            </form>

                            {/* Popular Suggestions on Hero (from dynamic categories) */}
                            {!isSearching && categories.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                                    <span className={`text-xs font-bold uppercase tracking-widest mr-2 flex items-center ${isDarkMode ? 'text-white/60' : 'text-gray-400'}`}>Popular:</span>
                                    {categories.slice(0, 6).map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setHeroSearch(cat.name)}
                                            className={`px-5 py-2 backdrop-blur-xl border rounded-full hover:bg-primary hover:border-primary hover:scale-105 active:scale-95 transition-all text-xs font-black shadow-xl group ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-dark'}`}
                                        >
                                            <span className="group-hover:animate-pulse">#{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Live search results (replaces categories + restaurants when typing) */}
            {isSearching ? (
                // ... search results section (omitted for brevity, assume unchanged or wrap)
                <section className="py-16 bg-white min-h-[400px]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-dark">Results for "{heroSearch}"</h2>
                            <button onClick={() => setHeroSearch('')} className="text-primary font-bold text-sm hover:underline">Clear</button>
                        </div>
                        {filteredRestaurants.length === 0 ? (
                            <div className="text-center py-20">
                                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No matches found for your search.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {filteredRestaurants.map(rest => (
                                    <RestaurantCard
                                        key={rest._id}
                                        id={rest._id}
                                        name={rest.name}
                                        image={rest.image}
                                        rating={rest.rating}
                                        deliveryTime={rest.deliveryTime}
                                        priceForTwo={rest.priceForTwo}
                                        cuisines={rest.cuisines}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ) : !isRestricted ? (
                <>
                    {/* Inspiration Section (Random Products) */}
                    <section className="py-16 bg-section">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-dark mb-8">Inspiration for your first order</h2>
                            <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x">
                                {inspirationItems.map((item, idx) => (
                                    <Link key={idx} to={`/restaurant/${item.restaurantId}`} className="shrink-0 snap-start group">
                                        <div className="w-40 md:w-48 text-center space-y-3">
                                            <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 border-4 border-white">
                                                <img 
                                                    src={item.image || `https://source.unsplash.com/featured/300x300/?food,${item.name.toLowerCase()}`} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="font-bold text-dark group-hover:text-primary transition-colors line-clamp-1">{item.name}</p>
                                        </div>
                                    </Link>
                                ))}
                                {inspirationItems.length === 0 && (
                                    <div className="text-gray-400 italic">Finding some delicious ideas...</div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Popular Restaurants */}
                    <section className="py-16 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-bold text-dark">Top restaurants for you</h2>
                                <Link to="/search" className="text-primary font-bold hover:underline">See all</Link>
                            </div>
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
            ) : null}

            {!isRestricted && <SurpriseMeButton />}
        </MainLayout>
    );
};

export default Home;
