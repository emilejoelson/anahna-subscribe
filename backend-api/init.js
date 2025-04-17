require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Owner = require('./models/owner');
const config = require('./config');

async function initializeTestData() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Check if test owner already exists
    const existingOwner = await Owner.findOne({ email: 'admin@gmail.com' });
    if (existingOwner) {
      console.log('Test owner already exists');
      await mongoose.connection.close();
      return;
    }

    // Create test owner
    const hashedPassword = await bcrypt.hash('123123', 12);
    const owner = new Owner({
      name: 'Test Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      userType: 'ADMIN',
      isActive: true,
      permissions: ['ALL']
    });

    await owner.save();
    console.log('Test owner created successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

initializeTestData();