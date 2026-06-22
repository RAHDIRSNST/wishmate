const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllReminders,
  getAllGifts,
  getAllPayments,
  getAllCommunications
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/reminders', getAllReminders);
router.get('/gifts', getAllGifts);
router.get('/payments', getAllPayments);
router.get('/communications', getAllCommunications);

module.exports = router;
