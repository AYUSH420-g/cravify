const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const User = require('../models/User');
const { validatePincode, haversineDistance, calculateDeliveryFee, calculateDeliveryEarning } = require('../utils/pincode');

// Available offers (could be moved to DB/Settings later)
const AVAILABLE_OFFERS = [
    {
        code: 'FREE_DELIVERY',
        title: 'Free Delivery',
        description: 'Free delivery on orders above ₹500',
        type: 'free_delivery',
        minOrder: 500,
        auto: true // auto-applied
    },
    {
        code: 'WELCOME50',
        title: '₹50 OFF',
        description: 'Get ₹50 off on your first order. Min order ₹200.',
        type: 'flat_discount',
        discount: 50,
        minOrder: 200,
        auto: false
    },
    {
        code: 'CRAVIFY10',
        title: '10% OFF',
        description: '10% off up to ₹100. Min order ₹300.',
        type: 'percent_discount',
        percent: 10,
        maxDiscount: 100,
        minOrder: 300,
        auto: false
    },
    {
        code: 'CARDPAY20',
        title: '₹20 Cashback',
        description: '₹20 cashback on card/UPI payments over ₹250.',
        type: 'cashback',
        cashback: 20,
        minOrder: 250,
        paymentRequired: ['Card', 'UPI', 'Razorpay'],
        auto: false
    }
];

// Get available offers for the customer
exports.getOffers = (req, res) => {
    res.json({ success: true, offers: AVAILABLE_OFFERS });
};

// Calculate delivery fee preview (before placing order)
exports.calculateFees = async (req, res) => {
    try {
        const { restaurantId, deliveryPincode, itemTotal, offerCode, paymentMethod } = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const restPincode = restaurant.pincode || '';
        let distanceKm = 5; // default

        // Calculate distance between pincodes
        if (deliveryPincode && restPincode) {
            const restPin = await validatePincode(restPincode);
            const custPin = await validatePincode(deliveryPincode);
            if (restPin?.lat && custPin?.lat) {
                distanceKm = haversineDistance(restPin.lat, restPin.lng, custPin.lat, custPin.lng);
            }
        }

        let deliveryFee = calculateDeliveryFee(distanceKm, itemTotal || 0);
        const platformFee = 5;
        const gst = Math.round((itemTotal || 0) * 0.05);
        let offerDiscount = 0;
        let appliedOffer = null;

        // Apply offer
        if (offerCode) {
            const offer = AVAILABLE_OFFERS.find(o => o.code === offerCode);
            if (!offer) {
                return res.status(400).json({ success: false, message: 'Invalid promo code.' });
            }
            if ((itemTotal || 0) < offer.minOrder) {
                return res.status(400).json({ success: false, message: `Minimum order value for this promo is ₹${offer.minOrder}.` });
            }
            if (offer.code === 'WELCOME50') {
                const prevOrder = await Order.findOne({ user: req.user.id });
                if (prevOrder) {
                    return res.status(400).json({ success: false, message: 'This promo code is only valid for your first order.' });
                }
            }

            if (offer.type === 'free_delivery') {
                offerDiscount = deliveryFee;
                deliveryFee = 0;
            } else if (offer.type === 'flat_discount') {
                offerDiscount = offer.discount;
            } else if (offer.type === 'percent_discount') {
                offerDiscount = Math.min(Math.round((itemTotal || 0) * offer.percent / 100), offer.maxDiscount);
            } else if (offer.type === 'cashback' && offer.paymentRequired && !offer.paymentRequired.includes(paymentMethod)) {
                return res.status(400).json({ success: false, message: `This promo requires payment via ${offer.paymentRequired.join('/')}.` });
            } else if (offer.type === 'cashback') {
                offerDiscount = offer.cashback;
            }
            appliedOffer = offer;
        }

        // Auto-apply free delivery if eligible and no manual offer
        if (!offerCode && (itemTotal || 0) >= 500) {
            offerDiscount = deliveryFee;
            deliveryFee = 0;
            appliedOffer = AVAILABLE_OFFERS.find(o => o.code === 'FREE_DELIVERY');
        }

        const total = Math.max(0, (itemTotal || 0) + deliveryFee + platformFee + gst - offerDiscount);
        const deliveryEarning = calculateDeliveryEarning(distanceKm, itemTotal || 0);

        res.json({
            success: true,
            breakdown: {
                itemTotal: itemTotal || 0,
                deliveryFee,
                platformFee,
                gst,
                offerDiscount,
                offerCode: appliedOffer?.code || '',
                distanceKm: Math.round(distanceKm * 10) / 10,
                totalAmount: total,
                deliveryEarning
            }
        });
    } catch (err) {
        console.error('Fee calculation error:', err.message);
        res.status(500).json({ message: 'Server error calculating fees' });
    }
};

