const { admin } = require("../config/firebaseAdmin");
const Notification = require("../models/notificationModel");


// Send Push Notification
// 📱 Mobile Notification
exports.sendNotification = async (req, res) => {
  const { deviceId, title, body } = req.body;

  if (!deviceId || !title || !body) {
    return res.status(400).json({ error: "Missing required fields: deviceId, title, body" });
  }

  const message = {
    token: deviceId,
    notification: {
      title,
      body,
    },
    // ❌ no webpush here
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("FCM Mobile Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 💻 Web Notification
exports.sendNotificationWeb = async (req, res) => {
  const { deviceId, title, body } = req.body;

  if (!deviceId || !title || !body) {
    return res.status(400).json({ error: "Missing required fields: deviceId, title, body" });
  }

  const message = {
    token: deviceId,
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        title: title,
        body: body,
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error("FCM Web Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



// Create Notification
exports.createNotification = async (req, res) => {
    try {
      const notification = await Notification.create(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  };
  
  // Get All Notifications (optionally filtered by userId)
  exports.getAllNotifications = async (req, res) => {
    try {
      const { userId } = req.query;
      const query = userId ? { userId } : {};
      const notifications = await Notification.find(query).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  // Get Notification by ID
  exports.getNotificationById = async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).json({ success: false, message: "Not found" });
      res.status(200).json({ success: true, data: notification });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  // Mark a single notification as read
  exports.markAsRead = async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ success: false, message: "Not found" });
      res.status(200).json({ success: true, data: notification });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  // Mark all notifications as read by userId
  exports.markAllAsRead = async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ success: false, message: "userId is required" });
  
      await Notification.updateMany({ userId }, { isRead: true });
      res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  // Delete a notification by ID
  exports.deleteNotification = async (req, res) => {
    try {
      const deleted = await Notification.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
  
  // Delete all notifications by userId
  exports.deleteAllNotifications = async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ success: false, message: "userId is required" });
  
      await Notification.deleteMany({ userId });
      res.status(200).json({ success: true, message: "All notifications deleted" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
