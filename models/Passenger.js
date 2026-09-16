const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    required: false
  },
  idNumber: {
    type: String,
    trim: true,
    required: false // optional national ID / student ID etc.
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Passenger', passengerSchema);