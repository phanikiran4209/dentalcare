const rateLimit = require('express-rate-limit');

// 🔹 General API limiter (for normal routes)
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // increased limit
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 Login limiter (strict but user-friendly)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // increased for development
  skipSuccessfulRequests: true, // ✅ IMPORTANT
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 Optional: OTP limiter (very strict)
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait before trying again.",
  },
});

// 🔹 Reusable function (your original style)
const createRateLimiter = (options = {}) =>
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200, // increased default
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

module.exports = {
  apiLimiter,
  loginLimiter,
  otpLimiter,
  createRateLimiter,
};