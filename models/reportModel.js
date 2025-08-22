const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'GBP',
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  stripePaymentId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'requires_action'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Report', reportSchema);