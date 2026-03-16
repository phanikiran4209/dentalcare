const express = require('express');
const {
  login,
  verifyLoginOtp,
  signup,
  verifySignupOtp,
  forgotPassword,
  verifyForgotPassword,
} = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
} = require('../validators/authValidator');
const { createRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/login', createRateLimiter({ max: 10 }), validate(loginSchema), login);
router.post('/login/verify', validate(verifyOtpSchema), verifyLoginOtp);
router.post('/signup', validate(signupSchema), signup);
router.post('/signup/verify', validate(verifyOtpSchema), verifySignupOtp);
router.post('/forgot-password', createRateLimiter({ max: 5 }), validate(forgotPasswordSchema), forgotPassword);
router.post('/forgot-password/verify', validate(verifyForgotPasswordOtpSchema), verifyForgotPassword);

module.exports = router;

