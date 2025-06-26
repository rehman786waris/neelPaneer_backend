require('dotenv').config();

const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectToMongo } = require('./db');
const verificationRoutes = require('./routes/appRouter');

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
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
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });
