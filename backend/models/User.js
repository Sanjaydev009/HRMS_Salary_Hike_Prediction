const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'manager', 'admin'],
    default: 'employee'
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    profilePicture: {
      type: String,
      default: null
    },
    bankDetails: {
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountType: {
        type: String,
        enum: ['checking', 'savings'],
        default: 'checking'
      },
      branchCode: String,
      swiftCode: String,
      isVerified: {
        type: Boolean,
        default: false
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }
  },
  jobDetails: {
    department: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    joiningDate: {
      type: Date,
      required: true
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time'
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    salary: {
      basic: {
        type: Number,
        required: true
      },
      allowances: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    workLocation: {
      type: String,
      default: 'Office'
    }
  },
  leaveBalance: {
    annual: {
      type: Number,
      default: 25
    },
    sick: {
      type: Number,
      default: 10
    },
    casual: {
      type: Number,
      default: 7
    },
    maternity: {
      type: Number,
      default: 90
    },
    paternity: {
      type: Number,
      default: 15
    }
  },
  performanceHistory: [{
    year: Number,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    goals: [String],
    achievements: [String],
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'id-proof', 'address-proof', 'education', 'contract', 'other']
    },
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  // Password reset fields
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  passwordChangedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ employeeId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'jobDetails.department': 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set password changed timestamp
    if (this.isModified('password') && !this.isNew) {
      this.passwordChangedAt = new Date();
      this.isFirstLogin = false;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  return resetToken;
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Get user's total salary
userSchema.methods.getTotalSalary = function() {
  return this.jobDetails.salary.basic + this.jobDetails.salary.allowances;
};

// Check if user can apply for leave
userSchema.methods.canApplyLeave = function(leaveType, days) {
  const balance = this.leaveBalance[leaveType];
  return balance && balance >= days;
};

// Transform JSON output (remove sensitive information)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.twoFactorEnabled;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
