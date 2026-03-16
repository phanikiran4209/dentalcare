const express = require('express');
const {
  getPublicFaqs,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} = require('../controllers/faqController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { faqCreateSchema, faqUpdateSchema } = require('../validators/faqValidator');

const router = express.Router();

// Public
router.get('/', getPublicFaqs);

// Admin
router.get('/admin', auth, admin, getAdminFaqs);
router.post('/admin', auth, admin, validate(faqCreateSchema), createFaq);
router.put('/admin/:id', auth, admin, validate(faqUpdateSchema), updateFaq);
router.delete('/admin/:id', auth, admin, deleteFaq);

module.exports = router;

