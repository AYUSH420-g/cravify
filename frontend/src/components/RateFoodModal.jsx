import React, { useState } from 'react';
import { Star, X, Utensils, Bike } from 'lucide-react';
import Button from './Button';

const RateFoodModal = ({ isOpen, onClose, onSubmit, order }) => {
    const [restaurantRating, setRestaurantRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen || !order) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ 
            orderId: order._id || order.id, 
            restaurantRating, 
            deliveryRating, 
            comment 
        });
        onClose();
        setRestaurantRating(0);
        setDeliveryRating(0);
        setComment('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-dark">Rate Your Experience</h3>
                        <p className="text-gray-500 text-sm">How was your order from {order.restaurant?.name || order.restaurant}?</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-dark transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Restaurant Rating */}
                    <div className="bg-gray-50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4 text-primary font-bold text-sm uppercase tracking-wider">
                            <Utensils size={16} />
                            <span>Food & Restaurant</span>
                        </div>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRestaurantRating(star)}
                                    className={`transition-all duration-200 transform hover:scale-110 ${restaurantRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                >
                                    <Star size={32} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Rating */}
                    <div className="bg-gray-50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4 text-primary font-bold text-sm uppercase tracking-wider">
                            <Bike size={16} />
                            <span>Delivery Partner</span>
                        </div>
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setDeliveryRating(star)}
                                    className={`transition-all duration-200 transform hover:scale-110 ${deliveryRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                >
                                    <Star size={32} />
                                </button>
                            ))}
                        </div>
                        {order.deliveryPartner && (
                            <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                                Delivered by <span className="text-dark">{order.deliveryPartner.name}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Any additional feedback?</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Optional: Tell us more about your experience..."
                            className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all resize-none h-28 text-sm"
                        ></textarea>
                    </div>

                    <Button 
                        variant="primary" 
                        className="w-full py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" 
                        disabled={restaurantRating === 0 || deliveryRating === 0}
                    >
                        Submit Feedback
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RateFoodModal;
