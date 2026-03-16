const express = require('express');
const {
  createAppointment,
  getAppointmentsAdmin,
  updateAppointmentStatus,
  deleteAppointment,
} = require('../controllers/appointmentController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  appointmentCreateSchema,
  appointmentStatusSchema,
} = require('../validators/appointmentValidator');

const router = express.Router();

// Public
router.post('/', validate(appointmentCreateSchema), createAppointment);

// Admin
router.get('/admin', auth, admin, getAppointmentsAdmin);
router.put('/admin/:id', auth, admin, validate(appointmentStatusSchema), updateAppointmentStatus);
router.delete('/admin/:id', auth, admin, deleteAppointment);

module.exports = router;

