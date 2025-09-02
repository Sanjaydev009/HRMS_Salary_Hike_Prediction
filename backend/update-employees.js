// Script to update existing employees with proper data structure
const mongoose = require('mongoose');
require('dotenv').config();

// User model (full version)
const userSchema = new mongoose.Schema({
  employeeId: String,
  email: String,
  password: String,
  role: String,
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  jobDetails: {
    department: String,
    designation: String,
    joiningDate: Date,
    employmentType: String,
    reportingManager: mongoose.Schema.Types.ObjectId,
    salary: {
      basic: Number,
      allowances: Number,
      currency: String
    },
    workLocation: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  status: String,
  leaveBalance: {
    annual: Number,
    sick: Number,
    casual: Number
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateEmployees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_db');
    console.log('Connected to MongoDB');
    
    // Sample employees data to add proper structure
    const employeesToUpdate = [
      {
        email: 'alice.smith@company.com',
        updates: {
          employeeId: 'EMP001',
          profile: {
            firstName: 'Alice',
            lastName: 'Smith',
            phone: '+1-555-0101',
            dateOfBirth: new Date('1990-03-15'),
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            }
          },
          jobDetails: {
            department: 'Engineering',
            designation: 'Software Engineer',
            joiningDate: new Date('2023-01-15'),
            employmentType: 'full-time',
            salary: {
              basic: 75000,
              allowances: 5000,
              currency: 'USD'
            },
            workLocation: 'New York Office'
          },
          emergencyContact: {
            name: 'John Smith',
            relationship: 'Spouse',
            phone: '+1-555-0102',
            email: 'john.smith@email.com'
          },
          status: 'active'
        }
      },
      {
        email: 'bob.wilson@company.com',
        updates: {
          employeeId: 'EMP002',
          profile: {
            firstName: 'Bob',
            lastName: 'Wilson',
            phone: '+1-555-0201',
            dateOfBirth: new Date('1988-07-22'),
            address: {
              street: '456 Oak Ave',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94102',
              country: 'USA'
            }
          },
          jobDetails: {
            department: 'Marketing',
            designation: 'Marketing Manager',
            joiningDate: new Date('2022-09-01'),
            employmentType: 'full-time',
            salary: {
              basic: 85000,
              allowances: 7000,
              currency: 'USD'
            },
            workLocation: 'San Francisco Office'
          },
          emergencyContact: {
            name: 'Sarah Wilson',
            relationship: 'Spouse',
            phone: '+1-555-0202',
            email: 'sarah.wilson@email.com'
          },
          status: 'active'
        }
      },
      {
        email: 'carol.davis@company.com',
        updates: {
          employeeId: 'EMP003',
          profile: {
            firstName: 'Carol',
            lastName: 'Davis',
            phone: '+1-555-0301',
            dateOfBirth: new Date('1992-11-08'),
            address: {
              street: '789 Pine St',
              city: 'Chicago',
              state: 'IL',
              zipCode: '60601',
              country: 'USA'
            }
          },
          jobDetails: {
            department: 'Finance',
            designation: 'Financial Analyst',
            joiningDate: new Date('2023-03-10'),
            employmentType: 'full-time',
            salary: {
              basic: 70000,
              allowances: 4000,
              currency: 'USD'
            },
            workLocation: 'Chicago Office'
          },
          emergencyContact: {
            name: 'Mike Davis',
            relationship: 'Brother',
            phone: '+1-555-0302',
            email: 'mike.davis@email.com'
          },
          status: 'active'
        }
      },
      {
        email: 'david.brown@company.com',
        updates: {
          employeeId: 'EMP004',
          profile: {
            firstName: 'David',
            lastName: 'Brown',
            phone: '+1-555-0401',
            dateOfBirth: new Date('1985-05-14'),
            address: {
              street: '321 Elm St',
              city: 'Boston',
              state: 'MA',
              zipCode: '02101',
              country: 'USA'
            }
          },
          jobDetails: {
            department: 'Engineering',
            designation: 'Senior Software Engineer',
            joiningDate: new Date('2021-11-20'),
            employmentType: 'full-time',
            salary: {
              basic: 95000,
              allowances: 8000,
              currency: 'USD'
            },
            workLocation: 'Boston Office'
          },
          emergencyContact: {
            name: 'Lisa Brown',
            relationship: 'Spouse',
            phone: '+1-555-0402',
            email: 'lisa.brown@email.com'
          },
          status: 'active'
        }
      },
      {
        email: 'eva.garcia@company.com',
        updates: {
          employeeId: 'EMP005',
          profile: {
            firstName: 'Eva',
            lastName: 'Garcia',
            phone: '+1-555-0501',
            dateOfBirth: new Date('1991-09-03'),
            address: {
              street: '654 Maple Dr',
              city: 'Austin',
              state: 'TX',
              zipCode: '73301',
              country: 'USA'
            }
          },
          jobDetails: {
            department: 'Human Resources',
            designation: 'HR Specialist',
            joiningDate: new Date('2023-02-05'),
            employmentType: 'full-time',
            salary: {
              basic: 65000,
              allowances: 3500,
              currency: 'USD'
            },
            workLocation: 'Austin Office'
          },
          emergencyContact: {
            name: 'Carlos Garcia',
            relationship: 'Father',
            phone: '+1-555-0502',
            email: 'carlos.garcia@email.com'
          },
          status: 'active'
        }
      }
    ];

    // Update each employee
    for (const empData of employeesToUpdate) {
      const result = await User.updateOne(
        { email: empData.email },
        { $set: empData.updates }
      );
      console.log(`Updated ${empData.email}:`, result.modifiedCount > 0 ? 'Success' : 'No changes');
    }

    // Update the admin and HR users as well
    await User.updateOne(
      { email: 'sanju.admin@gmail.com' },
      { 
        $set: {
          employeeId: 'ADM001',
          profile: {
            firstName: 'Sanju',
            lastName: 'Admin',
            phone: '+1-555-9001',
            dateOfBirth: new Date('1980-01-01')
          },
          jobDetails: {
            department: 'Administration',
            designation: 'System Administrator',
            joiningDate: new Date('2020-01-01'),
            employmentType: 'full-time',
            salary: {
              basic: 120000,
              allowances: 15000,
              currency: 'USD'
            },
            workLocation: 'Head Office'
          },
          status: 'active'
        }
      }
    );

    await User.updateOne(
      { email: 'hr.manager@gmail.com' },
      { 
        $set: {
          employeeId: 'HR001',
          profile: {
            firstName: 'HR',
            lastName: 'Manager',
            phone: '+1-555-9002',
            dateOfBirth: new Date('1985-06-15')
          },
          jobDetails: {
            department: 'Human Resources',
            designation: 'HR Manager',
            joiningDate: new Date('2021-03-01'),
            employmentType: 'full-time',
            salary: {
              basic: 90000,
              allowances: 10000,
              currency: 'USD'
            },
            workLocation: 'Head Office'
          },
          status: 'active'
        }
      }
    );

    console.log('\nAll employees updated successfully!');
    
    // Verify the updates
    const updatedUsers = await User.find().select('profile.firstName profile.lastName email jobDetails.department');
    console.log('\nUpdated employees:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.profile?.firstName || 'N/A'} ${user.profile?.lastName || 'N/A'} (${user.email}) - ${user.jobDetails?.department || 'N/A'}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDatabase update completed');
  } catch (error) {
    console.error('Error updating employees:', error);
  }
}

updateEmployees();
