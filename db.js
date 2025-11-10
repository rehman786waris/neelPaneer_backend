const mongoose = require('mongoose');
require('dotenv').config();

let timezonePlugin;
try {
  timezonePlugin = require('./utils/timezonePlugin');
} catch (err) {
  console.warn('⚠️ timezonePlugin not found, skipping timezone plugin.');
}

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (timezonePlugin) mongoose.plugin(timezonePlugin);
    console.log('✅ MongoDB connected via Mongoose');
  } catch (err) {
    console.error('❌ Mongoose connection failed:', err.message);
    process.exit(1); // optional: stop the app if DB connection fails
  }
};

module.exports = { connectToMongo };
