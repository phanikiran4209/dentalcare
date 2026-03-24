const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let principal = null;

    if (decoded.role === 'super_admin') {
      principal = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'user') {
      principal = await User.findById(decoded.id).select('-password');
    } else {
      principal =
        (await Admin.findById(decoded.id).select('-password')) ||
        (await User.findById(decoded.id).select('-password'));
    }

    if (principal) {
      if (!principal.role && decoded.role) {
        principal.role = decoded.role;
      }
      req.user = principal;
      req.authRole = decoded.role;
    }
  } catch (error) {
    // Ignore error, proceed as unauthorized
  }
  next();
};

module.exports = optionalAuthMiddleware;
