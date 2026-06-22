const User = require('../models/User');
const Reminder = require('../models/Reminder');
const GiftRequest = require('../models/GiftRequest');
const Payment = require('../models/Payment');
const CommunicationLog = require('../models/CommunicationLog');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalReminders = await Reminder.countDocuments();
    const totalGiftRequests = await GiftRequest.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalCommunications = await CommunicationLog.countDocuments();

    const newGiftLeads = await GiftRequest.countDocuments({ status: 'New' });

    const totalRevenueAgg = await Payment.aggregate([
      { $match: { status: 'Demo Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalReminders,
        totalGiftRequests,
        totalPayments,
        totalCommunications,
        newGiftLeads,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users', error: error.message });
  }
};

// @desc    Get all reminders
// @route   GET /api/admin/reminders
// @access  Private/Admin
const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching reminders', error: error.message });
  }
};

// @desc    Get all gift requests
// @route   GET /api/admin/gifts
// @access  Private/Admin
const getAllGifts = async (req, res) => {
  try {
    const gifts = await GiftRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: gifts.length, gifts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching gift requests', error: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching payments', error: error.message });
  }
};

// @desc    Get all communication logs
// @route   GET /api/admin/communications
// @access  Private/Admin
const getAllCommunications = async (req, res) => {
  try {
    const communications = await CommunicationLog.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: communications.length, communications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching communication logs', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllReminders,
  getAllGifts,
  getAllPayments,
  getAllCommunications
};
