const mongoose = require('mongoose');

const emailSubscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
  },
  { timestamps: true }
);

emailSubscriptionSchema.index({ email: 1 }, { unique: true });
emailSubscriptionSchema.index({ status: 1, createdAt: -1 });

const EmailSubscription = mongoose.model('EmailSubscription', emailSubscriptionSchema);

module.exports = EmailSubscription;

