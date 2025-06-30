const PaymentReport = require('../models/reportModel'); // Adjust path as needed

exports.createReport = async (req, res) => {
    try {
        const report = new PaymentReport(req.body);
        await report.save();
        res.status(201).json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllReport = async (req, res) => {
    try {
        const { from, to } = req.query;

        let filter = {};
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        const reports = await PaymentReport.find(filter).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await PaymentReport.findById(req.params.id).populate('userId');
        if (!report) {
            return res.status(404).json({ message: 'Payment report not found' });
        }
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const updatedReport = await PaymentReport.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedReport) return res.status(404).json({ message: 'Report not found' });
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const deletedReport = await PaymentReport.findByIdAndDelete(req.params.id);
        if (!deletedReport) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Report deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

