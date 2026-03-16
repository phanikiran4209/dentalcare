const express = require('express');
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { serviceCreateSchema, serviceUpdateSchema } = require('../validators/serviceValidator');

const router = express.Router();

// Public
router.get('/', getServices);

// Admin
router.post('/admin', auth, admin, validate(serviceCreateSchema), createService);
router.put('/admin/:id', auth, admin, validate(serviceUpdateSchema), updateService);
router.delete('/admin/:id', auth, admin, deleteService);

module.exports = router;

