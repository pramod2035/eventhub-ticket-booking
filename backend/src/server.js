const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// Import Routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.send('EventHub API is running and ready to accept requests...');
});

const PORT = process.env.PORT || 5000;

// Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully!');
    app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1); // Stop the server if the DB fails to connect
  });