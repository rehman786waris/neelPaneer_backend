const Booking = require('../models/bookingModel');

// Create booking
exports.createBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json({ success: true, booking });
    } catch (err) {
        console.error("Create Booking Error:", err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        console.error("Get Bookings Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, booking });
    } catch (err) {
        console.error("Get Booking Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update booking
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, booking });
    } catch (err) {
        console.error("Update Booking Error:", err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, message: "Booking deleted" });
    } catch (err) {
        console.error("Delete Booking Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
