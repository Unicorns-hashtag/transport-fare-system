const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Bus', 'Taxi', 'Keke', 'Danfo'], // only these values allowed
    default: 'Bus'
  },
  fareAmount: {
    type: Number,
    required: true,
    min: 0
  },
  distanceKm: {
    type: Number,
    required: false // optional field
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);