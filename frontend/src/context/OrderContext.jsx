import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { token, user } = useAuth();
    const socket = useSocket();
    const [activeOrder, setActiveOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && user?.role === 'customer') {
            fetchActiveOrder();
            // Fallback polling every 30 seconds
            const interval = setInterval(fetchActiveOrder, 30000);
            return () => clearInterval(interval);
        } else {
            setActiveOrder(null);
            setLoading(false);
        }
    }, [token, user]);

    // Handle Socket Updates
    useEffect(() => {
        if (socket && user?.role === 'customer') {
            const handleStatusUpdate = (updatedOrder) => {
                console.log('Order status update received:', updatedOrder?.status);
                if (['Delivered', 'Cancelled', 'Rejected'].includes(updatedOrder?.status)) {
                    setActiveOrder(null);
                } else {
                    setActiveOrder(updatedOrder);
                }
            };

            socket.on('ORDER_STATUS_UPDATED', handleStatusUpdate);

            return () => {
                socket.off('ORDER_STATUS_UPDATED', handleStatusUpdate);
            };
        }
    }, [socket, user]);

    const fetchActiveOrder = async () => {
        try {
            const res = await fetch('/api/customer/orders/active', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setActiveOrder(data || null);
            }
        } catch (err) {
            console.error('Failed to fetch active order', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <OrderContext.Provider value={{ activeOrder, setActiveOrder, fetchActiveOrder, loading }}>
            {children}
        </OrderContext.Provider>
    );
};
