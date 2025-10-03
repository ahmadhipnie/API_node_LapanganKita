const jwt = require('jsonwebtoken');

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token diperlukan'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware for role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Convert single role to array for uniform processing
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}, but you have: ${req.user.role}`
      });
    }

    next();
  };
};

// Middleware for optional authentication (won't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};