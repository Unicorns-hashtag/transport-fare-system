const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/authMiddleware');

// GET all vehicles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single vehicle
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a vehicle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newVehicle = new Vehicle(req.body);
    const saved = await newVehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a vehicle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a vehicle
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;