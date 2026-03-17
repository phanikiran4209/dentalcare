const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'string.empty': 'Email, username or mobile number is required',
  }),
  password: Joi.string().required(),
});

const signupSchema = Joi.object({
  fullName: Joi.string().required(),
  mobileNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one number, and one special character.',
    }),
  adminAccessCode: Joi.string()
    .min(8)
    .max(32)
    .when('$nodeEnv', {
      is: 'test',
      then: Joi.optional().allow(''),
      otherwise: Joi.required().messages({
        'any.required': 'Admin access code is required to sign up.',
      }),
    }),
});

const verifyOtpSchema = Joi.object({
  identifier: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

const forgotPasswordSchema = Joi.object({
  username: Joi.string().required(),
});

const verifyForgotPasswordOtpSchema = Joi.object({
  username: Joi.string().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one number, and one special character.',
    }),
});

module.exports = {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
};

