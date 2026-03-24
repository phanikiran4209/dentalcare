const express = require('express');
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { blogCreateSchema, blogUpdateSchema } = require('../validators/blogValidator');
const optionalAuth = require('../middlewares/optionalAuthMiddleware');

const router = express.Router();

// Public list of all blogs (returns drafts only if admin)
router.get('/', optionalAuth, getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin
router.post('/admin', auth, admin, validate(blogCreateSchema), createBlog);
router.put('/admin/:id', auth, admin, validate(blogUpdateSchema), updateBlog);
router.delete('/admin/:id', auth, admin, deleteBlog);

module.exports = router;

