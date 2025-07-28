const Booking = require('../models/bookingModel');


exports.getAvailableSlotsByDate = async (req, res) => {
  const { date } = req.query;

  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'Valid date is required' });
  }

  const parsedDate = new Date(date);
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const dayType = getDayType(parsedDate);
  const timeSlots = allowedTimeSlots[dayType];

  try {
    const bookings = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay },
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

    const availableSlots = timeSlots.map((slot) => {
      const booked = bookingsMap[slot] || 0;
      const remaining = 46 - booked;
      return {
        timeSlot: slot,
        remainingSeats: remaining,
        isAvailable: remaining > 0,
      };
    });

    res.json({ date: parsedDate.toISOString(), slots: availableSlots });
  } catch (err) {
    console.error('Error fetching available slots:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.checkAvailability = async (req, res) => {
  const { date, timeSlot } = req.query;

  if (!date || !timeSlot) {
    return res.status(400).json({ message: 'Date and timeSlot are required' });
  }

  if (isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'Invalid date format' });
  }

  const parsedDate = new Date(date);
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const existing = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay },
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
    const remaining = 46 - totalBooked;

    res.json({ remainingSeats: remaining });
  } catch (err) {
    console.error('Error checking availability:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

  


// Day-based allowed time slot logic
const allowedTimeSlots = {
    weekday: [
        '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
        '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
    ],
    weekend: [
        '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
        '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
        '10:00 PM', '10:30 PM',
    ],
};

const getDayType = (date) => {
    const day = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    return (day === 5 || day === 6) ? 'weekend' : 'weekday';
};

// CREATE Booking
exports.createBooking = async (req, res) => {
    try {
      const {
        userId, fullName, email, phone, postcode,
        date, timeSlot, numberOfGuests, seatingPreference, specialRequests
      } = req.body;
  
      // Validate date and timeSlot format
      if (isNaN(Date.parse(date)) || typeof timeSlot !== 'string') {
        return res.status(400).json({ message: 'Invalid date or timeSlot format' });
      }
  
      // Parse and normalize date to start of day (midnight)
      const parsedDate = new Date(date);
      parsedDate.setHours(0, 0, 0, 0);
  
      // Enforce max 8 guests online booking
      if (numberOfGuests > 8) {
        return res.status(400).json({
          message: 'Online bookings are allowed for up to 8 guests. Please call for larger groups.',
        });
      }
  
      // Validate timeSlot based on weekday/weekend
      const dayType = getDayType(parsedDate);
      if (!allowedTimeSlots[dayType].includes(timeSlot)) {
        return res.status(400).json({
          message: `The selected time slot is not available on ${dayType === 'weekday' ? 'weekdays' : 'weekends'}.`,
        });
      }
  
      // Define start and end of day for query
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);
  
      // Check available seats in the timeSlot on that day
      const existingBookings = await Booking.aggregate([
        {
          $match: {
            date: { $gte: startOfDay, $lte: endOfDay },
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
  
      const totalBooked = existingBookings[0]?.total || 0;
      const remainingSeats = 46 - totalBooked;
  
      if (numberOfGuests > remainingSeats) {
        return res.status(400).json({
          message: `Only ${remainingSeats} seats are available for this time slot.`,
        });
      }
  
      // Create new booking with normalized date
      const booking = new Booking({
        userId,
        fullName,
        email,
        phone,
        postcode,
        date: parsedDate,  // Normalized date at midnight
        timeSlot,
        numberOfGuests,
        seatingPreference,
        specialRequests,
      });
  
      const saved = await booking.save();
  
      res.status(201).json(saved);
    } catch (err) {
      console.error('Error creating booking:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// GET all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET one booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// UPDATE booking
exports.updateBooking = async (req, res) => {
    try {
        const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) return res.status(404).json({ message: 'Booking not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE booking
exports.deleteBooking = async (req, res) => {
    try {
        const deleted = await Booking.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
