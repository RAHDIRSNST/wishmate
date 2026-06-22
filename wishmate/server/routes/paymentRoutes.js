const express = require('express');
const router = express.Router();
const { createDemoPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/demo', createDemoPayment);
router.get('/', getPayments);

module.exports = router;
