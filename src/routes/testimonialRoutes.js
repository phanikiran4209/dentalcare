const express = require('express');
const {
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllTestimonials,
} = require('../controllers/testimonialController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  testimonialCreateSchema,
  testimonialUpdateSchema,
} = require('../validators/testimonialValidator');

const router = express.Router();

// Public
router.get('/', getPublicTestimonials);
router.post('/', validate(testimonialCreateSchema), createTestimonial);

// Admin
router.get('/admin', auth, admin, getAllTestimonials);
router.put('/admin/:id', auth, admin, validate(testimonialUpdateSchema), updateTestimonial);
router.delete('/admin/:id', auth, admin, deleteTestimonial);

module.exports = router;

