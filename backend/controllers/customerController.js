// ==========================================
// Customer Controller
// Handles: restaurant browsing, order placement, order history, profile updates
// ==========================================

const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const User = require('../models/User');

// ==========================================
// Restaurant Browsing
// ==========================================

// GET /api/customer/restaurants — Browse all restaurants
exports.getRestaurants = async (req, res) => {
    try {
        const { search, cuisine } = req.query;
        let query = {};

        // Optional search by restaurant name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Optional filter by cuisine type
        if (cuisine) {
            query.cuisines = { $in: [cuisine] };
        }

        const restaurants = await Restaurant.find(query)
            .select('name image cuisines rating deliveryTime priceForTwo offer address')
            .sort({ rating: -1 });

        res.json(restaurants);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ message: 'Server error fetching restaurants', error: err.message });
    }
};

// GET /api/customer/restaurants/:id — Get single restaurant with full menu
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(restaurant);
    } catch (err) {
        console.error('Error fetching restaurant:', err);
        res.status(500).json({ message: 'Server error fetching restaurant', error: err.message });
    }
};

// ==========================================
// Order Management (Customer Side)
// ==========================================

// POST /api/customer/orders — Place a new order
exports.placeOrder = async (req, res) => {
    try {
        const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

        // Validate required fields
        if (!restaurantId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Restaurant and items are required' });
        }

        // Calculate total amount from items
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = new Order({
            user: req.user.id,
            restaurant: restaurantId,
            items,
            totalAmount,
            deliveryAddress: deliveryAddress || {},
            paymentMethod: paymentMethod || 'COD',
            status: 'Placed'
        });

        await order.save();

        // Populate restaurant and user details for the response
        const populatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name image address')
            .populate('user', 'name email phone');

        res.status(201).json({ message: 'Order placed successfully', order: populatedOrder });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ message: 'Server error placing order', error: err.message });
    }
};

// GET /api/customer/orders — Get user's order history
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('restaurant', 'name image address')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Server error fetching orders', error: err.message });
    }
};

// GET /api/customer/orders/:id — Get specific order details
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
            .populate('restaurant', 'name image address')
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({ message: 'Server error fetching order', error: err.message });
    }
};

// ==========================================
// Profile Management
// ==========================================

// PUT /api/customer/profile — Update user profile and addresses
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, addresses } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (addresses) updateData.addresses = addresses;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error updating profile', error: err.message });
    }
};
