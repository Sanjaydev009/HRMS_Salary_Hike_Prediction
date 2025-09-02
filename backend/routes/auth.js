const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Admin/HR only)
// @access  Private (Admin/HR)
router.post('/register', auth, async (req, res) => {
  try {
    // Only admin and HR can register new users
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin/HR can register new users.'
      });
    }

    const {
      employeeId, email, password, role, profile, jobDetails
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists.'
      });
    }

    // Create new user
    const user = new User({
      employeeId,
      email,
      password,
      role: role || 'employee',
      profile,
      jobDetails
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for: ${email} at ${new Date().toISOString()}`);

    // Validate input
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`Login failed: User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      console.log(`Login failed: Account not active for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account is not active. Please contact HR.'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    
    console.log(`Login successful for: ${email} (${user.role})`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          profile: user.profile,
          jobDetails: user.jobDetails
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('jobDetails.reportingManager', 'profile.firstName profile.lastName employeeId')
      .select('-password');

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    // Send password changed notification email
    try {
      const emailData = {
        fullName: `${user.profile.firstName} ${user.profile.lastName}`,
        email: user.email
      };
      await emailService.sendPasswordChangedEmail(emailData);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the password change if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    if (user.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Account is not active. Please contact HR.'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      const emailData = {
        fullName: `${user.profile.firstName} ${user.profile.lastName}`,
        email: user.email
      };
      
      const emailResult = await emailService.sendPasswordResetEmail(emailData, resetToken);
      
      if (emailResult.success) {
        res.status(200).json({
          success: true,
          message: 'Password reset email sent successfully'
        });
      } else {
        throw new Error(emailResult.error);
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Reset the token fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500).json({
        success: false,
        message: 'Error sending password reset email. Please try again.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and check if token hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.isFirstLogin = false;
    await user.save();

    // Send password changed confirmation email
    try {
      const emailData = {
        fullName: `${user.profile.firstName} ${user.profile.lastName}`,
        email: user.email
      };
      await emailService.sendPasswordChangedEmail(emailData);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the password reset if email fails
    }

    // Generate new token for immediate login
    const loginToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token: loginToken
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/first-login
// @desc    Handle first login password change
// @access  Private
router.post('/first-login', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.isFirstLogin) {
      return res.status(400).json({
        success: false,
        message: 'Password has already been changed'
      });
    }

    // Update password
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    // Send password changed notification email
    try {
      const emailData = {
        fullName: `${user.profile.firstName} ${user.profile.lastName}`,
        email: user.email
      };
      await emailService.sendPasswordChangedEmail(emailData);
    } catch (emailError) {
      console.error('Failed to send password changed email:', emailError);
      // Don't fail the password change if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. Welcome to HRMS!',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isFirstLogin: false
        }
      }
    });
  } catch (error) {
    console.error('First login password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
