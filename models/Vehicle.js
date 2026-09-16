const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: true,
    enum: ['Bus', 'Taxi', 'Keke', 'Danfo'],
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['Active', 'Under Maintenance', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);