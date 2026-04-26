const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });
const Restaurant = require('../backend/models/Restaurant');

const sampleLocations = [
    { lat: 23.0338, lng: 72.5467 }, // IIM Area
    { lat: 23.0401, lng: 72.5321 }, // Vastrapur
    { lat: 23.0063, lng: 72.5996 }, // Kankaria
    { lat: 23.0248, lng: 72.5707 }, // Riverfront
    { lat: 23.0305, lng: 72.5074 }, // Prahlad Nagar
    { lat: 23.0646, lng: 72.5293 },  // Science City
    
];

async function updateRestaurantLocations() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for data update...');

        const restaurants = await Restaurant.find();
        for (let i = 0; i < restaurants.length; i++) {
            const loco = sampleLocations[i % sampleLocations.length];
            restaurants[i].location = loco;
            await restaurants[i].save();
            console.log(`Updated ${restaurants[i].name} with coords: ${loco.lat}, ${loco.lng}`);
        }

        console.log('Finished updating restaurant locations.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
}

updateRestaurantLocations();
