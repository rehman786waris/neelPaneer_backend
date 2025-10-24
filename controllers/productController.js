const Product = require('../models/productModel');
const uploadImage = require('../utils/uploadImage');
const Favourite = require('../models/favouriteModel'); // ensure this exists if used later

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const { productName, productCategory, price, description, timeTag } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const imageUrl = await uploadImage.uploadSingleImageToFirebase(req.file);

    const newProduct = new Product({
      productName,
      productCategory,
      price,
      description,
      timeTag,
      productImage: imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET ALL with filters
exports.getAllProducts = async (req, res) => {
  try {
    const userId = req.user?._id; // get from token (if logged in)
    const { productCategory, timeTag, search } = req.query;
    const filter = {};

    if (productCategory) filter.productCategory = productCategory;
    if (timeTag) filter.timeTag = timeTag;
    if (search) filter.productName = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // If logged in, get user's favourites
    let favourites = [];
    if (userId) {
      favourites = await Favourite.find({ userId }).select('productId');
    }

    const favSet = new Set(favourites.map(f => f.productId.toString()));

    const productsWithFav = products.map(p => ({
      ...p._doc,
      isFavourite: favSet.has(p._id.toString()),
    }));

    res.status(200).json({ success: true, products: productsWithFav });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET BY ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found!" });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("Get Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE
exports.updateProduct = async (req, res) => {
  try {
    const { productName, productCategory, price, description, timeTag } = req.body;
    const updateFields = { productName, productCategory, price, description, timeTag };

    if (req.file) {
      const imageUrl = await uploadImage.uploadSingleImageToFirebase(req.file);
      updateFields.productImage = imageUrl;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ success: true, product: updated });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
