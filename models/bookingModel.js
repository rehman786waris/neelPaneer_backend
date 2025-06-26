const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: v => /^\d{10,15}$/.test(v),
        message: props => `${props.value} is not a valid phone number`
      }
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      enum: ['12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'], // customize as needed
    },
    guests: {
      type: String,
      required: [true, 'Guest count is required'],
      enum: ['1 guest', '2 guests', '3 guests', '4 guests', '5+ guests'], // customize as needed
    },
    seatingPreference: {
      type: String,
      enum: ['indoor', 'outdoor'],
      default: 'indoor',
    },
    specialRequests: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
