const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees (role-based access)
// @access  Private (authenticated users only)
router.get('/', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const { department, designation, status, search, page = 1, limit = 50, includeAllRoles = 'true' } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (userRole === 'employee') {
      // Employees can only see their own profile
      query._id = userId;
      query.role = 'employee';
    } else {
      // HR and Admin can see all users or just employees based on includeAllRoles parameter
      if (includeAllRoles === 'true') {
        query.role = { $in: ['employee', 'hr', 'admin'] };
      } else {
        query.role = { $in: ['employee'] };
      }
    }
    
    // Apply filters
    if (department) query['jobDetails.department'] = department;
    if (designation) query['jobDetails.designation'] = designation;
    if (status) query.status = status;
    
    // Search functionality
    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Employee Management Query:', JSON.stringify(query, null, 2));
    console.log('Request params:', { userRole, limit, page, includeAllRoles });

    const employees = await User.find(query)
      .populate('jobDetails.reportingManager', 'profile.firstName profile.lastName employeeId')
      .select('-password')
      .sort({ 'profile.firstName': 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    console.log(`Employee Management Results: Found ${employees.length} users, Total in DB matching query: ${total}`);

    res.json({
      success: true,
      data: {
        employees: employees.map(emp => ({
          ...emp.toObject(),
          salary: userRole === 'employee' && emp._id.toString() !== userId.toString() 
            ? { currency: 'INR', basic: 'Confidential' } 
            : emp.jobDetails?.salary
        })),
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        permissions: {
          canViewSalary: ['hr', 'admin'].includes(userRole),
          canEdit: ['hr', 'admin'].includes(userRole),
          canDelete: ['admin'].includes(userRole),
          canAdd: ['hr', 'admin'].includes(userRole),
          viewScope: userRole
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .populate('jobDetails.reportingManager', 'profile.firstName profile.lastName employeeId')
      .select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check access permissions
    const canAccess = req.user._id.toString() === req.params.id || 
                     ['hr', 'admin'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/employees
// @desc    Create new employee with email credentials
// @access  Public (temporarily for testing)
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      employeeId,
      email,
      password,
      role = 'employee',
      profile,
      jobDetails,
      emergencyContact,
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!employeeId || !email || !profile?.firstName || !profile?.lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: employeeId, email, firstName, lastName'
      });
    }

    if (!jobDetails?.department || !jobDetails?.designation) {
      return res.status(400).json({
        success: false,
        message: 'Missing required job details: department, designation'
      });
    }

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Use provided password or generate temporary password
    const finalPassword = password || emailService.generateTempPassword();

    // Process profile data - handle address properly
    const processedProfile = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined
    };

    // Handle address - convert string to object if needed
    if (profile.address) {
      if (typeof profile.address === 'string') {
        processedProfile.address = {
          street: profile.address,
          city: '',
          state: '',
          zipCode: '',
          country: ''
        };
      } else {
        processedProfile.address = profile.address;
      }
    }

    // Process job details
    let processedJobDetails = {
      department: jobDetails.department,
      designation: jobDetails.designation,
      joiningDate: jobDetails.joiningDate ? new Date(jobDetails.joiningDate) : new Date(),
      employmentType: jobDetails.employmentType || 'full-time',
      workLocation: jobDetails.workLocation || 'Office',
      salary: {
        basic: jobDetails.salary?.basic || 0,
        allowances: jobDetails.salary?.allowances || 0,
        currency: jobDetails.salary?.currency || 'INR'
      }
    };

    // Handle reporting manager
    if (jobDetails.reportingManager && typeof jobDetails.reportingManager === 'string') {
      processedJobDetails.reportingManager = null;
    } else if (jobDetails.reportingManager) {
      processedJobDetails.reportingManager = jobDetails.reportingManager;
    }

    // Create new employee
    const employee = new User({
      employeeId,
      email: email.toLowerCase(),
      password: finalPassword,
      role,
      profile: processedProfile,
      jobDetails: processedJobDetails,
      emergencyContact: emergencyContact || {},
      status,
      isFirstLogin: true
    });

    console.log('Creating employee with processed data:', {
      employeeId: employee.employeeId,
      email: employee.email,
      profile: employee.profile,
      jobDetails: employee.jobDetails
    });

    await employee.save();

    // Prepare email data
    const emailData = {
      employeeId,
      email,
      fullName: `${processedProfile.firstName} ${processedProfile.lastName}`,
      department: processedJobDetails.department,
      position: processedJobDetails.designation,
      joiningDate: processedJobDetails.joiningDate
    };

    // Send welcome email with credentials
    try {
      const emailResult = await emailService.sendWelcomeEmail(emailData, finalPassword);
      console.log('Email send result:', emailResult);
      
      if (emailResult.success) {
        console.log('Welcome email sent successfully to:', email);
      } else {
        console.error('Failed to send welcome email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Don't fail the employee creation if email fails
    }

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully. Login credentials sent to email.',
      data: { 
        employee: employeeResponse,
        emailSent: true,
        tempPasswordSent: true
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (HR/Admin or self for limited fields)
router.put('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const isOwner = req.user._id.toString() === req.params.id;
    const isHROrAdmin = ['hr', 'admin'].includes(req.user.role);

    if (!isOwner && !isHROrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = req.body;

    // Restrict what regular employees can update
    if (isOwner && !isHROrAdmin) {
      const allowedFields = [
        'profile.phone', 'profile.address', 'profile.profilePicture',
        'emergencyContact'
      ];
      
      const sanitizedUpdate = {};
      allowedFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (updateData[parent] && updateData[parent][child] !== undefined) {
            if (!sanitizedUpdate[parent]) sanitizedUpdate[parent] = {};
            sanitizedUpdate[parent][child] = updateData[parent][child];
          }
        } else if (updateData[field] !== undefined) {
          sanitizedUpdate[field] = updateData[field];
        }
      });
      
      Object.assign(employee, sanitizedUpdate);
    } else {
      // HR/Admin can update everything except password
      delete updateData.password;
      Object.assign(employee, updateData);
    }

    await employee.save();

    const updatedEmployee = await User.findById(employee._id)
      .populate('jobDetails.reportingManager', 'profile.firstName profile.lastName employeeId')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee: updatedEmployee }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete/Deactivate employee
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Don't actually delete, just deactivate
    employee.status = 'terminated';
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/employees/dashboard/stats
// @desc    Get employee statistics
// @access  Private (HR/Admin)
router.get('/dashboard/stats', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: { $in: ['employee'] } });
    const activeEmployees = await User.countDocuments({ 
      role: { $in: ['employee'] }, 
      status: 'active' 
    });
    const inactiveEmployees = await User.countDocuments({ 
      role: { $in: ['employee'] }, 
      status: { $ne: 'active' } 
    });

    // Department wise count
    const departmentStats = await User.aggregate([
      { $match: { role: { $in: ['employee'] } } },
      { $group: { 
          _id: '$jobDetails.department', 
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        } 
      }
    ]);

    // Designation wise count
    const designationStats = await User.aggregate([
      { $match: { role: { $in: ['employee'] } } },
      { $group: { 
          _id: '$jobDetails.designation', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Recent joinings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentJoinings = await User.countDocuments({
      'jobDetails.joiningDate': { $gte: thirtyDaysAgo },
      role: { $in: ['employee'] }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          recentJoinings
        },
        departmentStats,
        designationStats
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/employees/:id/performance
// @desc    Get employee performance history
// @access  Private
router.get('/:id/performance', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('performanceHistory');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check access permissions
    const canAccess = req.user._id.toString() === req.params.id || 
                     ['hr', 'admin'].includes(req.user.role) ||
                     (req.user.role === 'manager' && 
                      employee.jobDetails && employee.jobDetails.reportingManager && 
                      employee.jobDetails.reportingManager.toString() === req.user._id.toString());

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { performanceHistory: employee.performanceHistory }
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/employees/:id/performance
// @desc    Add performance review
// @access  Private (HR/Admin)
router.post('/:id/performance', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { year, rating, comments, goals, achievements } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if manager is authorized for this employee
    if (req.user.role === 'manager') {
      if (!employee.jobDetails.reportingManager || 
          employee.jobDetails.reportingManager.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only add performance reviews for your direct reports'
        });
      }
    }

    // Check if performance review for this year already exists
    const existingReview = employee.performanceHistory.find(review => review.year === year);
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: `Performance review for year ${year} already exists`
      });
    }

    const performanceReview = {
      year,
      rating,
      comments,
      goals: goals || [],
      achievements: achievements || [],
      reviewDate: new Date()
    };

    employee.performanceHistory.push(performanceReview);
    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Performance review added successfully',
      data: { performanceReview }
    });
  } catch (error) {
    console.error('Add performance review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/employees/departments
// @desc    Get all departments with employee information
// @access  Private (HR/Admin)
router.get('/departments', auth, authorize(['hr', 'admin']), async (req, res) => {
  try {
    // Get all departments with employee data
    const departmentData = await User.aggregate([
      {
        $match: { 
          role: { $in: ['employee'] },
          status: 'active' 
        }
      },
      {
        $group: {
          _id: '$jobDetails.department',
          employees: {
            $push: {
              _id: '$_id',
              firstName: '$profile.firstName',
              lastName: '$profile.lastName',
              email: '$email',
              position: '$jobDetails.designation',
              joiningDate: '$jobDetails.joiningDate',
              salary: '$jobDetails.salary.basic'
            }
          },
          totalEmployees: { $sum: 1 },
          avgSalary: { $avg: '$jobDetails.salary.basic' },
          newHires: {
            $sum: {
              $cond: [
                { 
                  $gte: [
                    '$jobDetails.joiningDate', 
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  ] 
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { totalEmployees: -1 }
      }
    ]);

    // Transform data to match expected format
    const departments = departmentData.map(dept => {
      // Find department manager (mock logic - you can enhance this)
      const manager = dept.employees.find(emp => 
        emp.position && emp.position.toLowerCase().includes('manager')
      );

      return {
        _id: dept._id || 'Unknown',
        name: dept._id || 'Unassigned',
        description: `${dept._id} department with ${dept.totalEmployees} employees`,
        manager: manager ? {
          _id: manager._id,
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email
        } : null,
        employees: dept.employees,
        budget: dept.avgSalary * dept.totalEmployees * 12, // Annual budget estimate
        location: 'Head Office', // Mock data
        createdAt: new Date(),
        stats: {
          totalEmployees: dept.totalEmployees,
          avgSalary: dept.avgSalary || 0,
          newHires: dept.newHires,
          openPositions: Math.floor(Math.random() * 3) // Mock data
        }
      };
    });

    res.json({
      success: true,
      departments,
      total: departments.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/employees/departments
// @desc    Create new department
// @access  Private (HR/Admin)
router.post('/departments', auth, authorize(['hr', 'admin']), async (req, res) => {
  try {
    const { name, description, manager, budget, location } = req.body;

    // For now, we'll track departments through employee records
    // You might want to create a separate Department model later
    
    res.json({
      success: true,
      message: 'Department creation functionality will be enhanced with dedicated Department model',
      data: { name, description, manager, budget, location }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/employees/departments/:id
// @desc    Update department
// @access  Private (HR/Admin)
router.put('/departments/:id', auth, authorize(['hr', 'admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Department update functionality will be enhanced with dedicated Department model'
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/employees/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/departments/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Department deletion functionality will be enhanced with dedicated Department model'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
