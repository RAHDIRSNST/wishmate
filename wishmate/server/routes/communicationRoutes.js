const express = require('express');
const router = express.Router();
const {
  sendDemoSms,
  sendDemoWhatsapp,
  createDemoCallRequest
} = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send-sms', sendDemoSms);
router.post('/send-whatsapp', sendDemoWhatsapp);
router.post('/create-call-request', createDemoCallRequest);

module.exports = router;
