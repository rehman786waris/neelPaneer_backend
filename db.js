const mongoose = require('mongoose');

const connectToMongo = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/neelPaneerDb');
    console.log('MongoDB connected via Mongoose');
  } catch (err) {
    console.error('Mongoose connection failed:', err);
    throw err;
  }
};

module.exports = { connectToMongo };
