const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const Certification = require('../models/Certification');
const User = require('../models/User');

// Configure multer for certificate uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/certifications');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cert-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF and image files
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed!'), false);
    }
  }
});

// @route   POST /api/certifications/upload
// @desc    Upload a new certification
// @access  Private (Employee only)
router.post('/upload', auth, upload.single('certificateFile'), async (req, res) => {
  try {
    const {
      name,
      issuingOrganization,
      issueDate,
      expiryDate,
      credentialId,
      verificationUrl,
      skills,
      category
    } = req.body;

    // Validate required fields
    if (!name || !issuingOrganization || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, issuing organization, and issue date are required'
      });
    }

    const certificationData = {
      employeeId: req.user._id,
      name,
      issuingOrganization,
      issueDate: new Date(issueDate),
      category: category || 'Technical'
    };

    if (expiryDate) certificationData.expiryDate = new Date(expiryDate);
    if (credentialId) certificationData.credentialId = credentialId;
    if (verificationUrl) certificationData.verificationUrl = verificationUrl;
    if (skills) certificationData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (req.file) certificationData.certificateFile = `/uploads/certifications/${req.file.filename}`;

    const certification = new Certification(certificationData);
    await certification.save();

    res.status(201).json({
      success: true,
      message: 'Certification uploaded successfully',
      data: {
        certification
      }
    });
  } catch (error) {
    console.error('Certification upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading certification',
      error: error.message
    });
  }
});

// @route   GET /api/certifications/my
// @desc    Get employee's certifications
// @access  Private (Employee only)
router.get('/my', auth, async (req, res) => {
  try {
    const certifications = await Certification.find({ employeeId: req.user._id })
      .sort({ createdAt: -1 });

    // Calculate certification statistics
    const stats = {
      total: certifications.length,
      verified: certifications.filter(cert => cert.verified).length,
      expiringSoon: certifications.filter(cert => {
        if (!cert.expiryDate) return false;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return cert.expiryDate <= thirtyDaysFromNow;
      }).length,
      categories: {}
    };

    // Count by category
    certifications.forEach(cert => {
      stats.categories[cert.category] = (stats.categories[cert.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        certifications,
        stats
      }
    });
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certifications',
      error: error.message
    });
  }
});

// @route   PUT /api/certifications/:id
// @desc    Update a certification
// @access  Private (Employee only)
router.put('/:id', auth, async (req, res) => {
  try {
    const certification = await Certification.findOne({
      _id: req.params.id,
      employeeId: req.user._id
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    const updateData = { ...req.body };
    if (updateData.issueDate) updateData.issueDate = new Date(updateData.issueDate);
    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);
    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map(s => s.trim());
    }

    const updatedCertification = await Certification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Certification updated successfully',
      data: {
        certification: updatedCertification
      }
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating certification',
      error: error.message
    });
  }
});

// @route   DELETE /api/certifications/:id
// @desc    Delete a certification
// @access  Private (Employee only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const certification = await Certification.findOne({
      _id: req.params.id,
      employeeId: req.user._id
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Delete file if it exists
    if (certification.certificateFile) {
      const filePath = path.join(__dirname, '..', certification.certificateFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Certification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting certification',
      error: error.message
    });
  }
});

// @route   GET /api/certifications/analytics
// @desc    Get certification analytics for salary prediction
// @access  Private (Employee only)
router.get('/analytics', auth, async (req, res) => {
  try {
    const certifications = await Certification.find({ employeeId: req.user._id });
    
    // Calculate certification score for salary prediction
    const certificationScore = {
      totalCertifications: certifications.length,
      verifiedCertifications: certifications.filter(cert => cert.verified).length,
      technicalCertifications: certifications.filter(cert => cert.category === 'Technical').length,
      managementCertifications: certifications.filter(cert => cert.category === 'Management').length,
      recentCertifications: certifications.filter(cert => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return new Date(cert.issueDate) >= twoYearsAgo;
      }).length,
      skillsCount: [...new Set(certifications.flatMap(cert => cert.skills || []))].length
    };

    // Calculate overall certification value (0-100)
    let certificationValue = 0;
    certificationValue += Math.min(certificationScore.totalCertifications * 5, 25); // Max 25 points
    certificationValue += Math.min(certificationScore.verifiedCertifications * 8, 30); // Max 30 points
    certificationValue += Math.min(certificationScore.technicalCertifications * 6, 20); // Max 20 points
    certificationValue += Math.min(certificationScore.managementCertifications * 8, 15); // Max 15 points
    certificationValue += Math.min(certificationScore.recentCertifications * 5, 10); // Max 10 points

    res.json({
      success: true,
      data: {
        certificationScore,
        certificationValue: Math.round(certificationValue),
        recommendations: [
          certificationScore.verifiedCertifications < 2 ? "Get more certifications verified to increase salary potential" : null,
          certificationScore.technicalCertifications < 3 ? "Consider adding more technical certifications" : null,
          certificationScore.recentCertifications < 2 ? "Recent certifications show continuous learning" : null
        ].filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Certification analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certification analytics',
      error: error.message
    });
  }
});

// @route   GET /api/certifications/salary-prediction
// @desc    Get salary prediction based on certifications
// @access  Private
router.get('/salary-prediction', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const certifications = await Certification.find({ 
      employeeId: req.user._id,
      status: 'Active'
    });

    const currentSalary = user.jobDetails?.salary?.basic || 600000; // Default 6 Lakhs INR
    
    // Calculate total impact using our new model
    let totalImpact = 0;
    let categoryBreakdown = {};
    
    certifications.forEach(cert => {
      if (cert.calculateImpact) {
        cert.calculateImpact(); // Ensure latest calculation
      }
      const impact = cert.salaryImpact || 0;
      totalImpact += impact;
      
      if (!categoryBreakdown[cert.category]) {
        categoryBreakdown[cert.category] = {
          count: 0,
          impact: 0,
          certifications: []
        };
      }
      
      categoryBreakdown[cert.category].count += 1;
      categoryBreakdown[cert.category].impact += impact;
      categoryBreakdown[cert.category].certifications.push({
        name: cert.name,
        skillLevel: cert.skillLevel || 'Intermediate',
        impact: impact
      });
    });

    // Calculate predicted salary
    const salaryIncreasePercentage = Math.min(totalImpact, 30); // Cap at 30%
    const predictedSalary = currentSalary * (1 + salaryIncreasePercentage / 100);
    const salaryIncrease = predictedSalary - currentSalary;

    // Generate recommendations
    const recommendations = [];
    
    if (certifications.length < 3) {
      recommendations.push({
        type: 'certification_count',
        message: 'Consider adding more certifications to increase your salary potential',
        impact: 'Medium'
      });
    }
    
    if (!categoryBreakdown['Leadership']) {
      recommendations.push({
        type: 'leadership',
        message: 'Leadership certifications can significantly boost your salary prospects',
        impact: 'High'
      });
    }
    
    if (!categoryBreakdown['Management']) {
      recommendations.push({
        type: 'management',
        message: 'Management certifications are highly valued for career advancement',
        impact: 'High'
      });
    }

    res.json({
      success: true,
      data: {
        currentSalary,
        predictedSalary: Math.round(predictedSalary),
        salaryIncrease: Math.round(salaryIncrease),
        increasePercentage: Math.round(salaryIncreasePercentage * 100) / 100,
        totalCertifications: certifications.length,
        categoryBreakdown,
        recommendations,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating salary prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating salary prediction',
      error: error.message
    });
  }
});

module.exports = router;
