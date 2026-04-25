import React, { useState } from 'react';
import { Sparkles, X, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const SurpriseMeButton = () => {
    const [loading, setLoading] = useState(false);
    const [surprise, setSurprise] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleSurprise = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/customer/surprise-me');
            const data = await res.json();
            if (data.success) {
                setSurprise(data);
                setShowModal(true);
            } else {
                alert(data.message || 'Something went wrong');
            }
        } catch (err) {
            console.error('Surprise Me failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleSurprise}
                disabled={loading}
                className="fixed bottom-24 right-6 z-40 bg-gradient-to-br from-primary to-accent text-white px-6 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(255,107,107,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(255,107,107,0.7)] hover:-translate-y-1 active:scale-95 transition-all duration-300 group flex items-center gap-2 overflow-hidden border-2 border-white/20 backdrop-blur-sm"
            >
                {loading ? (
                    <Loader2 size={24} className="animate-spin" />
                ) : (
                    <Sparkles size={24} className="animate-pulse" />
                )}
                <span className="font-black tracking-tight text-sm uppercase">Surprise Me 🪄</span>
                
                {/* Decorative floating stars */}
                <div className="absolute -top-1 -left-1 opacity-50 group-hover:animate-ping"><Sparkles size={8} /></div>
                <div className="absolute -bottom-1 -right-1 opacity-50 group-hover:animate-bounce"><Sparkles size={10} /></div>
            </button>

            {showModal && surprise && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative h-64">
                            <img 
                                src={surprise.dish.image || surprise.restaurant.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'} 
                                alt={surprise.dish.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">CHEF'S SURPRISE</span>
                                <h3 className="text-2xl font-bold text-white mb-1">{surprise.dish.name}</h3>
                                <p className="text-gray-300 text-sm italic">from {surprise.restaurant.name}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {surprise.dish.description || `Experience the authentic flavors of ${surprise.restaurant.name}. This top-rated dish is a crowd favorite!`}
                            </p>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Price</span>
                                    <span className="text-2xl font-bold text-dark">₹{surprise.dish.price}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rating</span>
                                    <span className="text-2xl font-bold text-primary">★ {surprise.restaurant.rating}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 rounded-2xl py-4"
                                    onClick={() => handleSurprise()}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Spin Again'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="flex-[1.5] rounded-2xl py-4 flex items-center justify-center gap-2"
                                    onClick={() => {
                                        setShowModal(false);
                                        navigate(`/restaurant/${surprise.restaurant._id}`);
                                    }}
                                >
                                    Order Now <ArrowRight size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SurpriseMeButton;
