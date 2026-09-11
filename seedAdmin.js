require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const username = 'admin'; // change this if you want a different username
    const plainPassword = 'Admin123'; // change this to your real password

    // Check if admin already exists
    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log('Admin already exists. Delete it first if you want to recreate it.');
      process.exit();
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${plainPassword} (remember this, it won't be shown again)`);
    process.exit();
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();