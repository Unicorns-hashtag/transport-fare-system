const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true // this will store the HASHED password, never plain text
  }
});

module.exports = mongoose.model('Admin', adminSchema);