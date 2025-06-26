const fs = require("fs");
const { admin } = require("../firebase/firebaseAdmin");
const { signupSchema } = require("../middlewares/validator");
const User = require("../models/userModel");
const uploadImage = require('../utils/uploadImage');

/// Signup function
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, idToken, address } = req.body;
    console.log("Received Data:", req.body);
    console.log("Received File:", req.file);

    if (!fullName || !email || !phoneNumber || !idToken || !address) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const { error } = signupSchema.validate({ fullName, email, phoneNumber, address });
    if (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // 🔐 Firebase ID token verification
    const decoded = await admin.auth().verifyIdToken(idToken);

    // ✅ Extract Firebase UID
    const firebaseUid = decoded.uid;

    if (decoded.phone_number !== phoneNumber) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(401).json({ success: false, message: "Phone number mismatch!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }, { firebaseUid }] });
    if (existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ success: false, message: "User already exists!" });
    }

    // Upload profile image to Firebase Storage
    let profileImage = null;
    if (req.file) {
      profileImage = await uploadImage.uploadImageToFirebase(req.file);
      fs.unlinkSync(req.file.path); // remove local file after upload
    }

    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      address,
      profileImage,
      isPhoneVerified: true,
      firebaseUid, // ✅ Save UID from Firebase
    });

    const result = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      result
    });

  } catch (error) {
    console.error("Signup Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/// Login with Firebase Phone Number
exports.login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "idToken is required!" });
    }

    // 🔐 Verify ID token with Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Invalid token: phone number not found." });
    }

    // 🔎 Check if user exists in MongoDB
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first."
      });
    }

    // ✅ Success
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};


/// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      total: users.length,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if ID is valid ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if ID is valid
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

/// Update user by ID
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, email, address } = req.body;

    // Validate ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle profile image upload
    let profileImage = user.profileImage;
    if (req.file) {
      profileImage = await uploadImage.uploadImageToFirebase(req.file);
      fs.unlinkSync(req.file.path);
    }

    // Update fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.address = address || user.address;
    user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

