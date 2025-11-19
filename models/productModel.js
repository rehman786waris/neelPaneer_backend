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

    // 🔥 IMAGE IS NOW OPTIONAL
    productImage: {
      type: String,
      default: null,
    },

    timeTag: {
      type: String,
      enum: ['brunch', 'evening'],
      default: 'brunch',
    },

    // Optional sauces
    sauces: {
      type: [
        {
          name: { type: String, trim: true, required: true },
          price: { type: Number, min: 0 },
        },
      ],
      default: undefined,
    },
  },
  { timestamps: true }
);

// Capitalize product name
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
