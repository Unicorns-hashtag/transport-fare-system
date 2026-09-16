const express = require('express');
const router = express.Router();
const Passenger = require('../models/Passenger');
const authMiddleware = require('../middleware/authMiddleware');

// GET all passengers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const passengers = await Passenger.find().sort({ createdAt: -1 });
    res.json(passengers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single passenger
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id);
    if (!passenger) return res.status(404).json({ error: 'Passenger not found' });
    res.json(passenger);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a passenger
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newPassenger = new Passenger(req.body);
    const saved = await newPassenger.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a passenger
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Passenger.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Passenger not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a passenger
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Passenger.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Passenger not found' });
    res.json({ message: 'Passenger deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;