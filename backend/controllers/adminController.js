const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Settings = require('../models/Settings');

// Get all pending partner registrations
exports.getPendingApprovals = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 100;
        const users = await User.find({ 
            role: { $in: ['restaurant_partner', 'delivery_partner'] }, 
            isVerified: false 
        }).select('-password').limit(limit).lean();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Approve a partner registration
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        res.json({ message: 'User approved successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Reject a partner registration
exports.rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User registration rejected and deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// ─── Orders ───

// Get all platform orders
exports.getAllOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 500;
        
        let query = {};
        if (req.query.restaurant) {
            query.restaurant = req.query.restaurant;
        }
        if (req.query.deliveryPartner) {
            query.deliveryPartner = req.query.deliveryPartner;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name address')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// Cancel an order (admin override)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = 'Cancelled';
        await order.save();
        
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${order.user}`).emit('order_status_updated', order);
            io.to(`order_${order._id}`).emit('order_status_updated', order);
        }

        res.json({ message: 'Order cancelled', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error cancelling order' });
    }
};

// ─── Restaurants ───

// Get all restaurants (with vendor info)
exports.getAllRestaurants = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 100;
        const restaurants = await Restaurant.find()
            .populate('vendor', 'name email phone isVerified')
            .limit(limit)
            .lean();
        res.json(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching restaurants' });
    }
};

// ─── Settings ───

exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.getInstance();
        res.json(settings.toObject ? settings.toObject() : settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching settings' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { platformFee, referralBonus, supportEmail, maintenanceMode, autoApproveRestaurants } = req.body;
        const settings = await Settings.getInstance();

        if (platformFee !== undefined) settings.platformFee = platformFee;
        if (referralBonus !== undefined) settings.referralBonus = referralBonus;
        if (supportEmail !== undefined) settings.supportEmail = supportEmail;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (autoApproveRestaurants !== undefined) settings.autoApproveRestaurants = autoApproveRestaurants;

        await settings.save();
        res.json({ message: 'Settings updated', settings });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error updating settings' });
    }
};
