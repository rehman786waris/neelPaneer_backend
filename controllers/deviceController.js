const Device = require('../models/deviceModel');

// CREATE Device
exports.createDevice = async (req, res) => {
  try {
    const { userId, deviceToken } = req.body;

    if (!userId || !deviceToken) {
      return res.status(400).json({ success: false, message: "userId and deviceToken are required" });
    }

    // Optional: Prevent duplicate deviceToken for same user
    let existing = await Device.findOne({ userId, deviceToken });
    if (existing) {
      return res.status(200).json({ success: true, message: "Device already registered", data: existing });
    }

    const device = await Device.create({ userId, deviceToken });
    res.status(201).json({ success: true, data: device });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// READ All Devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find().populate("userId", "fullName email");
    res.status(200).json({ success: true, data: devices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// READ One Device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id).populate("userId", "fullName email");
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });
    res.status(200).json({ success: true, data: device });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE Device (update token for a given device)
exports.updateDevice = async (req, res) => {
  try {
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({ success: false, message: "deviceToken is required" });
    }

    const updated = await Device.findByIdAndUpdate(
      req.params.id,
      { deviceToken },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Device not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE Device
exports.deleteDevice = async (req, res) => {
  try {
    const deleted = await Device.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Device not found" });
    res.status(200).json({ success: true, message: "Device deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
