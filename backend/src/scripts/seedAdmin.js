const mongoose = require('mongoose');
const config = require('../config/config');
const userRepository = require('../repositories/userRepository');

async function run() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding');

    const userCount = await userRepository.count();
    if (userCount > 0) {
      console.log('Database already has users; skipping seed');
      process.exit(0);
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    const admin = await userRepository.create({
      name: adminName,
      email: adminEmail,
      password: adminPass,
      role: 'admin'
    });

    console.log('Admin user created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

run();
