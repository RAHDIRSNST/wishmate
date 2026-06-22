const mongoose = require('mongoose');

const giftRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    occasion: {
      type: String,
      required: [true, 'Occasion is required'],
      trim: true
    },
    occasionDate: {
      type: Date,
      required: [true, 'Occasion date is required']
    },
    budget: {
      type: String,
      enum: ['₹300–₹500', '₹500–₹1,000', '₹1,000–₹2,000', '₹2,000+'],
      required: [true, 'Budget is required']
    },
    giftCategory: {
      type: String,
      enum: ['Cake', 'Flowers', 'Chocolates', 'Personalised Gifts', 'Jewellery'],
      required: [true, 'Gift category is required']
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Ordered', 'Closed'],
      default: 'New'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GiftRequest', giftRequestSchema);
