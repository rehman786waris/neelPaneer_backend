const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Booking = require('../models/bookingModel');

exports.getSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Total products
    const totalProducts = await Product.countDocuments();

    // Total revenue today
    const todayOrders = await Order.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'preparing', 'delivered'] }
    });
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Total active orders
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });

    // Total bookings today
    const bookingsToday = await Booking.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalRevenue,
        activeOrders,
        bookingsToday
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
