const Admin = require('../models/Admin');

const adminMiddleware = async (req, res, next) => {
  // Must at least be authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // If there is NO admin in the system yet, allow any authenticated user.
  const hasAnyAdmin = await Admin.exists({});
  if (!hasAnyAdmin) {
    return next();
  }

  // Once at least one admin exists, enforce super_admin role for admin routes.
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  next();
};

module.exports = adminMiddleware;

