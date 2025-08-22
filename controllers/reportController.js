const Report = require('../models/reportModel');

// ---------------------- CREATE REPORT ----------------------
exports.createReport = async (req, res) => {
  try {
    const { userId, orderId, amount, currency, paymentMethod, transactionId, stripePaymentId, status, description } = req.body;

    if (!userId || !orderId || !amount || !paymentMethod || !transactionId) {
      return res.status(400).json({ error: 'userId, orderId, amount, paymentMethod, and transactionId are required' });
    }

    const report = new Report({
      userId,
      orderId,
      amount,
      currency,
      paymentMethod,
      transactionId,
      stripePaymentId,
      status,
      description
    });

    await report.save();
    res.status(201).json(report);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- GET ALL REPORTS ----------------------
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('userId').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- GET REPORT BY ID ----------------------
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('userId');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- UPDATE REPORT ----------------------
exports.updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedReport) return res.status(404).json({ error: 'Report not found' });
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------------- DELETE REPORT ----------------------
exports.deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

