const express = require('express');
const router = express.Router();
const { getGifts, createGift, updateGiftStatus } = require('../controllers/giftController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.use(protect);

router.route('/')
  .get(getGifts)
  .post(createGift);

router.put('/:id/status', admin, updateGiftStatus);

module.exports = router;
