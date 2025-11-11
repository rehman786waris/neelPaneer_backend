const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      trim: true,
      required: [true, 'Product name is required'],
    },
    productCategory: {
      type: String,
      required: [true, 'Product category is required'],
      enum: [
        'all',
        'chefsSpecials',
        'britishCurries',
        'europeanDishes',
        'sundries',
        'sides',
        'accompaniments',
        'nonVegetarian',
        'mixedVegStarters',
        'fishStarters',
        'tandooriSizzlers',
        'biryaniDishes',
        'spinachDishes',
        'massalaDishes',
        'baltiTawa',
        'vegetarianSnacks',
        'meatSnacks',
        'seafoodSnacks',
        'tandooriBread',
        'kids',
        'setMeals',
        'softDrinks',
        'beers',
        'wine',
      ],
      default: 'all',
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Product description is required'],
    },
    ageRestriction: {
      type: Boolean,
      default: false,
    },
    outOfStock: {
      type: Boolean,
      default: false,
    },
    productImage: {
      type: String,
      required: [true, 'Product image is required'],
    },
    timeTag: {
      type: String,
      enum: ['brunch', 'evening'],
      default: 'brunch',
    },
    // ✅ Optional sauces
    sauces: {
      type: [
        {
          name: {
            type: String,
            trim: true,
            required: [true, 'Sauce name is required'],
          },
          price: {
            type: Number,
            min: [0, 'Sauce price must be a positive number'],
          },
        },
      ],
      default: undefined, // Optional
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
