const Banner = require('../models/bannerModel');
const uploadImage = require('../utils/uploadImage');

// CREATE
exports.createBanner = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    const imageUrls = await uploadImage.uploadMultipleImagesToFirebase(files);

    const newBanner = new Banner({
      bannerImages: imageUrls,
    });

    await newBanner.save();
    res.status(201).json({ success: true, banner: newBanner });
  } catch (err) {
    console.error("Create Banner Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// READ ALL
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (err) {
    console.error("Fetch Banners Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// READ ONE
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    res.status(200).json({ success: true, banner });
  } catch (err) {
    console.error("Get Banner Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE
exports.updateBanner = async (req, res) => {
  try {
    const files = req.files;
    let updatedFields = {};

    if (files && files.length > 0) {
      const imageUrls = await uploadImage.uploadMultipleImagesToFirebase(files);
      updatedFields.bannerImages = imageUrls;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ success: true, banner: updatedBanner });
  } catch (err) {
    console.error("Update Banner Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE
exports.deleteBanner = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Banner not found" });

    res.status(200).json({ success: true, message: "Banner deleted" });
  } catch (err) {
    console.error("Delete Banner Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
