const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: String,
  phone: String,
  cuisine: String,

  openTime: {
    type: String, // e.g. "09:00 AM"
    required: true,
  },
  closeTime: {
    type: String, // e.g. "10:00 PM"
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'closed',
  }
}, 
{ timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
