const User = require('../models/userModel');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------- CREATE IMMEDIATE CARD PAYMENT ----------------------
exports.createPayment = async (req, res) => {
  try {
    const {
      userId,
      amount,
      currency = "GBP",
      paymentMethodId,
      description,
    } = req.body;

    // Validate input
    if (!userId || !amount || !paymentMethodId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If no Stripe customer exists, create one
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // 🔑 Attach payment method to customer (so it can be reused)
    if (paymentMethodId) {
      try {
        // Attach card to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: user.stripeCustomerId,
        });

        // Optionally set this as the default card
        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      } catch (err) {
        // Ignore if already attached
        if (err.code !== "resource_already_exists") {
          throw err;
        }
      }
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects cents
      currency,
      customer: user.stripeCustomerId,
      payment_method: paymentMethodId || undefined,
      return_url:'http://16.171.176.59:3000/api/auth',
      confirm: true,
      off_session: false,
      description,
    });

    res.status(201).json({ success: true, paymentIntent });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: error.message });
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

// ---------------------- LIST SAVED CARDS ----------------------
exports.listSavedCards = async (req, res) => {
  try {
    const { id } = req.params;  // ✅ get userId from URL
    if (!id) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await User.findById(id);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'User or Stripe customer not found' });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const cards = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      funding: pm.card.funding,
    }));

    res.status(200).json({ success: true, cards });
  } catch (err) {
    console.error('❌ listSavedCards error:', err);
    res.status(500).json({ error: err.message, code: err.code });
  }
};
