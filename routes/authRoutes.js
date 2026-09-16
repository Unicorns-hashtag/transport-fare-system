const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/authMiddleware');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Passenger = require('../models/Passenger');
const Trip = require('../models/Trip');

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE PASSWORD (requires being logged in)
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPORT all data as backup (admin only)
router.get('/backup', authMiddleware, async (req, res) => {
  try {
    const [routes, vehicles, passengers, trips] = await Promise.all([
      Route.find(),
      Vehicle.find(),
      Passenger.find(),
      Trip.find()
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      routes,
      vehicles,
      passengers,
      trips
    };

    res.setHeader('Content-Disposition', 'attachment; filename=faresys-backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(backupData);
  } catch (err) {
    res.status(500).json({ error: 'Backup failed' });
  }
});

module.exports = router;