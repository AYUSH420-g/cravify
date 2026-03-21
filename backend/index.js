const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/', (req, res) => {
    res.send('Cravify API is running');
});

// Database Connection
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, clientOptions);
        console.log('MongoDB Connected');
    } catch (err) {
        console.log('MongoDB Connection Error:', err);
        // Exit process with failure
        process.exit(1);
    }
}

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
