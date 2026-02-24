import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

const RestaurantCard = ({
    id,
    name,
    image,
    rating,
    deliveryTime,
    priceForTwo,
    cuisines,
    offer
}) => {
    return (
        <Link to={`/restaurant/${id}`} className="block h-full">
            <div className="group hover:shadow-xl rounded-2xl transition-all duration-300 cursor-pointer bg-white border border-transparent hover:border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {offer && (
                        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                            {offer}
                        </div>
                    )}
                </div>

                <div className="p-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-dark truncate pr-4">{name}</h3>
                        <div className="flex items-center gap-1 bg-green-700 text-white px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                            <span>{rating}</span>
                            <Star size={10} fill="currentColor" />
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 font-medium mb-3">
                        <div className="flex items-center gap-1">
                            <span className="bg-gray-200 rounded-full p-0.5"><Clock size={10} /></span>
                            <span>{deliveryTime} mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>₹{priceForTwo}</span>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm truncate mb-auto">{cuisines.join(", ")}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <img src="https://b.zmtcdn.com/data/o2_assets/4bf016f32f05d26242cea342f30d47a31595763089.png" alt="safe" className="h-4 grayscale opacity-70" />
                        <span>Follows all safety measures</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;
