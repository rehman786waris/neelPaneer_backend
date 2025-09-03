const fs = require("fs");
const { admin } = require("../firebase/firebaseAdmin");
const { signupSchema } = require("../middlewares/validator");
const User = require("../models/userModel");
const uploadImage = require('../utils/uploadImage');

/// Signup function
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, idToken, address, role } = req.body;
    console.log("Received Data:", req.body);
    console.log("Received File:", req.file);

    if (!fullName || !email || !idToken || !address || !role)  {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const { error } = signupSchema.validate({ fullName, email, phoneNumber, address, role });
    if (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // 🔐 Verify Firebase ID Token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;

    let isPhoneVerified = false;
    if (decoded.phone_number) {
      if (!phoneNumber || decoded.phone_number !== phoneNumber) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(401).json({ success: false, message: "Phone number mismatch!" });
      }
      isPhoneVerified = true;
    }

    // 🚫 Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        ...(phoneNumber ? [{ phoneNumber }] : []),
        { firebaseUid }
      ]
    });

    if (existingUser) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ success: false, message: "User already exists!" });
    }

    // ☁️ Upload profile image
    let profileImage = null;
    if (req.file) {
      profileImage = await uploadImage.uploadImageToFirebase(req.file);
      fs.unlinkSync(req.file.path);
    }

    const newUser = new User({
      fullName,
      email,
      phoneNumber: phoneNumber || null,
      address,
      profileImage,
      isPhoneVerified,
      firebaseUid,
      isActive: true,
      role,
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

    // 🔐 Decode Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    const email = decoded.email;

    if (!phoneNumber && !email) {
      return res.status(400).json({
        success: false,
        message: "Invalid token: neither phone number nor email found.",
      });
    }

    // 🔍 Find user by phone or email
    const user = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled by admin.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      result: user,
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};




/// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      total: result.length,
      result
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

    const result = await User.findById(userId);

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// Delete user by ID
exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if MongoDB ObjectId is valid
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // First, find the user from MongoDB
    const result = await User.findById(userId);

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete user from Firebase Auth using Firebase UID
    // Assume `user.firebaseUid` is stored when user signs up
    if (result.firebaseUid) {
      try {
        await admin.auth().deleteUser(result.firebaseUid);
      } catch (firebaseError) {
        console.error("Error deleting Firebase user:", firebaseError.message);
        // Optional: continue even if Firebase deletion fails
      }
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User deleted from MongoDB and Firebase" });
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
    const result = await User.findById(userId);
    if (!result) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Handle profile image upload
    let profileImage = result.profileImage;
    if (req.file) {
      profileImage = await uploadImage.uploadImageToFirebase(req.file);
      fs.unlinkSync(req.file.path);
    }

    // Update fields
    result.fullName = fullName || result.fullName;
    result.email = email || result.email;
    result.address = address || result.address;
    result.profileImage = profileImage;

    const updatedUser = await result.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      result: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

exports.enableAndDisable = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: "isActive must be a boolean (true/false)" });
    }

    // 1. Find user in MongoDB
    const result = await User.findById(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }

    // 2. Update MongoDB user
    result.isActive = isActive;
    await result.save();

    // 3. Update Firebase Auth user (disable = !isActive)
    await admin.auth().updateUser(result.firebaseUid, {
      disabled: !isActive
    });

    res.status(200).json({
      success: true,
      message: `User has been ${isActive ? 'enabled' : 'disabled'}`,
      result
    });

  } catch (err) {
    console.error('Enable/Disable User Error:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyUserByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Check if user exists
    let result = await User.findOne({ phoneNumber });

    if (result) {
      // User already exists
      return res.status(200).json({
        success: true,
        message: 'User exists',
        userExists: true,
        result,
      });
    } else {
      // User does not exist
      return res.status(200).json({
        success: true,
        message: 'User does not exist',
        userExists: false,
      });
    }

  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// PATCH: Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { discount } = req.body;

    if (discount === undefined || discount === null) {
      return res.status(400).json({ success: false, message: "Discount is required" });
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be a number between 0 and 100",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { discount },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Discount updated successfully", data: user });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



