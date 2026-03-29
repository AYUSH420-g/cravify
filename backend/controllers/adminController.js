const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const DeliveryProfile = require('../models/DeliveryProfile');
const Order = require('../models/Order');

// ==========================================
// Dashboard Stats
// ==========================================
exports.getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'customer' });
        const partnerCount = await User.countDocuments({ role: 'restaurant_partner' });
        const deliveryCount = await User.countDocuments({ role: 'delivery_partner' });
        const orderCount = await Order.countDocuments();
        
        // Calculate total revenue from all delivered orders
        const orders = await Order.find({ status: 'Delivered' });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        res.json({
            users: userCount,
            restaurants: partnerCount,
            riders: deliveryCount,
            orders: orderCount,
            revenue: totalRevenue
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server error fetching stats', error: err.message });
    }
};

// ==========================================
// User Management
// ==========================================
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching users', error: err.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: `User status updated to ${status}`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating user', error: err.message });
    }
};

// ==========================================
// Restaurant Approvals
// ==========================================
exports.getRestaurants = async (req, res) => {
    try {
        // Find users with role restaurant_partner and their associated restaurant profile if any
        const restaurantPartners = await User.find({ role: 'restaurant_partner' }).select('-password').sort({ createdAt: -1 });
        res.json(restaurantPartners);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching restaurants', error: err.message });
    }
};

exports.updateRestaurantStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { applicationStatus } = req.body; // 'pending', 'approved', 'rejected'

        if (!['pending', 'approved', 'rejected'].includes(applicationStatus)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const isVerified = applicationStatus === 'approved';

        const user = await User.findByIdAndUpdate(
            userId, 
            { applicationStatus, isVerified }, 
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'Restaurant partner not found' });

        res.json({ message: `Restaurant application ${applicationStatus}`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating restaurant', error: err.message });
    }
};

// ==========================================
// Delivery Partner Approvals
// ==========================================
exports.getDeliveryPartners = async (req, res) => {
    try {
        // It's helpful to populate delivery profile data if it exists, but for now we look at Users
        const deliveryPartners = await User.find({ role: 'delivery_partner' }).select('-password').sort({ createdAt: -1 });
        res.json(deliveryPartners);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching delivery partners', error: err.message });
    }
};

exports.updateDeliveryPartnerStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { applicationStatus } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(applicationStatus)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const isVerified = applicationStatus === 'approved';

        const user = await User.findByIdAndUpdate(
            userId, 
            { applicationStatus, isVerified }, 
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'Delivery partner not found' });

        res.json({ message: `Delivery partner application ${applicationStatus}`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating delivery partner', error: err.message });
    }
};

// ==========================================
// Order Monitoring
// ==========================================
exports.getOrders = async (req, res) => {
    try {
        // Populate customer and restaurant details for the admin view
        const orders = await Order.find()
            .populate('user', 'name email phone')
            .populate('restaurant', 'name address')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching orders', error: err.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findByIdAndUpdate(
            orderId, 
            { status: 'Cancelled' }, 
            { new: true }
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order cancelled administratively', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error cancelling order', error: err.message });
    }
};

// ==========================================
// Platform Configuration (Settings)
// ==========================================
const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ singletonId: 'admin_config' });
        if (!settings) {
            settings = await Settings.create({}); // Returns default values
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching settings', error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updateData = req.body;
        const settings = await Settings.findOneAndUpdate(
            { singletonId: 'admin_config' },
            { $set: updateData },
            { new: true, upsert: true }
        );
        res.json({ message: 'Settings updated', settings });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating settings', error: err.message });
    }
};

// ==========================================
// Promotional Campaigns (Promos)
// ==========================================
const Promo = require('../models/Promo');

exports.getPromos = async (req, res) => {
    try {
        const promos = await Promo.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching promos', error: err.message });
    }
};

exports.createPromo = async (req, res) => {
    try {
        const promoData = req.body;
        // Make sure code is uppercase
        if (promoData.code) promoData.code = promoData.code.toUpperCase();
        
        const promo = await Promo.create(promoData);
        res.status(201).json({ message: 'Promo created successfully', promo });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Promo code already exists' });
        }
        res.status(500).json({ message: 'Server error creating promo', error: err.message });
    }
};

exports.togglePromoStatus = async (req, res) => {
    try {
        const promoId = req.params.id;
        const promo = await Promo.findById(promoId);
        if (!promo) return res.status(404).json({ message: 'Promo not found' });

        promo.isActive = !promo.isActive;
        await promo.save();
        
        res.json({ message: `Promo is now ${promo.isActive ? 'active' : 'inactive'}`, promo });
    } catch (err) {
        res.status(500).json({ message: 'Server error toggling promo', error: err.message });
    }
};

exports.deletePromo = async (req, res) => {
    try {
        const promoId = req.params.id;
        const promo = await Promo.findByIdAndDelete(promoId);
        if (!promo) return res.status(404).json({ message: 'Promo not found' });
        
        res.json({ message: 'Promo deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting promo', error: err.message });
    }
};
