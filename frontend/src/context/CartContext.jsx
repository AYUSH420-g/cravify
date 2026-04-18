import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('cartItems');
        return localData ? JSON.parse(localData) : [];
    });

    const [restaurant, setRestaurant] = useState(() => {
        const localRes = localStorage.getItem('cartRestaurant');
        return localRes ? JSON.parse(localRes) : null;
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        if (restaurant) {
            localStorage.setItem('cartRestaurant', JSON.stringify(restaurant));
        } else {
            localStorage.removeItem('cartRestaurant');
        }
    }, [restaurant]);

    const addToCart = (item, currentRestaurant) => {
        // Use _id or id for comparison — normalize
        const restId = currentRestaurant._id || currentRestaurant.id;
        const currentRestId = restaurant ? (restaurant._id || restaurant.id) : null;

        // Check if adding from different restaurant
        if (currentRestId && currentRestId !== restId && cartItems.length > 0) {
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
            const itemId = item._id || item.id;
            const existing = prev.find(i => (i._id || i.id) === itemId);
            if (existing) {
                return prev.map(i => (i._id || i.id) === itemId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => (i._id || i.id) !== itemId));
        if (cartItems.length <= 1) {
            setRestaurant(null);
        }
    };

    const updateQuantity = (itemId, type) => {
        setCartItems(prev => {
            return prev.map(item => {
                if ((item._id || item.id) === itemId) {
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
