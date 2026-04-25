const axios = require('axios');

// In-memory cache for OSRM routes
const routeCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 1000;

// Periodic cleanup of expired entries
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of routeCache) {
        if (now - value.timestamp >= CACHE_TTL) {
            routeCache.delete(key);
        }
    }
}, CACHE_TTL);

exports.getRoute = async (req, res) => {
    try {
        const { startLat, startLng, endLat, endLng } = req.query;

        // Validation
        if (!startLat || !startLng || !endLat || !endLng) {
            return res.status(400).json({ success: false, message: 'Start and end coordinates are required.' });
        }

        const sLat = parseFloat(startLat);
        const sLng = parseFloat(startLng);
        const eLat = parseFloat(endLat);
        const eLng = parseFloat(endLng);

        if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
             return res.status(400).json({ success: false, message: 'Coordinates must be valid numbers.' });
        }

        const samePoint = sLat === eLat && sLng === eLng;
        if (samePoint) {
            return res.status(400).json({ success: false, message: 'Start and end coordinates cannot be the same.' });
        }


        // Create a rounded key to increase cache hits for very close locations
        // E.g., keeping only 4 decimal places (~11 meters precision)
        const roundCoord = (c) => c.toFixed(4);
        const cacheKey = `${roundCoord(sLat)},${roundCoord(sLng)}_${roundCoord(eLat)},${roundCoord(eLng)}`;

        // Check cache
        if (routeCache.has(cacheKey)) {
            const cachedData = routeCache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < CACHE_TTL) {
                // Update access order for LRU eviction
                routeCache.delete(cacheKey);
                routeCache.set(cacheKey, cachedData);
                return res.json({ success: true, coordinates: cachedData.coordinates, cached: true });
            } else {
                routeCache.delete(cacheKey);
            }
        }

        // Ensure we don't spam OSRM public API - fetch route from OSRM
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson&steps=false`;
        
        try {
            const response = await axios.get(osrmUrl, { timeout: 5000 });
            if (response.data && response.data.routes && response.data.routes.length > 0) {
                // Ensure correct ordering: Leaflet expects [lat, lng]
                const coordinates = response.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                
                // Enforce max cache size (LRU eviction)
                if (routeCache.size >= MAX_CACHE_SIZE) {
                    const oldestKey = routeCache.keys().next().value;
                    routeCache.delete(oldestKey);
                }

                // Save to cache
                routeCache.set(cacheKey, {
                    timestamp: Date.now(),
                    coordinates
                });

                return res.json({ success: true, coordinates });
            } else {
                 return res.status(404).json({ success: false, message: 'No route found by OSRM.' });
            }
        } catch (osrmErr) {
            console.error('OSRM API Error:', osrmErr.message);
            // We return 502 to indicate upstream failure, frontend can fallback to polyline
            return res.status(502).json({ success: false, message: 'Failed to fetch route from OSRM.' });
        }
    } catch (err) {
        console.error('getRoute Error:', err);
        // res.status(500).json({ success: false, message: 'Server error fetching route' });
        return res.status(500).json({
            success: false,
            message: 'Server error fetching route',
            coordinates: []
        });
    }
};
