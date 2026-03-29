// ==========================================
// Vendor (Restaurant Partner) Controller
// Handles: restaurant profile, menu CRUD, order management
// ==========================================

const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const User = require('../models/User');

// ==========================================
// Restaurant Profile
// ==========================================

// GET /api/vendor/profile — Get the restaurant linked to this partner
exports.getProfile = async (req, res) => {
    try {
        // Find the restaurant document owned by this user
        // We'll use the user's name to match, or a direct reference field
        const user = await User.findById(req.user.id).select('-password');
        const restaurant = await Restaurant.findOne({ owner: req.user.id });

        res.json({
            user,
            restaurant: restaurant || null
        });
    } catch (err) {
        console.error('Error fetching vendor profile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/vendor/profile — Update restaurant info
exports.updateProfile = async (req, res) => {
    try {
        const { name, image, cuisines, deliveryTime, priceForTwo, offer, address } = req.body;

        let restaurant = await Restaurant.findOne({ owner: req.user.id });

        if (!restaurant) {
            // Create a new restaurant profile for this vendor
            restaurant = new Restaurant({
                name: name || 'My Restaurant',
                image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
                owner: req.user.id,
                cuisines: cuisines || [],
                deliveryTime: deliveryTime || '30-40 mins',
                priceForTwo: priceForTwo || '₹300 for two',
                offer: offer || '',
                address: address || ''
            });
        } else {
            // Update existing fields
            if (name) restaurant.name = name;
            if (image) restaurant.image = image;
            if (cuisines) restaurant.cuisines = cuisines;
            if (deliveryTime) restaurant.deliveryTime = deliveryTime;
            if (priceForTwo) restaurant.priceForTwo = priceForTwo;
            if (offer !== undefined) restaurant.offer = offer;
            if (address) restaurant.address = address;
        }

        await restaurant.save();
        res.json({ message: 'Restaurant profile updated', restaurant });
    } catch (err) {
        console.error('Error updating vendor profile:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ==========================================
// Menu Management (CRUD)
// ==========================================

// GET /api/vendor/menu — Get all menu items for this restaurant
exports.getMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user.id });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found. Please create your restaurant profile first.' });
        }

        res.json(restaurant.menu || []);
    } catch (err) {
        console.error('Error fetching menu:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/vendor/menu — Add a new menu item
exports.addMenuItem = async (req, res) => {
    try {
        const { name, description, price, image, isVeg, category, isBestseller } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Item name and price are required' });
        }

        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const newItem = { name, description, price, image, isVeg, category, isBestseller };
        restaurant.menu.push(newItem);
        await restaurant.save();

        // Return the newly added item (last item in array)
        const addedItem = restaurant.menu[restaurant.menu.length - 1];
        res.status(201).json({ message: 'Menu item added', item: addedItem });
    } catch (err) {
        console.error('Error adding menu item:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/vendor/menu/:itemId — Update a menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, description, price, image, isVeg, category, isBestseller } = req.body;

        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const menuItem = restaurant.menu.id(itemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        // Update only provided fields
        if (name !== undefined) menuItem.name = name;
        if (description !== undefined) menuItem.description = description;
        if (price !== undefined) menuItem.price = price;
        if (image !== undefined) menuItem.image = image;
        if (isVeg !== undefined) menuItem.isVeg = isVeg;
        if (category !== undefined) menuItem.category = category;
        if (isBestseller !== undefined) menuItem.isBestseller = isBestseller;

        await restaurant.save();
        res.json({ message: 'Menu item updated', item: menuItem });
    } catch (err) {
        console.error('Error updating menu item:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/vendor/menu/:itemId — Delete a menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const menuItem = restaurant.menu.id(itemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        menuItem.deleteOne();
        await restaurant.save();
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        console.error('Error deleting menu item:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ==========================================
// Order Management (Vendor Side)
// ==========================================

// GET /api/vendor/orders — Get all orders for this restaurant
exports.getOrders = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const orders = await Order.find({ restaurant: restaurant._id })
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Error fetching vendor orders:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/vendor/orders/:id/status — Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Vendors can only set these statuses
        const allowedStatuses = ['Preparing', 'OutForDelivery', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
        }

        // Verify the order belongs to the vendor's restaurant
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const order = await Order.findOne({ _id: id, restaurant: restaurant._id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found for this restaurant' });
        }

        order.status = status;
        await order.save();

        res.json({ message: `Order status updated to ${status}`, order });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
