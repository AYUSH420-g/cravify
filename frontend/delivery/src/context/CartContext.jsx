import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('cartItems');
        return localData ? JSON.parse(localData) : [];
    });

    const [restaurant, setRestaurant] = useState(null); // To ensure items are from same restaurant

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item, currentRestaurant) => {
        // Check if adding from different restaurant
        if (restaurant && restaurant.id !== currentRestaurant.id && cartItems.length > 0) {
            const confirm = window.confirm("Your cart contains items from another restaurant. Do you want to reset your cart for this new restaurant?");
            if (confirm) {
                setCartItems([{ ...item, quantity: 1 }]);
                setRestaurant(currentRestaurant);
            }
            return;
        }

        if (!restaurant) {
            setRestaurant(currentRestaurant);
        }

        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        if (cartItems.length <= 1) setRestaurant(null);
    };

    const updateQuantity = (itemId, type) => {
        setCartItems(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    const newQuantity = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
                    if (newQuantity <= 0) return null;
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean);
        });

        if (cartItems.length === 1 && cartItems[0].quantity === 1 && type === 'minus') {
            setRestaurant(null);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setRestaurant(null);
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            restaurant
        }}>
            {children}
        </CartContext.Provider>
    );
};
