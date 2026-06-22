const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true
    },
    occasion: {
      type: String,
      enum: ['Birthday', 'Anniversary', 'Wedding Day', 'Festival', 'Custom'],
      required: [true, 'Occasion is required']
    },
    customOccasion: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    time: {
      type: String,
      default: '09:00'
    },
    reminderBefore: {
      type: String,
      enum: ['Same Day', '1 Day Before', '3 Days Before', '7 Days Before'],
      default: 'Same Day'
    },
    reminderMethods: {
      type: [String],
      enum: ['App', 'WhatsApp Demo', 'SMS Demo', 'Call Demo'],
      default: ['App']
    },
    giftHelp: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed'],
      default: 'Upcoming'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
