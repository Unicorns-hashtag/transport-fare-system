// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());              // allows frontend to talk to backend
app.use(express.json());      // allows server to read JSON sent from frontend
app.use(express.static(path.join(__dirname, 'public'))); // serves our HTML/CSS/JS

// Catch malformed JSON errors instead of crashing
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  next(err);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚍 Server running on http://localhost:${PORT}`);
});