const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('employeeId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // attach user and permissions
    const roleDoc = await Role.findOne({ name: user.role });
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId?._id || user.employeeId || null,
      permissions: roleDoc ? roleDoc.permissions : []
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user found.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Permission-based guard
const permit = (...perms) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user found.' });
    }
    const userPerms = req.user.permissions || [];
    const ok = perms.some(p => userPerms.includes(p));
    if (!ok) {
      return res.status(403).json({ message: `Access denied. Missing permission: ${perms.join(' or ')}` });
    }
    next();
  };
};

module.exports = { auth, authorize, permit };
