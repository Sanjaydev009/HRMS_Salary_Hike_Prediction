const axios = require('axios');

async function seedTestCertifications() {
  console.log('🌱 Seeding Test Certifications...\n');
  
  const BACKEND_URL = 'http://localhost:5001';
  
  try {
    // Login as employee
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'employee.dev@gmail.com',
      password: 'employee123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Login successful');
    
    // Sample certifications to add
    const certifications = [
      {
        name: 'AWS Certified Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2024-03-15',
        expirationDate: '2027-03-15',
        credentialId: 'AWS-CSA-123456',
        credentialUrl: 'https://aws.amazon.com/certification/verify',
        category: 'Technical',
        skillLevel: 'Expert',
        skills: ['Cloud Computing', 'AWS', 'Architecture Design'],
        verified: true
      },
      {
        name: 'Certified ScrumMaster',
        issuingOrganization: 'Scrum Alliance',
        issueDate: '2024-01-10',
        expirationDate: '2026-01-10',
        credentialId: 'CSM-789012',
        category: 'Management',
        skillLevel: 'Intermediate',
        skills: ['Agile', 'Scrum', 'Team Leadership'],
        verified: true
      },
      {
        name: 'Google Cloud Professional Developer',
        issuingOrganization: 'Google Cloud',
        issueDate: '2023-11-20',
        expirationDate: '2025-11-20',
        credentialId: 'GCP-DEV-345678',
        category: 'Technical',
        skillLevel: 'Advanced',
        skills: ['Google Cloud', 'Kubernetes', 'DevOps'],
        verified: false
      },
      {
        name: 'Project Management Professional (PMP)',
        issuingOrganization: 'Project Management Institute',
        issueDate: '2023-08-05',
        expirationDate: '2026-08-05',
        credentialId: 'PMP-901234',
        category: 'Management',
        skillLevel: 'Expert',
        skills: ['Project Management', 'Risk Management', 'Strategic Planning'],
        verified: true
      },
      {
        name: 'React Developer Certification',
        issuingOrganization: 'Meta',
        issueDate: '2024-06-01',
        credentialId: 'REACT-567890',
        category: 'Technical',
        skillLevel: 'Advanced',
        skills: ['React', 'JavaScript', 'Frontend Development'],
        verified: false
      }
    ];
    
    console.log(`📝 Adding ${certifications.length} test certifications...`);
    
    for (const cert of certifications) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/certifications`, cert, { headers });
        console.log(`✅ Added: ${cert.name}`);
      } catch (error) {
        console.log(`❌ Failed to add ${cert.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n🎉 Test certifications seeded successfully!');
    console.log('\n📊 Now run the analytics test to see rich data:');
    console.log('node test-certification-analytics.js');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
  }
}

// Run the seeding
if (require.main === module) {
  seedTestCertifications();
}

module.exports = { seedTestCertifications };
