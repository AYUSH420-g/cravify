const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/Chat');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// Get all messages for a specific order
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Check if user is authorized to view this order's chat
        const Restaurant = require('../models/Restaurant');
        let isVendorOfOrder = false;
        if (req.user.role === 'restaurant_partner') {
            const restaurant = await Restaurant.findById(order.restaurant);
            isVendorOfOrder = restaurant && restaurant.vendor?.toString() === req.user.id;
        }

        const isAuthorized = 
            req.user.id === order.user.toString() || 
            isVendorOfOrder ||
            (order.deliveryPartner && req.user.id === order.deliveryPartner.toString()) ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        // Fetch messages
        const messages = await ChatMessage.find({ order: orderId })
            .populate('sender', 'name role')
            .sort({ createdAt: 1 })
            .lean();

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching chat' });
    }
});

// POST — Send a message via HTTP (reliable fallback that also emits via socket)
router.post('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { text, senderRole } = req.body;
        const senderId = req.user.id;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // Save to database
        const message = await ChatMessage.create({
            order: orderId,
            sender: senderId,
            senderRole: senderRole || req.user.role,
            text: text.trim()
        });

        // Populate sender info
        await message.populate('sender', 'name role');

        // Emit via socket.io to everyone in the order room
        const io = req.app.get('io');
        if (io) {
            console.log(`Emitting chat message to room order_${orderId}`);
            io.to(`order_${orderId}`).emit('receive_message', message);
            io.to(`order_${orderId}`).emit('chat_message', message);
        } else {
            console.warn('Socket.io instance not found in app, real-time chat will fail');
        }

        res.json({ success: true, message });
    } catch (err) {
        console.error('Send chat error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// DELETE — Clean up chat messages for a delivered order
router.delete('/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;
        await ChatMessage.deleteMany({ order: orderId });
        res.json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
        console.error('Chat cleanup error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to clear chat' });
    }
});

module.exports = router;
