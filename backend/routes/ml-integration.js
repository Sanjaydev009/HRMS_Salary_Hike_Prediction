const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Certification = require('../models/Certification');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @route   POST /api/ml/train
// @desc    Train ML model with current data
// @access  Private (Admin only)
router.post('/train', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Fetch all employees
    const employees = await User.find({ role: { $in: ['employee', 'hr'] } })
      .select('-password')
      .lean();

    // Fetch all attendance records (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const attendanceRecords = await Attendance.find({
      date: { $gte: sixMonthsAgo }
    }).lean();

    // Fetch all certifications
    const certifications = await Certification.find().lean();

    // Prepare training data
    const trainingData = {
      employees: employees.map(emp => ({
        employeeId: emp._id.toString(),
        department: emp.department || 'Unknown',
        designation: emp.designation || 'Unknown',
        experience_years: emp.experience || 0,
        performance_rating: emp.performanceRating || 3.5,
        education_level: emp.education || 'Bachelor',
        location: emp.location || 'Office',
        current_salary: emp.salary || 50000,
        project_completion_rate: emp.projectCompletionRate || 85,
        team_size_managed: emp.teamSize || 0,
        revenue_generated: emp.revenueGenerated || 0
      })),
      attendance_data: attendanceRecords.map(att => ({
        employeeId: att.employeeId.toString(),
        date: att.date.toISOString(),
        status: att.status,
        totalHours: att.totalHours,
        location: att.location
      })),
      certification_data: certifications.map(cert => ({
        employeeId: cert.employeeId.toString(),
        name: cert.name,
        issuingOrganization: cert.issuingOrganization,
        issueDate: cert.issueDate.toISOString(),
        expirationDate: cert.expirationDate ? cert.expirationDate.toISOString() : null,
        category: cert.category,
        skillLevel: cert.skillLevel,
        status: cert.status,
        impactScore: cert.impactScore || 0
      }))
    };

    // Send training request to ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/train`, trainingData, {
      timeout: 120000 // 2 minute timeout for training
    });

    res.json({
      message: 'ML model training initiated successfully',
      training_result: mlResponse.data,
      data_summary: {
        employees: trainingData.employees.length,
        attendance_records: trainingData.attendance_data.length,
        certifications: trainingData.certification_data.length
      }
    });

  } catch (error) {
    console.error('ML training error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'ML service unavailable. Please ensure the ML service is running.',
        error: 'Service connection failed'
      });
    }

    res.status(500).json({ 
      message: 'Failed to train ML model',
      error: error.message 
    });
  }
});

// @route   GET /api/ml/predict/:employeeId
// @desc    Get salary prediction for specific employee
// @access  Private
router.get('/predict/:employeeId', auth, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user can access this employee's data
    if (req.user.role === 'employee' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch employee data
    const employee = await User.findById(employeeId).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Fetch employee's attendance (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
      date: { $gte: threeMonthsAgo }
    }).lean();

    // Fetch employee's certifications
    const certifications = await Certification.find({ employeeId: employeeId }).lean();

    // Calculate attendance metrics
    const attendanceMetrics = calculateAttendanceMetrics(attendanceRecords);
    
    // Calculate certification metrics
    const certificationMetrics = calculateCertificationMetrics(certifications);

    // Prepare prediction request
    const predictionData = {
      employee_data: {
        department: employee.department || 'Unknown',
        designation: employee.designation || 'Unknown',
        experience_years: employee.experience || 0,
        performance_rating: employee.performanceRating || 3.5,
        education_level: employee.education || 'Bachelor',
        location: employee.location || 'Office',
        current_salary: employee.salary || 50000,
        attendance_metrics: attendanceMetrics,
        certification_data: certificationMetrics,
        project_completion_rate: employee.projectCompletionRate || 85,
        team_size_managed: employee.teamSize || 0,
        revenue_generated: employee.revenueGenerated || 0
      }
    };

    // Get prediction from ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, predictionData);

    res.json({
      employee: {
        id: employee._id,
        name: employee.name,
        department: employee.department,
        designation: employee.designation,
        current_salary: employee.salary
      },
      prediction: mlResponse.data,
      data_sources: {
        attendance_records: attendanceRecords.length,
        certifications: certifications.length
      }
    });

  } catch (error) {
    console.error('ML prediction error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        message: 'ML service unavailable',
        error: 'Service connection failed'
      });
    }

    res.status(500).json({ 
      message: 'Failed to get salary prediction',
      error: error.message 
    });
  }
});

// @route   GET /api/ml/status
// @desc    Get ML service status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const mlResponse = await axios.get(`${ML_SERVICE_URL}/model/status`);
    res.json({
      ml_service_status: 'connected',
      model_info: mlResponse.data
    });
  } catch (error) {
    res.status(503).json({
      ml_service_status: 'disconnected',
      error: 'ML service unavailable'
    });
  }
});

