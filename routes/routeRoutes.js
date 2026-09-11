const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const authMiddleware = require('../middleware/authMiddleware');

// GET all routes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single route by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new route
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newRoute = new Route(req.body);
    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a route
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

// DELETE a route
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