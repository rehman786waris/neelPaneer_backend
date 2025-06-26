const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minLength: [2, 'Full name must have at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Email format is invalid'],
    minLength: [5, 'Email must have at least 5 characters'],
    index: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'],
    index: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },  
  profileImage: {
    type: String,
    default: null,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

/// Capitalize full name before saving
userSchema.pre('save', function (next) {
  if (this.fullName) {
    this.fullName = this.fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
