const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/authMiddleware');

// GET all trips (with passenger/route/vehicle details populated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('passenger', 'fullName phone')
      .populate('route', 'origin destination fareAmount')
      .populate('vehicle', 'vehicleType plateNumber')
      .sort({ tripDate: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new trip record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newTrip = new Trip(req.body);
    const saved = await newTrip.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a trip record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Trip.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;