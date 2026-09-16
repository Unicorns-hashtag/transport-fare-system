const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const authMiddleware = require('../middleware/authMiddleware');

// PUBLIC: minimal read-only data for the landing page fare calculator
router.get('/public/all', async (req, res) => {
  try {
    const routes = await Route.find().select('origin destination vehicleType fareAmount -_id');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load fare data' });
  }
});

// GET all routes (PROTECTED)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single route by ID (PROTECTED)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new route (PROTECTED)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newRoute = new Route(req.body);
    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a route (PROTECTED)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRoute) return res.status(404).json({ error: 'Route not found' });
    res.json(updatedRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a route (PROTECTED)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) return res.status(404).json({ error: 'Route not found' });
    res.json({ message: 'Route deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;