const express = require('express');
const { getDashboardCounts } = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

const router = express.Router();

// Admin dashboard counts
router.get('/admin', auth, admin, getDashboardCounts);

module.exports = router;

