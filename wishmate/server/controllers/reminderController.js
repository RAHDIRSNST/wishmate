const Reminder = require('../models/Reminder');

// @desc    Get all reminders for logged in user
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ date: 1 });
    res.status(200).json({ success: true, count: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching reminders', error: error.message });
  }
};

// @desc    Create new reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const {
      personName, relationship, occasion, customOccasion,
      date, time, reminderBefore, reminderMethods, giftHelp, notes
    } = req.body;

    if (!personName || !relationship || !occasion || !date) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    if (occasion === 'Custom' && !customOccasion) {
      return res.status(400).json({ success: false, message: 'Please specify custom occasion name' });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      personName,
      relationship,
      occasion,
      customOccasion: customOccasion || '',
      date,
      time: time || '09:00',
      reminderBefore: reminderBefore || 'Same Day',
      reminderMethods: reminderMethods && reminderMethods.length > 0 ? reminderMethods : ['App'],
      giftHelp: giftHelp || false,
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Reminder added successfully', reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating reminder', error: error.message });
  }
};

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
const getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this reminder' });
    }

    res.status(200).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching reminder', error: error.message });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this reminder' });
    }

    reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, message: 'Reminder updated successfully', reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating reminder', error: error.message });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reminder' });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting reminder', error: error.message });
  }
};

module.exports = {
  getReminders,
  createReminder,
  getReminderById,
  updateReminder,
  deleteReminder
};
