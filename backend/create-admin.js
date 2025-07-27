const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create admin user
    const adminUser = new User({
      employeeId: 'ADMIN001',
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+91 9999999999',
        address: {
          street: 'Admin Office',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        dateOfBirth: new Date('1990-01-01'),
        emergencyContact: {
          name: 'Emergency Contact',
          relation: 'System',
          phone: '+91 9999999999'
        }
      },
      jobDetails: {
        department: 'IT',
        designation: 'System Administrator',
        joiningDate: new Date(),
        employmentType: 'full-time',
        workLocation: 'Mumbai Office',
        salary: {
          basic: 100000,
          allowances: 20000,
          currency: 'INR'
        }
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@company.com');
    console.log('🔑 Password: password123');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
  }
}

createAdminUser();
