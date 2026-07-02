const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../config/config');

async function run() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to Mongo for migrations');

  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found. Nothing to do.');
    process.exit(0);
  }

  const appliedColl = mongoose.connection.collection('migrations');

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    const name = file.replace(/\.js$/, '');
    const already = await appliedColl.findOne({ name });
    if (already) {
      console.log(`Skipping ${file} (already applied)`);
      continue;
    }

    console.log(`Applying migration: ${file}`);
    const migration = require(path.join(migrationsDir, file));
    if (typeof migration.up !== 'function') {
      console.warn(`Migration ${file} does not export an 'up' function; skipping.`);
      continue;
    }

    try {
      await migration.up({ mongoose });
      await appliedColl.insertOne({ name, appliedAt: new Date() });
      console.log(`Migration ${file} applied successfully.`);
    } catch (err) {
      console.error(`Migration ${file} failed:`, err);
      process.exit(1);
    }
  }

  console.log('All migrations applied.');
  await mongoose.disconnect();
  process.exit(0);
}

run();
