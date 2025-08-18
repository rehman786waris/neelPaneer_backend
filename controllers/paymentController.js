const PaymentReport = require('../models/reportModel');
const User = require('../models/userModel');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------- CREATE PAYMENT ----------------------
exports.createPayment = async (req, res) => {
  try {
    const { userId, orderId, amount, currency = 'GBP', paymentMethodId, description } = req.body;
    if (!userId || !amount || !orderId) {
      return res.status(400).json({ error: 'userId, orderId and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.stripeCustomerId) {
      if (!paymentMethodId) return res.status(400).json({ error: 'Payment method ID required' });

      const customer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      user.stripeCustomerId = customer.id;
      user.stripePaymentMethodId = paymentMethodId;
      await user.save();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method: user.stripePaymentMethodId,
      off_session: true,
      confirm: true,
    });

    const report = new PaymentReport({
      userId,
      orderId,
      amount,
      currency,
      paymentMethod: 'card',
      transactionId: paymentIntent.id,
      stripePaymentId: paymentIntent.id,
      status: paymentIntent.status,
      description: description || `Payment for order ${orderId}`,
    });

    await report.save();
    res.status(201).json({ success: true, paymentIntent, report });
  } catch (err) {
    console.error(err);
    if (err.code === 'authentication_required') {
      return res.status(402).json({ error: 'Authentication required', stripeError: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- GET ALL PAYMENTS ----------------------
exports.getAllReports = async (req, res) => {
  try {
    const reports = await PaymentReport.find().populate('userId').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- GET SINGLE PAYMENT ----------------------
exports.getReportById = async (req, res) => {
  try {
    const report = await PaymentReport.findById(req.params.id).populate('userId');
    if (!report) return res.status(404).json({ error: 'Payment report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- UPDATE PAYMENT ----------------------
exports.updateReport = async (req, res) => {
  try {
    const updatedReport = await PaymentReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedReport) return res.status(404).json({ error: 'Payment report not found' });
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------------- DELETE PAYMENT ----------------------
exports.deleteReport = async (req, res) => {
  try {
    const deletedReport = await PaymentReport.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ error: 'Payment report not found' });
    res.json({ message: 'Payment report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
