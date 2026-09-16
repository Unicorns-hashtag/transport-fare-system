const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  fareCharged: {
    type: Number,
    required: true,
    min: 0
  },
  tripDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', tripSchema);