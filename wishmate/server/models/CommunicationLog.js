const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder',
      default: null
    },
    communicationType: {
      type: String,
      enum: ['SMS Demo', 'WhatsApp Demo', 'Call Demo'],
      required: [true, 'Communication type is required']
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Demo Queued', 'Demo Sent', 'Demo Completed'],
      default: 'Demo Queued'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
