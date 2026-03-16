const express = require('express');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  blogCategoryCreateSchema,
  blogCategoryUpdateSchema,
} = require('../validators/blogCategoryValidator');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/blogCategoryController');

const router = express.Router();

// Public (for dropdowns)
router.get('/', getCategories);

// Admin
router.post('/', auth, admin, validate(blogCategoryCreateSchema), createCategory);
router.put('/:id', auth, admin, validate(blogCategoryUpdateSchema), updateCategory);
router.delete('/:id', auth, admin, deleteCategory);

module.exports = router;