// @route   GET /api/ml/analytics
// @desc    Get salary insights and analytics
// @access  Private (HR/Admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Access denied. HR/Admin only.' });
    }

    const mlResponse = await axios.get(`${ML_SERVICE_URL}/analytics/salary-insights`);
    
    // Add organization-specific insights
    const totalEmployees = await User.countDocuments({ role: { $in: ['employee', 'hr'] } });
    const avgSalary = await User.aggregate([
      { $match: { role: { $in: ['employee', 'hr'] }, salary: { $exists: true } } },
      { $group: { _id: null, avgSalary: { $avg: '$salary' } } }
    ]);

    res.json({
      organization_stats: {
        total_employees: totalEmployees,
        average_salary: avgSalary[0]?.avgSalary || 0
      },
      ml_insights: mlResponse.data
    });

  } catch (error) {
    console.error('ML analytics error:', error.message);
    res.status(500).json({ 
      message: 'Failed to get analytics',
      error: error.message 
    });
  }
});

// @route   POST /api/ml/batch-predict
// @desc    Get salary predictions for multiple employees
// @access  Private (HR/Admin only)
router.post('/batch-predict', auth, async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Access denied. HR/Admin only.' });
    }

    const { employeeIds } = req.body;
    
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'Invalid employee IDs array' });
    }

    const predictions = [];
    
    for (const employeeId of employeeIds) {
      try {
        // This could be optimized to make parallel requests
        const prediction = await getSinglePrediction(employeeId);
        predictions.push(prediction);
      } catch (error) {
        predictions.push({
          employeeId,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Batch predictions completed',
      predictions,
      summary: {
        total_requested: employeeIds.length,
        successful: predictions.filter(p => !p.error).length,
        failed: predictions.filter(p => p.error).length
      }
    });

  } catch (error) {
    console.error('Batch prediction error:', error.message);
    res.status(500).json({ 
      message: 'Failed to process batch predictions',
      error: error.message 
    });
  }
});

// Helper Functions

function calculateAttendanceMetrics(attendanceRecords) {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return {
      attendance_rate: 80.0,
      average_hours_per_day: 8.0,
      punctuality_score: 85.0,
      remote_work_percentage: 25.0,
      overtime_hours_monthly: 10.0,
      consistency_score: 75.0
    };
  }

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'Late').length;
  const remoteDays = attendanceRecords.filter(r => r.location === 'Remote').length;
  
  const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 8), 0);
  const overtimeHours = attendanceRecords.reduce((sum, r) => sum + Math.max(0, (r.totalHours || 8) - 8), 0);
  
  const attendanceRate = (presentDays / totalDays) * 100;
  const avgHours = totalHours / totalDays;
  const punctualityScore = ((totalDays - lateDays) / totalDays) * 100;
  const remotePercentage = (remoteDays / totalDays) * 100;
  const monthlyOvertime = (overtimeHours / totalDays) * 30;
  
  // Calculate consistency
  const hoursList = attendanceRecords.map(r => r.totalHours || 8);
  const hoursVariance = hoursList.length > 1 ? calculateVariance(hoursList) : 0;
  const consistencyScore = Math.max(0, 100 - (hoursVariance * 10));

  return {
    attendance_rate: Math.min(100, Math.max(0, attendanceRate)),
    average_hours_per_day: Math.max(0, avgHours),
    punctuality_score: Math.min(100, Math.max(0, punctualityScore)),
    remote_work_percentage: Math.min(100, Math.max(0, remotePercentage)),
    overtime_hours_monthly: Math.max(0, monthlyOvertime),
    consistency_score: Math.min(100, Math.max(0, consistencyScore))
  };
}

function calculateCertificationMetrics(certifications) {
  if (!certifications || certifications.length === 0) {
    return {
      total_certifications: 0,
      technical_certifications: 0,
      management_certifications: 0,
      leadership_certifications: 0,
      certification_impact_score: 0.0,
      recent_certifications: 0,
      expired_certifications: 0,
      certification_diversity_score: 0.0
    };
  }

  const technical = certifications.filter(c => c.category === 'Technical').length;
  const management = certifications.filter(c => c.category === 'Management').length;
  const leadership = certifications.filter(c => c.category === 'Leadership').length;
  
  const totalImpact = certifications.reduce((sum, c) => sum + (c.impactScore || 0), 0);
  
  // Recent certifications (last 12 months)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recent = certifications.filter(c => 
    c.issueDate && new Date(c.issueDate) >= oneYearAgo
  ).length;
  
  // Expired certifications
  const now = new Date();
  const expired = certifications.filter(c => 
    c.expirationDate && new Date(c.expirationDate) < now
  ).length;
  
  // Diversity score
  const categories = new Set(certifications.map(c => c.category));
  const diversityScore = categories.size * 25; // 25 points per unique category

  return {
    total_certifications: certifications.length,
    technical_certifications: technical,
    management_certifications: management,
    leadership_certifications: leadership,
    certification_impact_score: totalImpact,
    recent_certifications: recent,
    expired_certifications: expired,
    certification_diversity_score: Math.min(100, diversityScore)
  };
}

function calculateVariance(numbers) {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}

async function getSinglePrediction(employeeId) {
  // This is a helper function for batch predictions
  // Implementation would be similar to the individual predict endpoint
  // but optimized for batch processing
  return { employeeId, prediction: 'placeholder' };
}

module.exports = router;
