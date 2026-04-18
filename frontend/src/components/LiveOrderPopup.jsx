import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Utensils, ArrowRight } from 'lucide-react';

const LiveOrderPopup = () => {
    const { activeOrder } = useOrder();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show if on the tracking page itself
    if (location.pathname === '/order-tracking') return null;
    if (!activeOrder) return null;

    const getIcon = () => {
        switch (activeOrder.status) {
            case 'Placed': return <Package className="text-primary" size={20} />;
            case 'Preparing': return <Utensils className="text-orange-500 animate-pulse" size={20} />;
            case 'ReadyForPickup': return <Utensils className="text-green-500" size={20} />;
            case 'OutForDelivery': return <Truck className="text-green-500 animate-bounce" size={20} />;
            default: return <Package size={20} />;
        }
    };

    const getStatusText = () => {
        const hasPartner = activeOrder.deliveryPartner;
        switch (activeOrder.status) {
            case 'Placed': return 'Order Placed';
            case 'Preparing': return 'Preparing your food';
            case 'ReadyForPickup': return hasPartner ? `${activeOrder.deliveryPartner.name} is picking up` : 'Finding delivery hero...';
            case 'OutForDelivery': return hasPartner ? `${activeOrder.deliveryPartner.name} is on the way` : 'Out for Delivery';
            default: return 'Order Update';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
                <div 
                    onClick={() => navigate('/order-tracking')}
                    className="bg-dark text-white p-4 rounded-2xl shadow-2xl border border-gray-700 cursor-pointer flex items-center justify-between group hover:bg-gray-900 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            {getIcon()}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Active Order from {activeOrder.restaurant?.name}</p>
                            <p className="font-bold text-sm tracking-wide">{getStatusText()}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest pl-4">
                        Track <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LiveOrderPopup;
