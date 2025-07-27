const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees (role-based access)
// @access  Private (authenticated users only)
router.get('/', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const { department, designation, status, search, page = 1, limit = 10 } = req.query;
    
    let query = { role: { $in: ['employee'] } };
    
    // Role-based filtering
    if (userRole === 'employee') {
      // Employees can only see their own profile
      query._id = userId;
    }
    // HR and Admin can see all employees (no additional filter)
    
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

    const employees = await User.find(query)
      .populate('jobDetails.reportingManager', 'profile.firstName profile.lastName employeeId')
      .select('-password')
      .sort({ 'profile.firstName': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

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
// @desc    Create new employee
// @access  Public (temporarily for testing)
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      employeeId,
      email,
      password = 'defaultPassword123',
      role = 'employee',
      profile,
      jobDetails,
      emergencyContact
    } = req.body;

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

    // Create new employee
    const employee = new User({
      employeeId,
      email,
      password,
      role,
      profile,
      jobDetails,
      emergencyContact,
      status: 'active'
    });

    await employee.save();

    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee: employeeResponse }
    });
  } catch (error) {
    console.error('Create employee error:', error);
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

module.exports = router;
