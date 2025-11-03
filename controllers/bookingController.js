const moment = require('moment');
const mongoose = require('mongoose'); // ✅ add this line
const Booking = require('../models/bookingModel');


const allowedTimeSlots = {
  weekday: [
    '4:30 PM', '6:15 PM', '9:00 PM'
  ],
  weekend: [
    '4:30 PM', '6:15 PM', '9:00 PM', '10:45'
  ],
};

const MAX_GUESTS = 46;
const MAX_ONLINE = 8;

function getDayType(date) {
  const day = moment(date).day(); // 0=Sun, 6=Sat
  return (day === 5 || day === 6) ? 'weekend' : 'weekday';
}

// Normalize to start of day moment
function normalizeDate(dateStr) {
  return moment(dateStr).startOf('day');
}

// GET /bookings/available-slots?date=YYYY-MM-DD
exports.getAvailableSlotsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || !moment(date, moment.ISO_8601, true).isValid()) {
    return res.status(400).json({ message: 'Valid date query param required' });
  }

  try {
    const m = normalizeDate(date);
    const dayType = getDayType(m);
    const timeSlots = allowedTimeSlots[dayType];

    if (!timeSlots) {
      return res.status(400).json({ message: 'No time slots for this day' });
    }

    // Aggregate to get total guests booked per time slot
    const bookings = await Booking.aggregate([
      {
        $match: {
          date: {
            $gte: m.toDate(),
            $lte: m.clone().endOf('day').toDate(),
          },
        },
      },
      {
        $group: {
          _id: '$timeSlot',
          totalGuests: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    const bookingsMap = {};
    bookings.forEach(({ _id, totalGuests }) => {
      bookingsMap[_id] = totalGuests;
    });

    const slots = timeSlots.map(slot => {
      const booked = bookingsMap[slot] || 0;
      return {
        timeSlot: slot,
        remainingSeats: MAX_GUESTS - booked,
        isAvailable: booked < MAX_GUESTS,
      };
    });

    res.json({ date: m.format('YYYY-MM-DD'), slots });
  } catch (err) {
    console.error('Error in getAvailableSlotsByDate:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /bookings/available-seats?date=YYYY-MM-DD&timeSlot=HH:mm AM/PM
exports.checkAvailability = async (req, res) => {
  const { date, timeSlot } = req.query;

  if (!date || !timeSlot || !moment(date, moment.ISO_8601, true).isValid()) {
    return res.status(400).json({ message: 'Date and timeSlot query params required' });
  }

  try {
    const m = normalizeDate(date);

    const result = await Booking.aggregate([
      {
        $match: {
          date: { $gte: m.toDate(), $lte: m.clone().endOf('day').toDate() },
          timeSlot,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    const totalBooked = result[0]?.total || 0;
    const remainingSeats = MAX_GUESTS - totalBooked;

    res.json({ remainingSeats });
  } catch (err) {
    console.error('Error in checkAvailability:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      postcode,
      date,
      timeSlot,
      numberOfGuests,
      seatingPreference,
      specialRequests,
    } = req.body;

    if (!moment(date, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (typeof timeSlot !== 'string') {
      return res.status(400).json({ message: 'timeSlot must be a string' });
    }
    if (numberOfGuests > MAX_ONLINE) {
      return res.status(400).json({
        message: `Online bookings allowed for up to ${MAX_ONLINE} guests only. Please call for larger groups.`,
      });
    }

    const m = normalizeDate(date);
    const dayType = getDayType(m);

    if (!allowedTimeSlots[dayType].includes(timeSlot)) {
      return res.status(400).json({ message: `Invalid time slot for ${dayType}` });
    }

    const existing = await Booking.aggregate([
      {
        $match: {
          date: { $gte: m.toDate(), $lte: m.clone().endOf('day').toDate() },
          timeSlot,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    const totalBooked = existing[0]?.total || 0;

    if (totalBooked + numberOfGuests > MAX_GUESTS) {
      return res.status(400).json({
        message: `Only ${MAX_GUESTS - totalBooked} seats are available for this time slot.`,
      });
    }

    const booking = new Booking({
      userId,
      fullName,
      email,
      phone,
      postcode,
      date: m.toDate(),
      timeSlot,
      numberOfGuests,
      seatingPreference,
      specialRequests,
    });

    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      timeSlot,
      numberOfGuests,
      fullName,
      email,
      phone,
      postcode,
      seatingPreference,
      specialRequests,
    } = req.body;

    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!moment(date, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (numberOfGuests > MAX_ONLINE) {
      return res.status(400).json({
        message: `Online bookings allowed for up to ${MAX_ONLINE} guests only.`,
      });
    }

    const m = normalizeDate(date);
    const dayType = getDayType(m);

    if (!allowedTimeSlots[dayType].includes(timeSlot)) {
      return res.status(400).json({ message: `Invalid time slot for ${dayType}` });
    }

    // Check availability excluding current booking
    const existing = await Booking.aggregate([
      {
        $match: {
          _id: { $ne: existingBooking._id },
          date: { $gte: m.toDate(), $lte: m.clone().endOf('day').toDate() },
          timeSlot,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$numberOfGuests' },
        },
      },
    ]);

    const totalBooked = existing[0]?.total || 0;
    if (totalBooked + numberOfGuests > MAX_GUESTS) {
      return res.status(400).json({
        message: `Only ${MAX_GUESTS - totalBooked} seats available for this time slot.`,
      });
    }

    Object.assign(existingBooking, {
      date: m.toDate(),
      timeSlot,
      numberOfGuests,
      fullName,
      email,
      phone,
      postcode,
      seatingPreference,
      specialRequests,
    });

    const updated = await existingBooking.save();
    res.json(updated);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /bookings/:id
exports.getBookingsByUserId = async (req, res) => {
  const { userId } = req.params; // userId passed in the route, e.g., /bookings/user/:userId

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  try {
    const bookings = await Booking.find({ userId }); // find all bookings belonging to this user

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user' });
    }

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings by user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// DELETE /bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
