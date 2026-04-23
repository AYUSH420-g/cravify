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
            .select('restaurant user items totalAmount deliveryEarning distanceKm deliveryAddress status createdAt updatedAt')
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
        io.to(`user_${order.user}`).emit('order_status_updated', populatedOrder);

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
        io.to(`user_${order.user}`).emit('order_status_updated', updatedOrder);

        // On delivery completion — credit loyalty points + delivery earnings
        if (status === 'Delivered') {
            // Credit loyalty points to customer
            const loyaltyController = require('./loyaltyController');
            await loyaltyController.creditPointsForOrder(order._id);

            // Credit dynamic delivery earnings to partner
            const deliveryEarning = order.deliveryEarning || 30;
            await User.findByIdAndUpdate(req.user.id, {
                $inc: {
                    walletBalance: deliveryEarning,
                    totalEarnings: deliveryEarning
                }
            });
        }

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

// Get delivered orders history + earnings + wallet
exports.getHistoryAndEarnings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('walletBalance totalEarnings name email phone deliveryRating numDeliveryRatings deliveryDetails');

        const orders = await Order.find({
            deliveryPartner: req.user.id,
            status: 'Delivered'
        }).populate('restaurant', 'name image').populate('user', 'name').sort({ updatedAt: -1 });

        // Calculate today's earnings dynamically
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(o => new Date(o.updatedAt) >= todayStart);
        const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.deliveryEarning || 0), 0);
        const totalEarningsCalc = orders.reduce((sum, o) => sum + (o.deliveryEarning || 0), 0);

        // Calculate average earning per delivery
        const avgEarning = orders.length > 0 ? Math.round(totalEarningsCalc / orders.length) : 0;

        res.json({
            history: orders,
            walletBalance: user?.walletBalance || 0,
            totalEarnings: user?.totalEarnings || totalEarningsCalc,
            todayEarnings,
            deliveriesCount: orders.length,
            todayDeliveries: todayOrders.length,
            avgEarning,
            earnings: totalEarningsCalc,
            riderProfile: {
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
                rating: user?.deliveryRating || 0,
                numRatings: user?.numDeliveryRatings || 0,
                vehicleType: user?.deliveryDetails?.vehicleType || '',
                vehicleNumber: user?.deliveryDetails?.vehicleNumber || '',
                isOnline: user?.deliveryDetails?.isOnline || false
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching history' });
    }
};
