const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      validate: {
        validator: v =>
          /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v),
        message: props => `${props.value} is not a valid email address`,
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: v => /^\d{10,15}$/.test(v),
        message: props => `${props.value} is not a valid phone number`,
      },
    },
    postcode: {
      type: String,
      required: [true, 'Postcode is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
      max: [46, 'Cannot book more than 46 guests'],
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
