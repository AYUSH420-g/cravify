import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import RestaurantCard from '../components/RestaurantCard';
import { Search, X, Loader2, Mic, Volume2 } from 'lucide-react';
import Button from '../components/Button';


const Search_ = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceStatus, setVoiceStatus] = useState('Initializing...');

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support voice search. Please use Chrome or Edge.');
            return;
        }

        setIsListening(true);
        setVoiceStatus('Requesting Microphone...');
        setVoiceTranscript('');

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-IN';
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setVoiceStatus('Listening...');
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
                    setVoiceStatus('I hear you...');
                }
            };

            recognition.onend = () => {
                if (isListening) {
                    try { recognition.start(); } catch(e) {}
                }
            };

            recognition.onerror = (event) => {
                if (event.error === 'no-speech') {
                    setVoiceStatus('Still listening...');
                    return;
                }
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied.');
                    setIsListening(false);
                }
            };

            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition', err);
            setIsListening(false);
        }
    };

    // Fetch all online restaurants with menu data for dish-name search
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch('/api/customer/restaurants');
                const data = await res.json();
                if (res.ok) {
                    // Fetch full data for each restaurant to get menu items
                    const fullDataPromises = data.map(async (r) => {
                        try {
                            const fullRes = await fetch(`/api/customer/restaurants/${r._id}`);
                            if (fullRes.ok) return await fullRes.json();
                        } catch (e) { /* fallback to partial data */ }
                        return r;
                    });
                    const fullData = await Promise.all(fullDataPromises);
                    setRestaurants(fullData);
                }
            } catch (e) {
                console.error('Failed to fetch restaurants:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    // Sync query → URL param
    useEffect(() => {
        const sanitized = query.trim().replace(/\.+$/, '');
        if (sanitized) {
            setSearchParams({ q: sanitized }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    }, [query]);

    // Filter using regex — matches restaurant name, cuisines, and menu item names/descriptions
    const filteredRestaurants = useMemo(() => {
        if (!query.trim()) return [];
        try {
            const regex = new RegExp(query.trim(), 'i');
            return restaurants.filter(r =>
                regex.test(r.name) ||
                (r.cuisines && r.cuisines.some(c => regex.test(c))) ||
                (r.menu && r.menu.some(m => regex.test(m.name) || regex.test(m.description || '') || regex.test(m.category || '')))
            );
        } catch {
            const q = query.trim().toLowerCase();
            return restaurants.filter(r =>
                r.name.toLowerCase().includes(q) ||
                (r.cuisines && r.cuisines.some(c => c.toLowerCase().includes(q))) ||
                (r.menu && r.menu.some(m => m.name.toLowerCase().includes(q)))
            );
        }
    }, [query, restaurants]);

    // Popular suggestion chips
    const suggestions = ['Pizza', 'Biryani', 'Burger', 'Chinese', 'Sushi', 'Cake'];

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Header */}
                <h1 className="text-2xl font-bold mb-6">Search</h1>

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
                                            setQuery(voiceTranscript);
                                            setIsListening(false);
                                        }
                                    }}
                                >
                                    Apply Search
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Input */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search for restaurants, cuisines or dishes..."
                        className="w-full p-5 pl-12 pr-24 border rounded-2xl bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all text-sm font-medium shadow-sm"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {isListening && (
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                        <button
                            onClick={handleVoiceSearch}
                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-primary'}`}
                            title="Voice Search"
                        >
                            <Mic size={20} />
                        </button>
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : query.trim() ? (
                    <div>
                        <h2 className="text-xl font-bold mb-6">
                            Results for "<span className="text-primary">{query}</span>"
                            <span className="text-sm font-normal text-gray-400 ml-2">
                                ({filteredRestaurants.length} found)
                            </span>
                        </h2>

                        {filteredRestaurants.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                <p className="text-gray-500 text-lg">No restaurants found matching "<strong>{query}</strong>"</p>
                                <p className="text-gray-400 text-sm mt-2">Try a different name, cuisine, or dish</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500 mb-4 font-medium">Popular Cuisines</p>
                        <div className="flex flex-wrap gap-3">
                            {suggestions.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setQuery(s)}
                                    className="px-5 py-2.5 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-all text-sm font-medium cursor-pointer"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Show all restaurants below suggestions */}
                        {restaurants.length > 0 && (
                            <div className="mt-12">
                                <h2 className="text-xl font-bold mb-6">All Restaurants</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Search_;
