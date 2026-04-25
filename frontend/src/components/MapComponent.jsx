import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet + Vite/Webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for better visual distinction
const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const restaurantIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35]
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// Component to handle map centering and bounds
const RecenterMap = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const validPoints = points.filter(
                p => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)
            );
            if (validPoints.length > 0) {
                const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [points, map]);
    return null;
};

const MapComponent = ({ riderLocation, restaurantLocation, customerLocation }) => {
    // Calculate dynamic center from available points instead of hardcoded Ahmedabad
    const getCenter = () => {
        const available = [riderLocation, restaurantLocation, customerLocation].filter(
            p => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)
        );
        if (available.length > 0) {
            const avgLat = available.reduce((sum, p) => sum + p.lat, 0) / available.length;
            const avgLng = available.reduce((sum, p) => sum + p.lng, 0) / available.length;
            return { lat: avgLat, lng: avgLng };
        }
        // Only use Ahmedabad as absolute last resort
        return { lat: 23.0225, lng: 72.5714 };
    };
    const center = getCenter();
    const [routePath, setRoutePath] = useState([]);

    const points = [
        riderLocation,
        restaurantLocation,
        customerLocation
    ].filter(p => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));

    const hasValidCoords = (point) =>
        point && Number.isFinite(point.lat) && Number.isFinite(point.lng);

    useEffect(() => {
        const fetchRoute = async () => {
            // Determine endpoints for the route: from Rider to Customer (if Rider exists), otherwise Restaurant to Customer
            const startPoint = (riderLocation && hasValidCoords(riderLocation)) ? riderLocation : restaurantLocation;
            const endPoint = customerLocation;

            if (!startPoint?.lat || !startPoint?.lng || !endPoint?.lat || !endPoint?.lng) {
                setRoutePath([]);
                return;
            }

            const samePoint = startPoint.lat === endPoint.lat && startPoint.lng === endPoint.lng;
            if (samePoint) {
                setRoutePath([]);
                return;
            }

            try {
                // Use the backend route API
                const url = `/api/route?startLat=${startPoint.lat}&startLng=${startPoint.lng}&endLat=${endPoint.lat}&endLng=${endPoint.lng}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`route failed API returned ${response.status}`);
                }
                const data = await response.json();

                if (data.success && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
                    setRoutePath(data.coordinates);
                } else {
                    // Fallback to straight-line polyline if OSRM via backend fails
                    setRoutePath([[startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]]);
                }
            } catch (err) {
                console.error('Failed to load route path', err);
                // Fallback to straight-line polyline on network error
                setRoutePath([[startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]]);
            }
        };

        fetchRoute();
    }, [restaurantLocation?.lat, restaurantLocation?.lng, customerLocation?.lat, customerLocation?.lng, riderLocation?.lat, riderLocation?.lng]);
    
    const routePoints = hasValidCoords(customerLocation)
        ? (hasValidCoords(riderLocation)
            ? [[riderLocation.lat, riderLocation.lng], [customerLocation.lat, customerLocation.lng]]
            : (hasValidCoords(restaurantLocation)
                ? [[restaurantLocation.lat, restaurantLocation.lng], [customerLocation.lat, customerLocation.lng]]
                : []))
        : [];

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hasValidCoords(restaurantLocation) && (
                <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}>
                    <Popup>Restaurant</Popup>
                </Marker>
            )}

            {hasValidCoords(customerLocation) && (
                <Marker position={[customerLocation.lat, customerLocation.lng]} icon={homeIcon}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}

            {hasValidCoords(riderLocation) && (
                <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
                    <Popup>Delivery Partner (Live)</Popup>
                </Marker>
            )}

            {routePath.length > 0 && (
                <Polyline positions={routePath} color="#ef4444" weight={4} opacity={0.8} />
            )}

            <RecenterMap points={points} />
        </MapContainer>
    );
};

export default MapComponent;
