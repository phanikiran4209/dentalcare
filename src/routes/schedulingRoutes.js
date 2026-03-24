const express = require('express');
const {
  setWeeklyAvailability,
  addBreakTime,
  blockSpecificSlot,
  getAvailableSlotsForDate,
  getAvailableSlotsForDatePublic,
  markLeave,
  getAvailability,
  getOverridesForDate,
  getAvailabilitySlotsForDateAdmin,
} = require('../controllers/schedulingController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  setAvailabilitySchema,
  addBreakSchema,
  blockSlotSchema,
  leaveSchema,
} = require('../validators/schedulingValidator');

const router = express.Router();

// Admin (doctor)
router.post('/availability', auth, admin, validate(setAvailabilitySchema), setWeeklyAvailability);
router.post('/break', auth, admin, validate(addBreakSchema), addBreakTime);
router.post('/block', auth, admin, validate(blockSlotSchema), blockSpecificSlot);
router.post('/leave', auth, admin, validate(leaveSchema), markLeave);
router.get('/availability', auth, admin, getAvailability);
router.get('/overrides', auth, admin, getOverridesForDate);
router.get('/availability-slots', auth, admin, getAvailabilitySlotsForDateAdmin);

// Public
router.get('/slots', getAvailableSlotsForDate);
router.get('/slots-by-date', getAvailableSlotsForDatePublic);

module.exports = router;

