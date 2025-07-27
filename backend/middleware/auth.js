const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is not active.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please login first.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Check if user is the owner of the resource or has admin/hr privileges
const ownerOrAdmin = async (req, res, next) => {
  try {
    const resourceOwnerId = req.params.id || req.params.employeeId || req.body.employeeId;
    
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      return next();
    }

    if (req.user._id.toString() === resourceOwnerId) {
      return next();
    }

    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Insufficient permissions.' 
    });
  } catch (error) {
    console.error('OwnerOrAdmin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authorization check failed.' 
    });
  }
};

module.exports = {
  auth,
  authorize,
  ownerOrAdmin
};
