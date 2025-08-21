const PaymentReport = require('../models/reportModel');
const User = require('../models/userModel');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------- CREATE IMMEDIATE CARD PAYMENT ----------------------
exports.createPayment = async (req, res) => {
  try {
    const { userId, amount, currency = 'GBP', paymentMethodId, description } = req.body;

    if (!userId || !amount || !paymentMethodId) {
      return res.status(400).json({ error: 'userId, amount, and paymentMethodId are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create Stripe customer if not exists
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: false,
    });

    // Save report
    const report = new PaymentReport({
      userId,
      amount,
      currency,
      paymentMethod: 'card',
      transactionId: paymentIntent.id,
      stripePaymentId: paymentIntent.id,
      status: paymentIntent.status,
      description: description || 'Card payment',
    });
    await report.save();

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      requiresAction: paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action',
      report,
    });

  } catch (err) {
    console.error('❌ createPayment error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- CREATE SETUP INTENT (SAVE CARD) ----------------------
exports.createSetupIntent = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create Stripe customer if not exists
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('❌ createSetupIntent error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- CHARGE SAVED CARD ----------------------
exports.chargeSavedCard = async (req, res) => {
  try {
    const { userId, amount, currency = 'GBP', paymentMethodId, description } = req.body;

    if (!userId || !paymentMethodId || !amount) {
      return res.status(400).json({ error: 'userId, paymentMethodId, and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) return res.status(404).json({ error: 'User or Stripe customer not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    });

    const report = new PaymentReport({
      userId,
      amount,
      currency,
      paymentMethod: 'card_saved',
      transactionId: paymentIntent.id,
      stripePaymentId: paymentIntent.id,
      status: paymentIntent.status,
      description: description || 'Saved card payment',
    });
    await report.save();

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      report,
    });

  } catch (err) {
    console.error('❌ chargeSavedCard error:', err);

    // Handle authentication required
    if (err.code === 'authentication_required') {
      return res.status(402).json({ error: 'Authentication required', stripeError: err.message });
    }

    res.status(500).json({ error: err.message });
  }
};

// ---------------------- GET ALL REPORTS ----------------------
exports.getAllReports = async (req, res) => {
  try {
    const reports = await PaymentReport.find().populate('userId').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- GET REPORT BY ID ----------------------
exports.getReportById = async (req, res) => {
  try {
    const report = await PaymentReport.findById(req.params.id).populate('userId');
    if (!report) return res.status(404).json({ error: 'Payment report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- UPDATE REPORT ----------------------
exports.updateReport = async (req, res) => {
  try {
    const updatedReport = await PaymentReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedReport) return res.status(404).json({ error: 'Payment report not found' });
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------------- DELETE REPORT ----------------------
exports.deleteReport = async (req, res) => {
  try {
    const deletedReport = await PaymentReport.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ error: 'Payment report not found' });
    res.json({ message: 'Payment report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
