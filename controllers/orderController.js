const Order = require('../models/orderModel');

// Create a new order
exports.createOrder = async (req, res) => {
  const { paymentMethod } = req.body;
  const validMethods = ['cash', 'card'];

  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method. Choose Cash or Card.' });
  }

  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
///updateOrderStatus
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled', 'completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const { status, paymentMethod, deliveryAddress, notes } = req.body;

  // Optional: Validate values
  const validStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled','completed'];
  const validMethods = ['cash', 'card'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  if (paymentMethod && !validMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  const updateFields = {};
  if (status) updateFields.status = status;
  if (paymentMethod) updateFields.paymentMethod = paymentMethod;
  if (deliveryAddress) updateFields.deliveryAddress = deliveryAddress;
  if (notes) updateFields.notes = notes;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
