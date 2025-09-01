const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        deviceToken: {
            type: String,   // FCM token
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);
