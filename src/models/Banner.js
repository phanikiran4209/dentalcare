const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    countText: { type: String, required: true, trim: true, maxlength: 20 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    logoUrl: { type: String, required: true, trim: true, maxlength: 500 },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bannerSchema.index({ active: 1, order: 1, createdAt: -1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;

