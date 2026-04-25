import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Tag, Truck, CreditCard, Percent, Gift, Copy, Check, Loader2 } from 'lucide-react';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState('');

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch('/api/customer/offers');
                const data = await res.json();
                if (data.success) {
                    setOffers(data.offers || []);
                }
            } catch (err) {
                console.error('Failed to fetch offers:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const getOfferIcon = (type) => {
        switch (type) {
            case 'free_delivery': return <Truck size={24} />;
            case 'flat_discount': return <Tag size={24} />;
            case 'percent_discount': return <Percent size={24} />;
            case 'cashback': return <CreditCard size={24} />;
            default: return <Gift size={24} />;
        }
    };

    const getOfferGradient = (type) => {
        switch (type) {
            case 'free_delivery': return 'from-green-500 to-emerald-600';
            case 'flat_discount': return 'from-red-500 to-rose-600';
            case 'percent_discount': return 'from-violet-500 to-purple-600';
            case 'cashback': return 'from-blue-500 to-indigo-600';
            default: return 'from-orange-500 to-amber-600';
        }
    };

    const getOfferBorder = (type) => {
        switch (type) {
            case 'free_delivery': return 'border-green-200 bg-green-50/50';
            case 'flat_discount': return 'border-red-200 bg-red-50/50';
            case 'percent_discount': return 'border-violet-200 bg-violet-50/50';
            case 'cashback': return 'border-blue-200 bg-blue-50/50';
            default: return 'border-orange-200 bg-orange-50/50';
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark">Offers & Deals</h1>
                    <p className="text-gray-500 mt-1">Save more on every order with these exclusive offers</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Auto-applied banner */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl mb-8 flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Truck size={28} />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl">🎉 Free Delivery on orders above ₹500!</h2>
                                <p className="text-green-100 text-sm mt-1">Automatically applied at checkout — no code needed.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {offers.filter(o => !o.auto).map((offer) => (
                                <div key={offer.code} className={`border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg ${getOfferBorder(offer.type)}`}>
                                    <div className={`bg-gradient-to-r ${getOfferGradient(offer.type)} p-5 text-white flex items-center gap-4`}>
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            {getOfferIcon(offer.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">{offer.title}</h3>
                                            <p className="text-white/80 text-sm">{offer.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase text-gray-400">Code:</span>
                                            <span className="font-mono font-bold text-dark bg-gray-100 px-3 py-1 rounded-lg border border-dashed border-gray-300">{offer.code}</span>
                                        </div>
                                        <button
                                            onClick={() => handleCopyCode(offer.code)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                                        >
                                            {copiedCode === offer.code ? (
                                                <><Check size={14} /> Copied!</>
                                            ) : (
                                                <><Copy size={14} /> Copy Code</>
                                            )}
                                        </button>
                                    </div>
                                    {offer.minOrder > 0 && (
                                        <div className="px-5 pb-4">
                                            <p className="text-xs text-gray-400">*Min. order value: ₹{offer.minOrder}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Info section */}
                        <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
                            <h3 className="font-bold text-lg text-dark mb-4">How to use offers</h3>
                            <ol className="list-decimal list-inside text-gray-600 space-y-2 text-sm">
                                <li>Add items to your cart from any restaurant</li>
                                <li>Go to checkout and enter the promo code in the offers section</li>
                                <li>The discount will be automatically calculated and applied</li>
                                <li>Complete your payment and enjoy the savings!</li>
                            </ol>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default Offers;
