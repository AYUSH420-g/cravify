/**
 * Indian Pincode validation and distance estimation utility.
 * Uses the free Postal PIN Code API (api.postalpincode.in) to validate pincodes
 * and estimate distances between two pincodes using district/state centroid approximation.
 */

// In-memory cache for pincode lookups (reduces external API calls)
const pincodeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validate an Indian pincode and return its details.
 * @param {string} pincode - 6-digit Indian pincode
 * @returns {Object|null} { pincode, district, state, lat, lng } or null if invalid
 */
async function validatePincode(pincode) {
    if (!pincode || !/^\d{6}$/.test(pincode.toString().trim())) {
        return null;
    }

    const pin = pincode.toString().trim();

    // Check cache first
    if (pincodeCache.has(pin)) {
        const cached = pincodeCache.get(pin);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }
        pincodeCache.delete(pin);
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
            headers: { 'User-Agent': 'Cravify-App/1.0' },
            signal: AbortSignal.timeout(5000)
        });
        const data = await response.json();

        if (!data || !data[0] || data[0].Status !== 'Success' || !data[0].PostOffice?.length) {
            return null;
        }

        const po = data[0].PostOffice[0];
        const result = {
            pincode: pin,
            district: po.District || '',
            state: po.State || '',
            region: po.Region || '',
            country: po.Country || 'India',
            // Some post offices don't have coordinates; we'll geocode separately if needed
        };

        // Try to get lat/lng via Nominatim geocoding using the pincode
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&limit=1`,
                { headers: { 'User-Agent': 'Cravify-App/1.0' }, signal: AbortSignal.timeout(5000) }
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
                result.lat = parseFloat(geoData[0].lat);
                result.lng = parseFloat(geoData[0].lon);
            }
        } catch (geoErr) {
            console.error('Pincode geocoding failed:', geoErr.message);
        }

        // Cache the result
        pincodeCache.set(pin, { data: result, timestamp: Date.now() });
        return result;
    } catch (err) {
        console.error('Pincode validation API error:', err.message);
        return null;
    }
}

/**
 * Calculate approximate distance between two coordinates using Haversine formula.
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calculate ACTUAL road distance between two points using OSRM.
 * Falls back to haversine if API fails.
 */
async function getRoadDistance(lat1, lng1, lat2, lng2) {
    try {
        const response = await fetch(
            `http://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`,
            { signal: AbortSignal.timeout(3000) }
        );
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes[0]) {
            // distance is in meters, convert to km
            return Number((data.routes[0].distance / 1000).toFixed(1));
        }
        
        // Fallback to haversine if OSRM is down
        return Number(haversineDistance(lat1, lng1, lat2, lng2).toFixed(1));
    } catch (err) {
        console.warn('OSRM distance calculation failed, using haversine fallback:', err.message);
        return Number(haversineDistance(lat1, lng1, lat2, lng2).toFixed(1));
    }
}

/**
 * Calculate delivery fee based on distance and order value.
 * Minimum ₹25, maximum ₹120. Free delivery for orders above ₹500.
 */
function calculateDeliveryFee(distanceKm, orderValue) {
    if (orderValue >= 500) return 0;

    // Standard distance-based pricing for customer
    let fee = 25;
    if (distanceKm > 3) {
        fee += Math.ceil(distanceKm - 3) * 10;
    }
    return Math.max(25, Math.min(150, fee));
}

/**
 * Calculate delivery partner earnings based on distance.
 * 0–3 km = ₹25
 * 3–6 km = ₹40
 * 6+ km = ₹40 + ₹7 per extra km
 */
function calculateDeliveryEarning(distanceKm, orderValue) {
    let earning = 25;
    if (distanceKm <= 3) {
        earning = 25;
    } else if (distanceKm <= 6) {
        earning = 40;
    } else {
        earning = 40 + Math.ceil(distanceKm - 6) * 7;
    }

    // Add 1% of order value as a small bonus if > 0
    if (orderValue > 0) {
        earning += Math.round(orderValue * 0.01);
    }

    return Math.max(25, Math.min(250, earning));
}

module.exports = {
    validatePincode,
    haversineDistance,
    getRoadDistance,
    calculateDeliveryFee,
    calculateDeliveryEarning
};
