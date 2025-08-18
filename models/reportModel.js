const mongoose = require('mongoose');

const paymentReportSchema = new mongoose.Schema({
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
    default: 'GBP'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  stripePaymentId: { // <--- NEW
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentReport', paymentReportSchema);
