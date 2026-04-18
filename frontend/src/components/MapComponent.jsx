import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
            const validPoints = points.filter(p => p && p.lat && p.lng);
            if (validPoints.length > 0) {
                const bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [points, map]);
    return null;
};

const MapComponent = ({ riderLocation, restaurantLocation, customerLocation }) => {
    const center = restaurantLocation || { lat: 23.0225, lng: 72.5714 }; // Default to Ahmedabad

    const points = [
        riderLocation,
        restaurantLocation,
        customerLocation
    ].filter(Boolean);

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
            
            {restaurantLocation && (
                <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}>
                    <Popup>Restaurant</Popup>
                </Marker>
            )}

            {customerLocation && (
                <Marker position={[customerLocation.lat, customerLocation.lng]} icon={homeIcon}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}

            {riderLocation && (
                <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
                    <Popup>Delivery Partner (Live)</Popup>
                </Marker>
            )}

            <RecenterMap points={points} />
        </MapContainer>
    );
};

export default MapComponent;
