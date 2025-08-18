require('dotenv').config(); // load .env variables
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectToMongo } = require('./db');
const verificationRoutes = require('./routes/appRouter');

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', verificationRoutes);
app.get('/', (req, res) => {
  res.send('Server running with dotenv!');
});

// Start server after DB connects
connectToMongo()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err);
  });


  //chmod 400 neelPaneerKey.pem  
  //ssh -i "neelPaneerKey.pem" ubuntu@16.171.176.59
  //cd Downloads  