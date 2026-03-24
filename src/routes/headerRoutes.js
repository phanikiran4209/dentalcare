const express = require('express');
const {
  getHeaders,
  createHeader,
  updateHeader,
  deleteHeader,
} = require('../controllers/headerController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { headerCreateSchema, headerUpdateSchema } = require('../validators/headerValidator');

const router = express.Router();

// Public route: no authorization
router.get('/', getHeaders);

// Admin-protected routes
router.post('/', auth, admin, validate(headerCreateSchema), createHeader);
router.put('/:id', auth, admin, validate(headerUpdateSchema), updateHeader);
router.delete('/:id', auth, admin, deleteHeader);

module.exports = router;