// Get all approved/online restaurants for customers to browse
exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isOnline: true })
            .select('name image cuisines rating deliveryTime address isOnline pincode')
            .lean();
        res.json(restaurants);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching restaurants' });
    }
};

// Get a single restaurant by ID with its full menu
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).lean();
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching restaurant' });
    }
};

// Place a new order (COD flow — Razorpay handled by payment controller)
exports.placeOrder = async (req, res) => {
    try {
        const { restaurantId, items, deliveryAddress, deliveryLocation, paymentMethod, loyaltyPointsToRedeem, offerCode } = req.body;

        if (!restaurantId || !items || items.length === 0) {
            return res.status(400).json({ message: 'Restaurant and items are required' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const itemTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate distance from pincodes
        const restPincode = restaurant.pincode || '';
        const deliveryPincode = deliveryAddress?.zip || '';
        let distanceKm = 5; // default

        if (deliveryPincode && restPincode) {
            try {
                const restPin = await validatePincode(restPincode);
                const custPin = await validatePincode(deliveryPincode);
                if (restPin?.lat && custPin?.lat) {
                    distanceKm = haversineDistance(restPin.lat, restPin.lng, custPin.lat, custPin.lng);
                }
            } catch (e) {
                console.error('Distance calculation failed, using default:', e.message);
            }
        }

        let deliveryFee = calculateDeliveryFee(distanceKm, itemTotal);
        const platformFee = 5;
        const gst = Math.round(itemTotal * 0.05);
        let offerDiscount = 0;
        let appliedOfferCode = '';

        // Apply offer
        if (offerCode) {
            const offer = AVAILABLE_OFFERS.find(o => o.code === offerCode);
            if (!offer) {
                return res.status(400).json({ message: 'Invalid promo code.' });
            }
            if (itemTotal < offer.minOrder) {
                return res.status(400).json({ message: `Minimum order value for this promo is ₹${offer.minOrder}.` });
            }
            if (offer.code === 'WELCOME50') {
                const prevOrder = await Order.findOne({ user: req.user.id });
                if (prevOrder) {
                    return res.status(400).json({ message: 'This promo code is only valid for your first order.' });
                }
            }

            if (offer.type === 'free_delivery') {
                offerDiscount = deliveryFee;
                deliveryFee = 0;
            } else if (offer.type === 'flat_discount') {
                offerDiscount = offer.discount;
            } else if (offer.type === 'percent_discount') {
                offerDiscount = Math.min(Math.round(itemTotal * offer.percent / 100), offer.maxDiscount);
            } else if (offer.type === 'cashback' && offer.paymentRequired && !offer.paymentRequired.includes(paymentMethod)) {
                return res.status(400).json({ message: `This promo requires payment via ${offer.paymentRequired.join('/')}.` });
            } else if (offer.type === 'cashback') {
                offerDiscount = offer.cashback;
            }
            appliedOfferCode = offer.code;
        }

        // Auto-apply free delivery if no manual offer and order qualifies
        if (!offerCode && itemTotal >= 500) {
            offerDiscount = deliveryFee;
            deliveryFee = 0;
            appliedOfferCode = 'FREE_DELIVERY';
        }

        let totalAmount = itemTotal + deliveryFee + platformFee + gst - offerDiscount;

        // Handle loyalty points redemption for COD
        let pointsUsed = 0;
        if (loyaltyPointsToRedeem && loyaltyPointsToRedeem > 0) {
            const user = await User.findById(req.user.id);
            const maxRedeemable = Math.min(user.loyaltyPoints, Math.floor(totalAmount * 0.5));
            pointsUsed = Math.min(loyaltyPointsToRedeem, maxRedeemable);
            totalAmount = totalAmount - pointsUsed;
        }

        totalAmount = Math.max(0, Math.round(totalAmount));

        // Calculate points to earn (1 per ₹10 on food items only)
        const pointsEarned = Math.floor(itemTotal / 10);

        // Calculate dynamic delivery earning for the rider
        const deliveryEarning = calculateDeliveryEarning(distanceKm, itemTotal);

        // Geocode delivery location from pincode if not provided
        let finalDeliveryLocation = deliveryLocation;
        if ((!finalDeliveryLocation?.lat || !finalDeliveryLocation?.lng) && deliveryPincode) {
            try {
                const pinData = await validatePincode(deliveryPincode);
                if (pinData?.lat) {
                    finalDeliveryLocation = { lat: pinData.lat, lng: pinData.lng };
                }
            } catch (e) {
                console.error('Pincode geocoding for delivery location failed:', e.message);
            }
        }

        const order = new Order({
            user: req.user.id,
            restaurant: restaurant._id,
            items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            itemTotal,
            deliveryFee,
            platformFee,
            gst,
            offerDiscount,
            offerCode: appliedOfferCode,
            distanceKm: Math.round(distanceKm * 10) / 10,
            totalAmount,
            deliveryAddress: deliveryAddress || { street: 'Default Address', city: 'City', zip: '000000' },
            restaurantPincode: restPincode,
            deliveryPincode: deliveryPincode,
            deliveryLocation: finalDeliveryLocation?.lat && finalDeliveryLocation?.lng
                ? { lat: finalDeliveryLocation.lat, lng: finalDeliveryLocation.lng }
                : undefined,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'COD' ? 'COD' : 'Pending',
            loyaltyPointsUsed: pointsUsed,
            loyaltyPointsEarned: pointsEarned,
            deliveryEarning,
            status: 'Placed'
        });

        await order.save();

        // Deduct loyalty points if used
        if (pointsUsed > 0) {
            const user = await User.findByIdAndUpdate(req.user.id, {
                $inc: { loyaltyPoints: -pointsUsed }
            }, { new: true });

            const LoyaltyTransaction = require('../models/LoyaltyTransaction');
            await LoyaltyTransaction.create({
                user: req.user.id,
                type: 'redeem',
                points: pointsUsed,
                order: order._id,
                description: `Redeemed ${pointsUsed} points for ₹${pointsUsed} discount`,
                balanceAfter: user.loyaltyPoints
            });
        }

        // Populate fresh order to include restaurant details before emitting
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email phone')
            .populate('restaurant', 'name address pincode')
            .lean();

        // Notify the restaurant via socket that a new order arrived
        const io = req.app.get('io');
        if (io && restaurant.vendor) {
            io.to(`user_${restaurant.vendor}`).emit('new_order', populatedOrder);
        }

        res.status(201).json({ message: 'Order placed successfully!', order, pointsEarned });
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
            .sort({ createdAt: -1 })
            .lean();
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
        .sort({ updatedAt: -1 })
        .lean();

        // Return null explicitly if no active order found (prevents undefined)
        res.json(activeOrder || null);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching active order' });
    }
};

// Consolidated endpoint for Order + Restaurant + User + Delivery Partner
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
            .populate('restaurant', 'name image address cuisines location phone')
            .populate('deliveryPartner', 'name phone lastKnownLocation vehicleDetails')
            .populate('user', 'name phone email addresses')
            .lean();
        
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // You can attach any other metadata needed for the frontend view here
        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error fetching order details' });
    }
};

// Get customer profile
exports.getProfile = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).select('-password').lean();
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
        const { street, city, zip, type, location } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let addressLocation = location;

        // If no location provided, geocode the address
        if (!addressLocation?.lat || !addressLocation?.lng) {
            try {
                const addressQuery = encodeURIComponent(`${street}, ${city}, ${zip}`);
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${addressQuery}&format=json&limit=1`, {
                    headers: { 'User-Agent': 'Cravify-App/1.0' }
                });
                const geoData = await geoResponse.json();
                if (geoData && geoData.length > 0) {
                    addressLocation = {
                        lat: parseFloat(geoData[0].lat),
                        lng: parseFloat(geoData[0].lon)
                    };
                }
            } catch (geoErr) {
                console.error('Geocoding failed for address:', geoErr.message);
                // Continue without location — it's optional
            }
        }

        user.addresses.push({ street, city, zip, type: type || 'Home', location: addressLocation });
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
// Submit rating for an order (restaurant + delivery partner)
exports.submitOrderRating = async (req, res) => {
    try {
        const { restaurantRating, deliveryRating, comment } = req.body;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, user: req.user.id });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'Delivered') {
            return res.status(400).json({ message: 'Can only rate delivered orders' });
        }

        if (order.restaurantRating || order.deliveryRating) {
            return res.status(400).json({ message: 'Order already rated' });
        }

        // Update Order
        order.restaurantRating = restaurantRating;
        order.deliveryRating = deliveryRating;
        order.ratingComment = comment;
        await order.save();

        // Update Restaurant Average Rating
        if (restaurantRating) {
            const restaurant = await Restaurant.findById(order.restaurant);
            if (restaurant) {
                const totalRating = (restaurant.rating * restaurant.numRatings) + restaurantRating;
                restaurant.numRatings += 1;
                restaurant.rating = Number((totalRating / restaurant.numRatings).toFixed(1));
                await restaurant.save();
            }
        }

        // Update Delivery Partner Average Rating
        if (deliveryRating && order.deliveryPartner) {
            const deliveryPartner = await User.findById(order.deliveryPartner);
            if (deliveryPartner) {
                const totalRating = (deliveryPartner.deliveryRating * deliveryPartner.numDeliveryRatings) + deliveryRating;
                deliveryPartner.numDeliveryRatings += 1;
                deliveryPartner.deliveryRating = Number((totalRating / deliveryPartner.numDeliveryRatings).toFixed(1));
                await deliveryPartner.save();
            }
        }

        res.json({ message: 'Rating submitted successfully', order });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error submitting rating' });
    }
};
