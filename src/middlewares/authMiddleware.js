const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let principal = null;

    // Prefer explicit role from token payload when present.
    if (decoded.role === 'super_admin') {
      principal = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'user') {
      principal = await User.findById(decoded.id).select('-password');
    } else {
      // Fallback: try Admin first, then User.
      principal =
        (await Admin.findById(decoded.id).select('-password')) ||
        (await User.findById(decoded.id).select('-password'));
    }

    if (!principal) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Normalise role on the request, even if model doesn't have it stored.
    if (!principal.role && decoded.role) {
      principal.role = decoded.role;
    }

    req.user = principal;
    req.authRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

