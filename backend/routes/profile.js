const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/profile/upload-photo
// @desc    Upload profile photo
// @access  Private (Employee only)
router.post('/upload-photo', auth, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Update user profile with new photo path
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    
    await User.findByIdAndUpdate(req.user._id, {
      'profile.profilePicture': photoPath
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePicture: photoPath
      }
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile photo',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/update
// @desc    Update employee profile
// @access  Private (Employee only)
router.put('/update', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      emergencyContact,
      skills,
      bio
    } = req.body;

    const updateData = {};
    if (firstName) updateData['profile.firstName'] = firstName;
    if (lastName) updateData['profile.lastName'] = lastName;
    if (phone) updateData['profile.phone'] = phone;
    if (dateOfBirth) updateData['profile.dateOfBirth'] = new Date(dateOfBirth);
    if (address) updateData['profile.address'] = address;
    if (emergencyContact) updateData['profile.emergencyContact'] = emergencyContact;
    if (skills) updateData['profile.skills'] = skills;
    if (bio) updateData['profile.bio'] = bio;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @route   GET /api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// @route   GET /api/profile/emergency-contacts
// @desc    Get user's emergency contacts
// @access  Private
router.get('/emergency-contacts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('emergencyContact');
    
    res.json({
      success: true,
      data: {
        emergencyContact: user.emergencyContact || null
      }
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/emergency-contacts
// @desc    Update user's emergency contacts
// @access  Private
router.put('/emergency-contacts', auth, async (req, res) => {
  try {
    const { name, relationship, phone, email } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, relationship, and phone are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        emergencyContact: {
          name,
          relationship,
          phone,
          email: email || ''
        }
      },
      { new: true }
    ).select('emergencyContact');

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: {
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating emergency contacts',
      error: error.message
    });
  }
});

// @route   GET /api/profile/documents
// @desc    Get user's documents
// @access  Private
router.get('/documents', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('documents');
    
    res.json({
      success: true,
      data: {
        documents: user.documents || []
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
});

// @route   POST /api/profile/documents
// @desc    Upload a new document
// @access  Private
router.post('/documents', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type, name } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        success: false,
        message: 'Document type and name are required'
      });
    }

    const documentData = {
      type,
      name,
      url: `/uploads/profiles/${req.file.filename}`,
      uploadDate: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          documents: documentData
        }
      },
      { new: true }
    ).select('documents');

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: documentData,
        documents: user.documents
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
});

// @route   DELETE /api/profile/documents/:documentId
// @desc    Delete a document
// @access  Private
router.delete('/documents/:documentId', auth, async (req, res) => {
  try {
    const { documentId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          documents: { _id: documentId }
        }
      },
      { new: true }
    ).select('documents');

    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: {
        documents: user.documents
      }
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
});

// @route   GET /api/profile/bank-details
// @desc    Get user's bank details
// @access  Private
router.get('/bank-details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('profile.bankDetails');
    
    res.json({
      success: true,
      data: {
        bankDetails: user.profile?.bankDetails || null
      }
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank details',
      error: error.message
    });
  }
});

// @route   PUT /api/profile/bank-details
// @desc    Update user's bank details
// @access  Private
router.put('/bank-details', auth, async (req, res) => {
  try {
    const {
      accountHolderName,
      bankName,
      accountNumber,
      routingNumber,
      accountType,
      branchCode,
      swiftCode
    } = req.body;

    if (!accountHolderName || !bankName || !accountNumber || !routingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account holder name, bank name, account number, and routing number are required'
      });
    }

    const bankDetails = {
      accountHolderName,
      bankName,
      accountNumber,
      routingNumber,
      accountType: accountType || 'checking',
      branchCode: branchCode || '',
      swiftCode: swiftCode || '',
      isVerified: false, // Always set to false when updating
      lastUpdated: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profile.bankDetails': bankDetails
      },
      { new: true }
    ).select('profile.bankDetails');

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      data: {
        bankDetails: user.profile.bankDetails
      }
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank details',
      error: error.message
    });
  }
});

module.exports = router;
