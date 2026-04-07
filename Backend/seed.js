require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Wipe all existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Activity.deleteMany();

    // Hash admin password — bcrypt MUST be done manually before insertMany
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin', salt);

    // Create ONLY the admin account
    await User.insertMany([
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: adminHash,
        role: 'admin',
        jobRole: 'Administrator'
      }
    ]);

    await Activity.insertMany([
      { type: 'project', text: 'System initialized', detail: 'Admin account created' },
    ]);

    console.log('✅ Admin account created: admin@gmail.com / admin');
    console.log('   Members can be added via the Team page (default password: 123456)');
    process.exit();
  } catch (error) {
    console.error(`❌ Seed error: ${error}`);
    process.exit(1);
  }
};

seedData();
