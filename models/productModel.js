const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
    },
    productCategory: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['all','starter', 'main course', 'dessert', 'beverage'], // updated
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
    },
    favourite: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    productImage: {
      type: String,
      required: [true, 'Product image is required'],
    },
    timeTag: {
      type: String,
      enum: ['breakfast','lunch', 'dinner'],
      default: 'breakfast',
    },
  },
  { timestamps: true }
);

// Capitalize product name before saving
productSchema.pre('save', function (next) {
  if (this.productName) {
    this.productName = this.productName
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
