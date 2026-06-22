const CommunicationLog = require('../models/CommunicationLog');

// @desc    Create demo SMS log
// @route   POST /api/demo/send-sms
// @access  Private
const sendDemoSms = async (req, res) => {
  try {
    const { reminderId, recipientName, message } = req.body;

    if (!recipientName) {
      return res.status(400).json({ success: false, message: 'Recipient name is required' });
    }

    const log = await CommunicationLog.create({
      user: req.user._id,
      reminder: reminderId || null,
      communicationType: 'SMS Demo',
      recipientName,
      message: message || `Wishing ${recipientName} a wonderful day!`,
      status: 'Demo Queued'
    });

    res.status(201).json({ success: true, message: 'Demo SMS queued successfully. No real SMS was sent.', log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error sending demo SMS', error: error.message });
  }
};

// @desc    Create demo WhatsApp log
// @route   POST /api/demo/send-whatsapp
// @access  Private
const sendDemoWhatsapp = async (req, res) => {
  try {
    const { reminderId, recipientName, message } = req.body;

    if (!recipientName) {
      return res.status(400).json({ success: false, message: 'Recipient name is required' });
    }

    const log = await CommunicationLog.create({
      user: req.user._id,
      reminder: reminderId || null,
      communicationType: 'WhatsApp Demo',
      recipientName,
      message: message || `Wishing ${recipientName} a wonderful day!`,
      status: 'Demo Queued'
    });

    res.status(201).json({ success: true, message: 'Demo WhatsApp message queued successfully. No real message was sent.', log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error sending demo WhatsApp message', error: error.message });
  }
};

// @desc    Create demo call request log
// @route   POST /api/demo/create-call-request
// @access  Private
const createDemoCallRequest = async (req, res) => {
  try {
    const { reminderId, recipientName, message } = req.body;

    if (!recipientName) {
      return res.status(400).json({ success: false, message: 'Recipient name is required' });
    }

    const log = await CommunicationLog.create({
      user: req.user._id,
      reminder: reminderId || null,
      communicationType: 'Call Demo',
      recipientName,
      message: message || `Demo call request for ${recipientName}`,
      status: 'Demo Queued'
    });

    res.status(201).json({ success: true, message: 'Demo call request queued successfully. No real call was made.', log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating demo call request', error: error.message });
  }
};

module.exports = { sendDemoSms, sendDemoWhatsapp, createDemoCallRequest };
