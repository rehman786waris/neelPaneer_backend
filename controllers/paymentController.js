const User = require('../models/userModel');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------- CREATE IMMEDIATE CARD PAYMENT ----------------------
exports.createPayment = async (req, res) => {
  try {
    // Ensure paymentMethodId is available from the request body
    const { userId, amount, description, currency = 'GBP', paymentMethodId } = req.body;

    if (!userId || !amount || !description || !currency || !paymentMethodId) {
      return res.status(400).json({ error: 'userId, amount, currency, description, and paymentMethodId are required' });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive integer in smallest currency unit' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create Stripe customer if not exists
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({ email: user.email });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Pass the paymentMethodId to the PaymentIntent at creation
    // This allows immediate confirmation without relying on automatic methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      description,
      payment_method: paymentMethodId,
      return_url:'http://16.171.176.59:3000/api/auth',
      confirm: true,
      off_session: false,
    });

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (err) {
    console.error('❌ createPayment error:', err);
    res.status(500).json({ error: err.message, code: err.code });
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
      usage: 'off_session', // ensures future charges work
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error('❌ createSetupIntent error:', err);
    res.status(500).json({ error: err.message, code: err.code });
  }
};

// ---------------------- CHARGE SAVED CARD ----------------------
exports.chargeSavedCard = async (req, res) => {
  try {
    const { userId, amount, currency = 'GBP', paymentMethodId, description } = req.body;

    if (!userId || !paymentMethodId || !amount) {
      return res.status(400).json({ error: 'userId, paymentMethodId, and amount are required' });
    }

    if (!Number.isInteger(amount)) {
      return res.status(400).json({ error: 'Amount must be in smallest currency unit (e.g., cents/pence)' });
    }

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'User or Stripe customer not found' });
    }

    // Pass the paymentMethodId to the PaymentIntent at creation
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId, // This is also a key change
      confirm: true,
      off_session: true,
      description: description || 'Saved card payment',
    });

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });

  } catch (err) {
    console.error('❌ chargeSavedCard error:', err);

    // Handle 3D Secure authentication required
    if (err.code === 'authentication_required') {
      return res.status(402).json({
        error: 'Authentication required',
        stripeError: err.message,
        paymentIntentClientSecret: err.payment_intent?.client_secret,
      });
    }

    res.status(500).json({ error: err.message, code: err.code });
  }
};
