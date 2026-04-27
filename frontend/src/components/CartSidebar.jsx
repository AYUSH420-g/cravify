import React from 'react';
import Button from './Button';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartSidebar = () => {
    const { cartItems, updateQuantity, cartTotal, restaurant, platformFee } = useCart();

    const toPay = cartTotal + platformFee;

    if (cartItems.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24 text-center">
                <h2 className="text-2xl font-bold text-dark mb-2">Cart Empty</h2>
                <p className="text-gray-500 mb-6">Good food is always cooking! Go ahead, order some yummy items from the menu.</p>
                <div className="w-full h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-4xl">🛒</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-dark mb-1">Cart</h2>
            {restaurant && <p className="text-xs text-gray-500 mb-6">from <span className="font-bold text-dark">{restaurant.name}</span></p>}

            <div className="space-y-6 mb-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {cartItems.map(item => (
                    <div key={item._id || item.id} className="flex justify-between items-start text-sm">
                        <div className="flex items-start gap-2 max-w-[60%]">
                            <div className={`w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded-sm mt-1 shrink-0`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                            </div>
                            <span className="font-medium text-dark">{item.name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center border border-gray-200 rounded px-2 py-0.5 font-bold text-green-600 bg-white shadow-sm">
                                <button onClick={() => updateQuantity(item._id || item.id, 'minus')} className="text-gray-400 hover:text-green-600 px-1">-</button>
                                <span className="mx-2 text-dark">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id || item.id, 'plus')} className="text-green-600 px-1">+</button>
                            </div>
                            <span className="text-dark font-medium text-xs mt-1">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Item Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fee</span>
                    <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-100 border-dashed">
                    <span className="text-dark">Subtotal</span>
                    <span className="text-dark">₹{toPay.toFixed(2)}</span>
                </div>
            </div>

            <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[9px] text-blue-700 font-bold leading-tight uppercase tracking-tighter text-center">
                    💡 Delivery fee, GST, and offers will be calculated at checkout.
                </p>
            </div>

            <Link to="/checkout">
                <Button variant="primary" className="w-full py-3 text-lg">Checkout</Button>
            </Link>
        </div>
    );
};

export default CartSidebar;
