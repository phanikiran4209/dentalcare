const Admin = require('../models/Admin');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { sendEmail } = require('../services/emailService');
const generateUniqueId = require('generate-unique-id');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

const generateAdminAccessCode = () => {
  // 12 chars, URL-safe-ish, uppercase for easy typing
  return crypto.randomBytes(9).toString('base64url').slice(0, 12).toUpperCase();
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // email, mobileNumber or username
    const normalizedIdentifier = String(identifier || '').trim();
    const lowerIdentifier = normalizedIdentifier.toLowerCase();

    // Admin login (email-based)
    const admin = await Admin.findOne({ email: lowerIdentifier });
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(
        { id: admin._id, role: admin.role, adminAccessCode: admin.adminAccessCode },
        '1d'
      );

      return res.json({
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          adminAccessCode: admin.adminAccessCode,
        },
      });
    }

    // User login (email/mobile/username) → OTP verification
    const user = await User.findOne({
      $or: [
        { email: lowerIdentifier },
        { mobileNumber: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
       return res.status(403).json({ message: 'User not verified. Please verify using OTP.' });
    }

    const isMatchUser = await user.comparePassword(password);
    if (!isMatchUser) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    let emailSent = true;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Login OTP for Dental Clinic',
        html: `<h3>Your login OTP</h3><p>Your 6-digit OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });
    } catch (err) {
      emailSent = false;
      logger.error('Login OTP email failed', {
        message: err.message,
        code: err.code,
        responseCode: err.responseCode,
      });
    }

    res.json({
      message: 'OTP generated. Please verify to login.',
      emailSent,
    });
  } catch (err) {
    next(err);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobileNumber: identifier },
        { username: identifier }
      ]
    }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(
      {
        id: user._id,
        role: 'user',
        userId: user.userId,
        adminAccessCode: user.adminAccessCode,
      },
      '1d'
    );

    res.json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: 'user',
        adminAccessCode: user.adminAccessCode,
      },
    });

  } catch (err) {
    next(err);
  }
};

const signup = async (req, res, next) => {
  try {
    const { fullName, mobileNumber, email, username, password, adminAccessCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobileNumber },
        { username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
         return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.mobileNumber === mobileNumber) {
         return res.status(400).json({ message: 'Mobile number already registered' });
      }
      if (existingUser.username === username) {
         return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Normalize provided admin access code (inviter code)
    const providedCode = String(adminAccessCode || '').trim().toUpperCase();

    // Enforce: to sign up, you must provide an existing admin/user adminAccessCode,
    // except for the very first account where ADMIN_BOOTSTRAP_CODE (if set) can be used.
    const hasAnyAccount =
      (await Admin.exists({})) ||
      (await User.exists({}));

    if (!hasAnyAccount) {
      const bootstrap = String(process.env.ADMIN_BOOTSTRAP_CODE || '').trim().toUpperCase();
      if (bootstrap && providedCode !== bootstrap) {
        return res.status(403).json({ message: 'Invalid admin access code' });
      }
      // if no bootstrap code configured, allow first signup without checking any code
    } else {
      const inviter =
        (await Admin.findOne({ adminAccessCode: providedCode }).lean()) ||
        (await User.findOne({ adminAccessCode: providedCode, isVerified: true }).lean());
      if (!inviter) {
        return res.status(403).json({ message: 'Invalid admin access code' });
      }
    }

    // Generate a stable unique ID (decoupled from Mongo _id).
    const userId = `user-${generateUniqueId({ length: 12, useLetters: true, useNumbers: true })}`;
    const newAdminAccessCode = generateAdminAccessCode();
    
    // Create new user (unverified)
    const newUser = new User({
      userId,
      fullName,
      mobileNumber,
      email,
      username,
      password,
      isVerified: false,
      adminAccessCode: newAdminAccessCode,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    newUser.otp = otp;
    newUser.otpExpires = otpExpires;
    
    await newUser.save();

    let emailSent = true;
    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Signup OTP for Dental Clinic',
        html: `<h3>Welcome to Dental Clinic</h3><p>Your 6-digit OTP for verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });
    } catch (err) {
      emailSent = false;
      logger.error('Signup OTP email failed', {
        message: err.message,
        code: err.code,
        responseCode: err.responseCode,
      });
    }

    res.status(201).json({
      message: 'User created successfully. Please verify OTP.',
      emailSent,
    });

  } catch(err) {
    next(err);
  }
};

const verifySignupOtp = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;
    
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobileNumber: identifier },
        { username: identifier }
      ]
    }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'User verified successfully. You can now login.' });
    
  } catch(err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
       return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    let emailSent = true;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset OTP',
        html: `<h3>Password Reset Request</h3><p>Your 6-digit OTP to reset your password is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });
    } catch (err) {
      emailSent = false;
      logger.error('Forgot password OTP email failed', {
        message: err.message,
        code: err.code,
        responseCode: err.responseCode,
      });
    }

    res.json({
      message: 'OTP generated for password reset.',
      emailSent,
    });
    
  } catch(err) {
    next(err);
  }
}

const verifyForgotPassword = async (req, res, next) => {
   try {
     const { username, otp, newPassword } = req.body;
     
     const user = await User.findOne({ username }).select('+otp +otpExpires');
     if (!user) {
       return res.status(404).json({ message: 'User not found' });
     }
     
     if (user.otp !== otp || user.otpExpires < Date.now()) {
       return res.status(400).json({ message: 'Invalid or expired OTP' });
     }
     
     user.password = newPassword;
     // OTP verification proves email ownership; treat as verified.
     user.isVerified = true;
     user.otp = undefined;
     user.otpExpires = undefined;
     await user.save();
     
     res.json({ message: 'Password reset successfully. You can now login.' });
     
   } catch(err) {
     next(err);
   }
};

module.exports = {
  login,
  verifyLoginOtp,
  signup,
  verifySignupOtp,
  forgotPassword,
  verifyForgotPassword,
};

