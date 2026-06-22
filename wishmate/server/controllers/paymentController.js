const Payment = require('../models/Payment');

const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WM-${timestamp}-${random}`;
};

// @desc    Create a demo payment
// @route   POST /api/payments/demo
// @access  Private
const createDemoPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const validMethods = ['UPI', 'Card', 'Net Banking', 'COD'];

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
    }

    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Please select a valid payment method' });
    }

    const orderId = generateOrderId();

    const payment = await Payment.create({
      user: req.user._id,
      orderId,
      amount,
      paymentMethod,
      status: 'Demo Paid'
    });

    res.status(201).json({
      success: true,
      message: 'Payment Successful – Demo Only. No money was deducted.',
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error processing demo payment', error: error.message });
  }
};

// @desc    Get all payments for logged in user (or all if admin)
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    let payments;
    if (req.user.role === 'admin') {
      payments = await Payment.find().sort({ createdAt: -1 });
    } else {
      payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching payments', error: error.message });
  }
};

module.exports = { createDemoPayment, getPayments };
