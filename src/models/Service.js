const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // Backward compatible "description" (treated as shortDescription by UI)
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    detailedDescription: { type: String, trim: true, maxlength: 5000 },
    points: [{ type: String, trim: true, maxlength: 120 }],
    icon: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

