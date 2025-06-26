const jwt = require('jsonwebtoken');
const Favourite = require('../models/favouriteModel');
const Product = require('../models/productModel');

/// Add to Favourites
exports.addFavourite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Check if already favourited
    const existing = await Favourite.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in favourites' });
    }

    const favourite = new Favourite({ userId, productId });
    await favourite.save();

    res.status(201).json({ success: true, message: 'Added to favourites', favourite });
  } catch (error) {
    console.error('Add Favourite Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/// Remove from Favourites
exports.removeFavourite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    await Favourite.findOneAndDelete({ userId, productId });
    res.status(200).json({ success: true, message: 'Removed from favourites' });
  } catch (error) {
    console.error('Remove Favourite Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/// Get All Favourites
exports.getFavourites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favourites = await Favourite.find({ userId }).populate('productId');
    const products = favourites.map(fav => fav.productId);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Get Favourites Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
