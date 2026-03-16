const Testimonial = require('../models/Testimonial');
const { sendTestimonialThankYou } = require('../services/emailService');

const getPublicTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ approved: true })
      .select('-email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(testimonials);
  } catch (err) {
    next(err);
  }
};

// Admin: return all testimonials (approved and not approved)
const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(testimonials);
  } catch (err) {
    next(err);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.create(req.body);

    // Fire and forget thank-you email to the patient (if email provided)
    sendTestimonialThankYou(testimonial).catch(() => {});

    res.status(201).json(testimonial);
  } catch (err) {
    next(err);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (err) {
    next(err);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};

