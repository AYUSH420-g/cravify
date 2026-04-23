const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const imagekit = require('../utils/imagekit');

// Ensure a Restaurant document exists for the logged-in vendor
const getOrCreateRestaurant = async (userId) => {
    let restaurant = await Restaurant.findOne({ vendor: userId });
    if (!restaurant) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'restaurant_partner') {
            throw new Error('User is not a valid restaurant partner');
        }

        const details = user.restaurantDetails || {};
        const cuisines = details.cuisine ? details.cuisine.split(',').map(c => c.trim()) : [];

        restaurant = new Restaurant({
            vendor: userId,
            name: details.restaurantName || user.name || 'My Restaurant',
            image: details.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
            cuisines,
            address: details.address || '',
            pincode: details.pincode || '',
            location: details.location,
            menu: [],
            isOnline: false
        });
        await restaurant.save();
    }
    return restaurant;
};

exports.getDashboardData = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);

        // Fetch active orders (not delivered and not cancelled)
        const liveOrders = await Order.find({
            restaurant: restaurant._id,
            status: { $nin: ['Delivered', 'Cancelled'] }
        }).populate('user', 'name phone').sort({ createdAt: -1 });

        // Compile some basic stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysOrders = await Order.find({
            restaurant: restaurant._id,
            createdAt: { $gte: today },
            status: 'Delivered'
        });

        const todayEarnings = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
            restaurant,
            stats: {
                todayEarnings,
                totalLiveOrders: liveOrders.length,
                menuItemsCount: restaurant.menu.length
            },
            liveOrders
        });
    } catch (err) {
        console.error("Dashboard error:", err.message);
        res.status(500).json({ message: 'Server error fetching dashboard' });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);
        restaurant.isOnline = !restaurant.isOnline;
        await restaurant.save();
        res.json({ isOnline: restaurant.isOnline });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// --- Menu Management ---

exports.getMenu = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);
        res.json(restaurant.menu);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching menu' });
    }
};

exports.addMenuItem = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);
        const { name, category, price, isVeg, description } = req.body;

        let imageUrl = '';
        if (req.file) {
            const uploadRes = await imagekit.upload({
                file: req.file.buffer, // Buffer from multer memoryStorage
                fileName: `menu-${Date.now()}-${req.file.originalname}`,
                folder: '/cravify/menu'
            });
            imageUrl = uploadRes.url;
        }

        const newItem = {
            name,
            category,
            price: Number(price),
            isVeg: isVeg === 'true' || isVeg === true,
            description: description || '',
            image: imageUrl || undefined
        };

        restaurant.menu.push(newItem);
        await restaurant.save();

        res.status(201).json({ message: 'Item added successfully', menu: restaurant.menu });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error adding menu item' });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);
        const itemId = req.params.id;
        const { name, category, price, isVeg, description } = req.body;

        const itemIndex = restaurant.menu.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update fields
        if (name) restaurant.menu[itemIndex].name = name;
        if (category) restaurant.menu[itemIndex].category = category;
        if (price) restaurant.menu[itemIndex].price = Number(price);
        if (isVeg !== undefined) restaurant.menu[itemIndex].isVeg = isVeg === 'true' || isVeg === true;
        if (description !== undefined) restaurant.menu[itemIndex].description = description;

        if (req.file) {
            const uploadRes = await imagekit.upload({
                file: req.file.buffer, // Buffer from multer memoryStorage
                fileName: `menu-${Date.now()}-${req.file.originalname}`,
                folder: '/cravify/menu'
            });
            restaurant.menu[itemIndex].image = uploadRes.url;
        }

        await restaurant.save();
        res.json({ message: 'Item updated successfully', menu: restaurant.menu });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error updating menu item' });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);
        const itemId = req.params.id;

        restaurant.menu = restaurant.menu.filter(item => item._id.toString() !== itemId);
        await restaurant.save();

        res.json({ message: 'Item removed', menu: restaurant.menu });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error deleting menu item' });
    }
};

// --- Orders Management ---

exports.getOrders = async (req, res) => {
    try {
        const restaurant = await getOrCreateRestaurant(req.user.id);
        const limit = parseInt(req.query.limit, 10) || 100;
        const orders = await Order.find({ restaurant: restaurant._id })
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Validate allowed transitions for vendors
        const allowedTransitions = {
            'Placed': ['Preparing', 'Rejected'],
            'Preparing': ['ReadyForPickup', 'Cancelled']
        };

        const allowed = allowedTransitions[order.status];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from '${order.status}' to '${status}'. Allowed: ${allowed?.join(', ') || 'none'}`
            });
        }

        order.status = status;
        if (status === 'Rejected' && rejectionReason) {
            order.rejectionReason = rejectionReason;
        }

        await order.save();

        const io = req.app.get('io');
        // Populate relevant data for the global popup
        const updatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name image address location')
            .populate('deliveryPartner', 'name phone lastKnownLocation');

        // Notify the customer specifically (for the global tracking popup)
        io.to(`user_${order.user}`).emit('order_status_updated', updatedOrder);

        // Notify the specific order room (for OrderTracking page)
        io.to(`order_${order._id}`).emit('order_status_updated', updatedOrder);

        // Broadcast to delivery partners when order is available for pickup
        if (status === 'Preparing' || status === 'ReadyForPickup') {
            io.to('delivery_partners').emit('NEW_AVAILABLE_ORDER', updatedOrder);
        }

        res.json({ message: `Order marked as ${status}`, order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error updating order' });
    }
};
