const express = require('express');
const { getPublicSettings, upsertSettings } = require('../controllers/settingsController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

const router = express.Router();

// Public
router.get('/', getPublicSettings);

// Admin
router.put('/admin', auth, admin, upsertSettings);

module.exports = router;

