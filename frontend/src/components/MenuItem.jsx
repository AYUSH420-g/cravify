import React from 'react';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MenuItem = ({ id, _id, name, price, description, image, isVeg, votes, restaurant }) => {
    const { addToCart, cartItems, updateQuantity } = useCart();

    const itemId = _id || id;
    const cartItem = cartItems.find(item => (item._id || item.id) === itemId);

    const handleAdd = () => {
        addToCart({ _id: itemId, id: itemId, name, price, image, isVeg }, restaurant);
    };

    return (
        <div className="flex justify-between items-start gap-4 py-8 border-b border-gray-100 last:border-0">
            <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded-sm`}>
                        <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    {votes && <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">★ Bestseller</span>}
                </div>
                <h3 className="text-lg font-bold text-dark mb-1">{name}</h3>
                <p className="text-dark font-medium mb-3">₹{price}</p>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{description}</p>
            </div>

            <div className="relative w-36 h-32 shrink-0">
                <img src={image} alt={name} className="w-full h-full object-cover rounded-xl" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24">
                    {useAuth().user && useAuth().user.role !== 'customer' ? (
                        <div className="bg-gray-100 text-gray-400 border border-gray-200 shadow-sm rounded-xl h-9 flex items-center justify-center font-bold text-[10px] uppercase px-1">
                            {useAuth().user.role.replace('_partner', '')}
                        </div>
                    ) : cartItem ? (
                        <div className="flex items-center justify-between bg-white text-green-600 border border-gray-200 shadow-lg rounded-xl h-9 px-2 font-bold text-sm">
                            <button onClick={() => updateQuantity(itemId, 'minus')} className="px-2 text-gray-400 hover:text-green-600">-</button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(itemId, 'plus')} className="px-2 hover:scale-110">+</button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            className="w-full shadow-lg h-9 text-sm uppercase bg-white text-green-600 border border-gray-200 hover:bg-gray-50"
                            onClick={handleAdd}
                        >
                            Add
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuItem;
