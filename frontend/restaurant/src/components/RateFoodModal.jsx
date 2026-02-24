import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from './Button';

const RateFoodModal = ({ isOpen, onClose, onSubmit, order }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ orderId: order.id, rating, comment });
        onClose();
        setRating(0);
        setComment('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Rate Your Order</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-dark transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <img
                        src={order.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                        alt="Food"
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover shadow-md"
                    />
                    <h4 className="font-bold text-lg">{order.restaurant}</h4>
                    <p className="text-gray-500 text-sm">{order.items}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setRating(star)}
                                onClick={() => setRating(star)}
                                className={`transition-colors duration-200 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            >
                                <Star size={32} />
                            </button>
                        ))}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Write a review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you liked about the food..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-0 transition-all resize-none h-24"
                        ></textarea>
                    </div>

                    <Button variant="primary" className="w-full justify-center" disabled={rating === 0}>
                        Submit Review
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default RateFoodModal;
