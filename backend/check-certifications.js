const mongoose = require('mongoose');
const User = require('./models/User');
const Certification = require('./models/Certification');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkCertifications = async () => {
  await connectDB();
  
  try {
    // Find user with email employee.dev@gmail.com
    const user = await User.findOne({ email: 'employee.dev@gmail.com' });
    
    if (!user) {
      console.log('Employee user not found');
      return;
    }
    
    console.log('Found user:', user.email, user._id);
    
    // Check existing certifications
    const existingCerts = await Certification.find({ employeeId: user._id });
    console.log('Existing certifications:', existingCerts.length);
    
    existingCerts.forEach(cert => {
      console.log(`- ${cert.name} (${cert.category}) - ${cert.issuingOrganization}`);
    });
    
    if (existingCerts.length === 1) {
      console.log('Adding more certifications...');
      
      const newCertifications = [
        {
          employeeId: user._id,
          name: 'React.js Developer Certification',
          issuingOrganization: 'Meta',
          issueDate: new Date('2024-06-15'),
          expirationDate: new Date('2027-06-15'),
          credentialId: 'META-REACT-2024-001',
          category: 'Technical',
          skillLevel: 'Advanced',
          isVerified: true,
          verificationStatus: 'verified'
        },
        {
          employeeId: user._id,
          name: 'Project Management Professional (PMP)',
          issuingOrganization: 'Project Management Institute',
          issueDate: new Date('2024-03-10'),
          expirationDate: new Date('2027-03-10'),
          credentialId: 'PMP-2024-DEV001',
          category: 'Management',
          skillLevel: 'Expert',
          isVerified: true,
          verificationStatus: 'verified'
        },
        {
          employeeId: user._id,
          name: 'AWS Cloud Practitioner',
          issuingOrganization: 'Amazon Web Services',
          issueDate: new Date('2024-01-20'),
          expirationDate: new Date('2027-01-20'),
          credentialId: 'AWS-CP-2024-001',
          category: 'Technical',
          skillLevel: 'Intermediate',
          isVerified: true,
          verificationStatus: 'verified'
        }
      ];
      
      await Certification.insertMany(newCertifications);
      console.log('Additional certifications created successfully!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkCertifications();
