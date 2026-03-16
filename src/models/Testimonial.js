const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    image: { type: String },
    email: { type: String }, // optional, used only for sending thanks
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;

