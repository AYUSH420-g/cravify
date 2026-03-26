const DeliveryProfile = require('../models/DeliveryProfile');
const DeliveryTask = require('../models/DeliveryTask');
const Order = require('../models/Order');

// Helper to ensure profile exists
const getOrCreateProfile = async (userId) => {
    let profile = await DeliveryProfile.findOne({ user: userId });
    if (!profile) {
        profile = new DeliveryProfile({ user: userId });
        await profile.save();
    }
    return profile;
};

// 1. Get Profile
exports.getProfile = async (req, res) => {
    try {
        const profile = await getOrCreateProfile(req.user.id);
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. Toggle Online Status
exports.toggleOnline = async (req, res) => {
    try {
        const profile = await getOrCreateProfile(req.user.id);
        profile.isOnline = !profile.isOnline;
        await profile.save();
        res.json({ isOnline: profile.isOnline });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3. Get Available Tasks (Syncs orders without tasks)
exports.getAvailableTasks = async (req, res) => {
    try {
        const profile = await getOrCreateProfile(req.user.id);
        if (!profile.isOnline) {
            return res.json([]);
        }

        // Sync: Find orders that are Placed or Preparing but have no DeliveryTask
        const ordersWithoutTask = await Order.aggregate([
            { $match: { status: { $in: ['Placed', 'Preparing'] } } },
            {
                $lookup: {
                    from: 'deliverytasks',
                    localField: '_id',
                    foreignField: 'order',
                    as: 'task'
                }
            },
            { $match: { task: { $size: 0 } } }
        ]);

        // Create tasks for them
        for (const order of ordersWithoutTask) {
            await DeliveryTask.create({
                order: order._id,
                status: 'pending',
                earnings: Math.floor(Math.random() * 50) + 20 // Random earnings 20-70
            });
        }

        // Fetch pending tasks
        const availableTasks = await DeliveryTask.find({ status: 'pending' })
            .populate({
                path: 'order',
                populate: [
                    { path: 'restaurant', select: 'name address' },
                    { path: 'user', select: 'name addresses phone' }
                ]
            });

        res.json(availableTasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 4. Accept Task
exports.acceptTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await DeliveryTask.findById(taskId);
        
        if (!task || task.status !== 'pending') {
            return res.status(400).json({ message: 'Task is no longer available' });
        }

        task.deliveryPartner = req.user.id;
        task.status = 'accepted';
        await task.save();

        // Update order status if possible (optional, but good for consistency)
        await Order.findByIdAndUpdate(task.order, { status: 'OutForDelivery' });

        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 5. Get Active Task for partner
exports.getActiveTask = async (req, res) => {
    try {
        const activeTask = await DeliveryTask.findOne({
            deliveryPartner: req.user.id,
            status: { $in: ['accepted', 'arrived_at_restaurant', 'picked_up', 'arrived_at_customer'] }
        }).populate({
            path: 'order',
            populate: [
                { path: 'restaurant', select: 'name address lat lng' },
                { path: 'user', select: 'name addresses phone' }
            ]
        });

        res.json(activeTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 6. Update Task Status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        const task = await DeliveryTask.findOne({ _id: taskId, deliveryPartner: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.status = status;
        
        // If delivered, update earnings and original order
        if (status === 'delivered') {
            const profile = await getOrCreateProfile(req.user.id);
            profile.totalEarnings += task.earnings;
            profile.totalDeliveries += 1;
            await profile.save();

            await Order.findByIdAndUpdate(task.order, { status: 'Delivered' });
        }

        await task.save();
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 7. Get History
exports.getHistory = async (req, res) => {
    try {
        const tasks = await DeliveryTask.find({ 
            deliveryPartner: req.user.id,
            status: { $in: ['delivered', 'cancelled'] }
        }).populate({
            path: 'order',
            populate: { path: 'restaurant', select: 'name' }
        }).sort({ updatedAt: -1 });
        
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
