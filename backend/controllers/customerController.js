const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// Get all approved/online restaurants for customers to browse
exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isOnline: true })
            .select('name image cuisines rating deliveryTime address menu isOnline');
        res.json(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching restaurants' });
    }
};

// Get a single restaurant by ID with its full menu
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching restaurant' });
    }
};

// Place a new order
exports.placeOrder = async (req, res) => {
    try {
        const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

        if (!restaurantId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Restaurant and items are required' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = new Order({
            user: req.user.id,
            restaurant: restaurant._id,
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            deliveryAddress: deliveryAddress || { street: 'Default Address', city: 'City', zip: '000000' },
            paymentMethod: paymentMethod || 'COD',
            status: 'Placed'
        });

        await order.save();

        res.status(201).json({ message: 'Order placed successfully!', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error placing order' });
    }
};


// Get customer's past orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('restaurant', 'name image address cuisines location')
            .populate('deliveryPartner', 'name phone lastKnownLocation')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// Get the customer's most recent active order (for the global popup)
exports.getActiveOrder = async (req, res) => {
    try {
        // Only consider orders from the last 3 hours to prevent stale orders from haunting the UI
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

        const activeOrder = await Order.findOne({
            user: req.user.id,
            status: { $nin: ['Delivered', 'Cancelled', 'Rejected'] },
            updatedAt: { $gte: threeHoursAgo }
        })
        .populate('restaurant', 'name image address cuisines location')
        .populate('deliveryPartner', 'name phone lastKnownLocation')
        .sort({ updatedAt: -1 });

        // Return null explicitly if no active order found (prevents undefined)
        res.json(activeOrder || null);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching active order' });
    }
};

// Get customer profile
exports.getProfile = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// Add a new address
exports.addAddress = async (req, res) => {
    try {
        const User = require('../models/User');
        const { street, city, zip, type } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses.push({ street, city, zip, type: type || 'Home' });
        await user.save();
        res.status(201).json({ message: 'Address added', addresses: user.addresses });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error adding address' });
    }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Address removed', addresses: user.addresses });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error deleting address' });
    }
};
