const express = require('express');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const {
  bannerCreateSchema,
  bannerUpdateSchema,
} = require('../validators/bannerValidator');

const router = express.Router();

// Public
router.get('/', getBanners);

// Admin
router.get('/admin', auth, admin, getAllBannersAdmin);
router.post('/admin', auth, admin, validate(bannerCreateSchema), createBanner);
router.put('/admin/:id', auth, admin, validate(bannerUpdateSchema), updateBanner);
router.delete('/admin/:id', auth, admin, deleteBanner);

module.exports = router;

