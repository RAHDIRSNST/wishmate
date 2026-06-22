const GiftRequest = require('../models/GiftRequest');

// @desc    Get all gift requests for logged in user (or all if admin)
// @route   GET /api/gifts
// @access  Private
const getGifts = async (req, res) => {
  try {
    let gifts;
    if (req.user.role === 'admin') {
      gifts = await GiftRequest.find().sort({ createdAt: -1 });
    } else {
      gifts = await GiftRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, count: gifts.length, gifts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching gift requests', error: error.message });
  }
};

// @desc    Create new gift request
// @route   POST /api/gifts
// @access  Private
const createGift = async (req, res) => {
  try {
    const {
      customerName, recipientName, occasion, occasionDate,
      budget, giftCategory, deliveryAddress, phoneNumber, notes
    } = req.body;

    if (!customerName || !recipientName || !occasion || !occasionDate || !budget || !giftCategory || !deliveryAddress || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const gift = await GiftRequest.create({
      user: req.user._id,
      customerName,
      recipientName,
      occasion,
      occasionDate,
      budget,
      giftCategory,
      deliveryAddress,
      phoneNumber,
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Gift help request submitted successfully', gift });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating gift request', error: error.message });
  }
};

// @desc    Update gift request status (admin only)
// @route   PUT /api/gifts/:id/status
// @access  Private/Admin
const updateGiftStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Contacted', 'Ordered', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    const gift = await GiftRequest.findById(req.params.id);

    if (!gift) {
      return res.status(404).json({ success: false, message: 'Gift request not found' });
    }

    gift.status = status;
    await gift.save();

    res.status(200).json({ success: true, message: 'Gift request status updated', gift });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating gift status', error: error.message });
  }
};

module.exports = { getGifts, createGift, updateGiftStatus };
