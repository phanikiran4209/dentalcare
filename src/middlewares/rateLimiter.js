const rateLimit = require('express-rate-limit');

const createRateLimiter = (options = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

module.exports = { createRateLimiter };

