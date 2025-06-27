const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    vendor: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: { type: String }
});

const deliveryAddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    subTotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    voucherCode: { type: String, default: null },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Credit Card', 'Wallet'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'delivered'],
        default: 'pending'
    },
    timestamp: { type: Date, default: Date.now },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    notes: { type: String }
});

module.exports = mongoose.model('Order', orderSchema);
