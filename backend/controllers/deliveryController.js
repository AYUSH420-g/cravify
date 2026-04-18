const Order = require('../models/Order');
const User = require('../models/User');

// Get available orders for delivery partners (Preparing OR ReadyForPickup, no assigned partner)
exports.getAvailableOrders = async (req, res) => {
    try {
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const availableOrders = await Order.find({
            status: { $in: ['Preparing', 'ReadyForPickup'] },
            deliveryPartner: null,
            updatedAt: { $gte: thirtyMinsAgo }
        }).populate('restaurant', 'name address location')
          .populate('user', 'name address')
          .sort({ createdAt: -1 });

        res.json(availableOrders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching available orders' });
    }
};

// Accept/Assign an order to the current rider
exports.acceptOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Check if there is already an active order for this rider
        const activeOrder = await Order.findOne({
            deliveryPartner: req.user.id,
            status: { $nin: ['Delivered', 'Cancelled', 'Rejected'] }
        });

        if (activeOrder) {
            return res.status(400).json({ message: 'You already have an active order. Please complete it first.' });
        }

        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // Atomic Update: Only one rider can set themselves as deliveryPartner if it's currently null
        const order = await Order.findOneAndUpdate(
            { 
                _id: orderId, 
                status: { $in: ['Preparing', 'ReadyForPickup'] }, 
                deliveryPartner: null,
                updatedAt: { $gte: thirtyMinsAgo } 
            },
            { deliveryPartner: req.user.id },
            { new: true }
        ).populate('restaurant', 'name address location').populate('user', 'name address phone');

        if (!order) {
            return res.status(400).json({ message: 'Order is no longer available, already assigned, or expired.' });
        }

        // Emit 'ORDER_TAKEN' to all other riders so they remove it from their lists
        const io = req.app.get('io');
        io.to('delivery_partners').emit('ORDER_TAKEN', orderId);

        // Notify the customer that a partner has been assigned (so popup shows partner name)
        const populatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name image address location')
            .populate('deliveryPartner', 'name phone lastKnownLocation');
        io.to(`user_${order.user}`).emit('ORDER_STATUS_UPDATED', populatedOrder);

        res.json({ message: 'Order accepted successfully', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error accepting order' });
    }
};

// Get current active order for Rider
exports.getActiveOrder = async (req, res) => {
    try {
        const activeOrder = await Order.findOne({
            deliveryPartner: req.user.id,
            status: { $nin: ['Delivered', 'Cancelled', 'Rejected'] }
        }).populate('restaurant', 'name address location')
          .populate('user', 'name address phone'); // user needs phone for rider to call

        res.json(activeOrder);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching active order' });
    }
};

// Update status (e.g. OutForDelivery -> Delivered)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, deliveryPartner: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found or access denied' });
        }

        // Ensuring we only set forward status updates if valid.
        const allowedStatuses = ['OutForDelivery', 'Delivered'];
        if (!allowedStatuses.includes(status)) {
             return res.status(400).json({ message: 'Invalid status update by delivery partner' });
        }

        order.status = status;
        await order.save();

        const io = req.app.get('io');
        const updatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name image address location')
            .populate('deliveryPartner', 'name phone lastKnownLocation');

        // Notify customer
        io.to(`user_${order.user}`).emit('ORDER_STATUS_UPDATED', updatedOrder);

        res.json({ message: `Order status updated to ${status}`, order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error updating order status' });
    }
};

// Toggle online status for delivery partners
exports.toggleOnlineStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.deliveryDetails) {
            user.deliveryDetails = {};
        }

        user.deliveryDetails.isOnline = isOnline;
        await user.save();

        res.json({ isOnline: user.deliveryDetails.isOnline });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error updating online status' });
    }
};

// Get delivered orders history + earnings
exports.getHistoryAndEarnings = async (req, res) => {
    try {
        const orders = await Order.find({
            deliveryPartner: req.user.id,
            status: 'Delivered'
        }).populate('restaurant', 'name').sort({ updatedAt: -1 });

        // Currently, assuming flat earning per order based on typical structure, calculate it:
        const BASE_DELIVERY_FEE = 40; // ₹40 per delivery default 
        const earnings = orders.length * BASE_DELIVERY_FEE;

        res.json({
            history: orders,
            earnings,
            deliveriesCount: orders.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching history' });
    }
};
