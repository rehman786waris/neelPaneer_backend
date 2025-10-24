const Favourite = require('../models/favouriteModel');

// ✅ Add to favourites
exports.addFavourite = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
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

// ✅ Remove from favourites
exports.removeFavourite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const removed = await Favourite.findOneAndDelete({ userId, productId });
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Favourite not found' });
    }

    res.status(200).json({ success: true, message: 'Removed from favourites' });
  } catch (error) {
    console.error('Remove Favourite Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get all favourites by user
exports.getFavouritesByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const favourites = await Favourite.find({ userId }).populate('productId');
    const products = favourites.map(fav => fav.productId);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Get Favourites by User Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
