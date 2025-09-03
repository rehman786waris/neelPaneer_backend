const Fcm = require("../models/fcmModel");

// Save or update user FCM token (by userId from body)
exports.saveUserDeviceToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "userId and fcmToken are required",
      });
    }

    // Upsert (update if exists, insert if not)
    const fcm = await Fcm.findOneAndUpdate(
      { userId },                  // find by provided userId
      { fcmToken },                // update token
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: fcm });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get FCM token for a specific user (by userId from params)
exports.getUserDeviceToken = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required in params",
      });
    }

    const fcm = await Fcm.findOne({ userId });
    if (!fcm) {
      return res.status(404).json({
        success: false,
        message: "No FCM token found for this user",
      });
    }

    res.status(200).json({ success: true, fcmToken: fcm.fcmToken });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
