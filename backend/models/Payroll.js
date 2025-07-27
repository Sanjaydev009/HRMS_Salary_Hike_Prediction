const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payPeriod: {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    housing: {
      type: Number,
      default: 0
    },
    transport: {
      type: Number,
      default: 0
    },
    medical: {
      type: Number,
      default: 0
    },
    food: {
      type: Number,
      default: 0
    },
    overtime: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  deductions: {
    tax: {
      type: Number,
      default: 0
    },
    socialSecurity: {
      type: Number,
      default: 0
    },
    insurance: {
      type: Number,
      default: 0
    },
    providentFund: {
      type: Number,
      default: 0
    },
    loan: {
      type: Number,
      default: 0
    },
    advance: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  attendance: {
    workingDays: {
      type: Number,
      required: true
    },
    presentDays: {
      type: Number,
      required: true
    },
    absentDays: {
      type: Number,
      default: 0
    },
    halfDays: {
      type: Number,
      default: 0
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    lateArrivals: {
      type: Number,
      default: 0
    },
    earlyDepartures: {
      type: Number,
      default: 0
    }
  },
  leaveDeductions: {
    unpaidLeaves: {
      type: Number,
      default: 0
    },
    leaveDeductionAmount: {
      type: Number,
      default: 0
    }
  },
  calculations: {
    grossSalary: {
      type: Number,
      required: true
    },
    totalAllowances: {
      type: Number,
      required: true
    },
    totalDeductions: {
      type: Number,
      required: true
    },
    netSalary: {
      type: Number,
      required: true
    }
  },
  paymentDetails: {
    paymentDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ['bank-transfer', 'check', 'cash', 'digital-wallet'],
      default: 'bank-transfer'
    },
    transactionId: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'paid', 'failed'],
      default: 'pending'
    }
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branchCode: String,
    ifscCode: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for unique payroll per employee per month
payrollSchema.index({ employeeId: 1, 'payPeriod.month': 1, 'payPeriod.year': 1 }, { unique: true });

// Index for performance
payrollSchema.index({ 'payPeriod.year': 1, 'payPeriod.month': 1 });
payrollSchema.index({ 'paymentDetails.status': 1 });

// Pre-save middleware to calculate totals
payrollSchema.pre('save', function(next) {
  // Calculate total allowances
  this.calculations.totalAllowances = Object.values(this.allowances).reduce((sum, value) => sum + (value || 0), 0);
  
  // Calculate total deductions
  this.calculations.totalDeductions = Object.values(this.deductions).reduce((sum, value) => sum + (value || 0), 0);
  
  // Add leave deductions
  this.calculations.totalDeductions += this.leaveDeductions.leaveDeductionAmount || 0;
  
  // Calculate gross salary
  this.calculations.grossSalary = this.basicSalary + this.calculations.totalAllowances;
  
  // Calculate net salary
  this.calculations.netSalary = this.calculations.grossSalary - this.calculations.totalDeductions;
  
  next();
});

// Static method to generate payroll for all employees
payrollSchema.statics.generateMonthlyPayroll = async function(month, year, generatedBy) {
  const User = require('./User');
  const employees = await User.find({ 
    status: 'active',
    role: { $in: ['employee'] }
  });

  const payrollRecords = [];

  for (const employee of employees) {
    // Check if payroll already exists
    const existingPayroll = await this.findOne({
      employeeId: employee._id,
      'payPeriod.month': month,
      'payPeriod.year': year
    });

    if (!existingPayroll) {
      const payroll = new this({
        employeeId: employee._id,
        payPeriod: { month, year },
        basicSalary: employee.jobDetails.salary.basic,
        allowances: {
          housing: employee.jobDetails.salary.allowances || 0
        },
        attendance: {
          workingDays: 22, // Default working days
          presentDays: 22  // Will be updated based on actual attendance
        },
        generatedBy
      });

      payrollRecords.push(payroll);
    }
  }

  if (payrollRecords.length > 0) {
    await this.insertMany(payrollRecords);
  }

  return payrollRecords;
};

// Instance method to calculate salary based on attendance
payrollSchema.methods.calculateSalaryByAttendance = function() {
  const attendanceRatio = this.attendance.presentDays / this.attendance.workingDays;
  const proportionalSalary = this.basicSalary * attendanceRatio;
  
  // Deduct for half days
  const halfDayDeduction = (this.basicSalary / this.attendance.workingDays) * (this.attendance.halfDays * 0.5);
  
  this.basicSalary = proportionalSalary - halfDayDeduction;
  return this.basicSalary;
};

module.exports = mongoose.model('Payroll', payrollSchema);
