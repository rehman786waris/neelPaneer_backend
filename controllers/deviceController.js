const Device = require('../models/deviceModel');

// CREATE
exports.createDevice = async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json({ success: true, data: device });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// READ ALL
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json({ success: true, data: devices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// READ ONE
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });
    res.status(200).json({ success: true, data: device });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE
exports.updateDevice = async (req, res) => {
    try {
      const { deviceId } = req.body;
  
      if (!deviceId) {
        return res.status(400).json({ success: false, message: "deviceId is required" });
      }
  
      const updated = await Device.findByIdAndUpdate(
        req.params.id,
        { deviceId },
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
  

// DELETE
exports.deleteDevice = async (req, res) => {
  try {
    const deleted = await Device.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Device not found" });
    res.status(200).json({ success: true, message: "Device deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
