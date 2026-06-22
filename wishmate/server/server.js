require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const giftRoutes = require('./routes/giftRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WishMate API is running — Never Miss a Special Moment'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/demo', communicationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`WishMate server running on port ${PORT}`);
});
