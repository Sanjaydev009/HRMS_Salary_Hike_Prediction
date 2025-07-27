const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  issuingOrganization: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date
  },
  credentialId: {
    type: String,
    trim: true
  },
  credentialUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Management', 'Leadership', 'Industry Specific', 'Language', 'Other'],
    default: 'Technical'
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  certificate: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Pending Verification'],
    default: 'Active'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  impactScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  salaryImpact: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
certificationSchema.index({ employeeId: 1, createdAt: -1 });
certificationSchema.index({ category: 1, skillLevel: 1 });
certificationSchema.index({ status: 1 });

// Calculate certification impact on salary prediction
certificationSchema.methods.calculateImpact = function() {
  const categoryWeights = {
    'Technical': 25,
    'Management': 20,
    'Leadership': 18,
    'Industry Specific': 15,
    'Language': 10,
    'Other': 5
  };
  
  const skillWeights = {
    'Expert': 1.0,
    'Advanced': 0.8,
    'Intermediate': 0.6,
    'Beginner': 0.4
  };
  
  const categoryScore = categoryWeights[this.category] || 5;
  const skillMultiplier = skillWeights[this.skillLevel] || 0.6;
  
  // Check if certification is still valid
  const isValid = !this.expirationDate || this.expirationDate > new Date();
  const validityMultiplier = isValid ? 1.0 : 0.5;
  
  this.impactScore = Math.round(categoryScore * skillMultiplier * validityMultiplier);
  
  // Estimate salary impact (in percentage)
  this.salaryImpact = this.impactScore * 0.2; // Each impact point = 0.2% salary increase
  
  return this.impactScore;
};

module.exports = mongoose.model('Certification', certificationSchema);
