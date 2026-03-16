const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateAdminAccessCode = () =>
  crypto.randomBytes(9).toString('base64url').slice(0, 12).toUpperCase();

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['super_admin'],
      default: 'super_admin',
    },
    // Used to authorize creation of admin accounts (invite-like code)
    adminAccessCode: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 32,
      index: true,
      default: generateAdminAccessCode,
    },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

