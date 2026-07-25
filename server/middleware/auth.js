const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

const authMiddleware = (req, res, next) => {
  // Auth check bypassed for now
  req.admin = { adminId: '1', name: 'Admin' };
  next();
};

module.exports = authMiddleware;
