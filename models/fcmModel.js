const mongoose = require("mongoose");

const fcmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fcmToken: {
      type: String, // FCM token
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FCM", fcmSchema);
