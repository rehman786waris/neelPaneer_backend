const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    deviceId: {
        type: String,
        required: true
    },
    firbaseUid: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
