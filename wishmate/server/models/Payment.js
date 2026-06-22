const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Net Banking', 'COD'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['Demo Paid', 'Demo Pending', 'Demo Failed'],
      default: 'Demo Paid'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
