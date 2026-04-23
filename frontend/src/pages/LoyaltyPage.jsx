import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Star, Gift, TrendingUp, Award, ArrowUpRight, ArrowDownRight, Sparkles, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const TIERS = {
    Bronze: { color: 'from-amber-600 to-amber-800', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🥉', min: 0 },
    Silver: { color: 'from-gray-400 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: '🥈', min: 200 },
    Gold: { color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '👑', min: 500 }
};

const LoyaltyPage = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchLoyalty = async () => {
            try {
                const res = await fetch('/api/loyalty/balance', {
                    headers: { 'x-auth-token': token }
                });
                const json = await res.json();
                if (res.ok) setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLoyalty();
    }, [token]);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    if (!data) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Please log in to view your loyalty points</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const tierInfo = TIERS[data.tier] || TIERS.Bronze;
    const progressToNext = data.nextTier
        ? Math.min(100, Math.round(((data.totalEarned) / (data.totalEarned + data.nextTier.pointsNeeded)) * 100))
        : 100;

    return (
        <MainLayout>
            <div className="min-h-screen bg-section py-8">
                <div className="max-w-3xl mx-auto px-4">

                    {/* Hero Card */}
                    <div className={`bg-gradient-to-br ${tierInfo.color} rounded-3xl p-8 text-white mb-8 relative overflow-hidden`}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-white/70 text-sm font-medium mb-1">Your Reward Points</p>
                                    <h1 className="text-5xl font-bold">{data.points.toLocaleString()}</h1>
                                </div>
                                <div className="text-5xl">{tierInfo.icon}</div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <p className="text-xs text-white/70">Tier</p>
                                    <p className="font-bold text-lg">{data.tier}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <p className="text-xs text-white/70">Lifetime Earned</p>
                                    <p className="font-bold text-lg">{data.totalEarned.toLocaleString()}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <p className="text-xs text-white/70">Value</p>
                                    <p className="font-bold text-lg">₹{data.points}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Progress */}
                    {data.nextTier && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-dark flex items-center gap-2">
                                    <Crown size={18} className="text-yellow-500" /> Tier Progress
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {data.nextTier.pointsNeeded} pts to {data.nextTier.name}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progressToNext}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{data.tier}</span>
                                <span>{data.nextTier.name}</span>
                            </div>
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <TrendingUp size={24} className="text-green-600" />
                            </div>
                            <h4 className="font-bold text-dark mb-1">Earn Points</h4>
                            <p className="text-sm text-gray-500">1 point per ₹10 spent on food</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Sparkles size={24} className="text-purple-600" />
                            </div>
                            <h4 className="font-bold text-dark mb-1">Redeem</h4>
                            <p className="text-sm text-gray-500">1 point = ₹1 discount (up to 50%)</p>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Award size={24} className="text-yellow-600" />
                            </div>
                            <h4 className="font-bold text-dark mb-1">Level Up</h4>
                            <p className="text-sm text-gray-500">200pts Silver • 500pts Gold</p>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-dark text-lg">Recent Activity</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {data.transactions && data.transactions.length > 0 ? (
                                data.transactions.map(txn => (
                                    <div key={txn._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'earn' ? 'bg-green-50' : 'bg-red-50'}`}>
                                                {txn.type === 'earn' ? (
                                                    <ArrowUpRight size={20} className="text-green-600" />
                                                ) : (
                                                    <ArrowDownRight size={20} className="text-red-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-dark text-sm">{txn.description}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${txn.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                                            {txn.type === 'earn' ? '+' : '-'}{txn.points} pts
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-400">
                                    <Star size={32} className="mx-auto mb-3 text-gray-200" />
                                    <p>No transactions yet. Start ordering to earn points!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-8">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                        >
                            <Gift size={18} /> Order Now & Earn Points
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default LoyaltyPage;
