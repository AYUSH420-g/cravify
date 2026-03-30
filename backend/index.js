const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/delivery', require('./routes/delivery.routes'));
app.use('/api/customer', require('./routes/customer.routes'));
app.use('/api/vendor', require('./routes/vendor.routes'));

app.get('/', (req, res) => {
    res.send('Cravify API is running');
});

// Database Connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.log('MongoDB Connection Error:', err.message);
        // Don't exit — allow nodemon to retry on file change
        console.log('Tip: Make sure MongoDB is running (local) or Atlas URI is correct (.env)');
    }
}

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
