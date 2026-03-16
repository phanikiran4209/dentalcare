const express = require('express');
const {
  setWeeklyAvailability,
  addBreakTime,
  blockSpecificSlot,
  getAvailableSlotsForDate,
} = require('../controllers/schedulingController');
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  setAvailabilitySchema,
  addBreakSchema,
  blockSlotSchema,
} = require('../validators/schedulingValidator');

const router = express.Router();

// Admin (doctor)
router.post('/availability', auth, admin, validate(setAvailabilitySchema), setWeeklyAvailability);
router.post('/break', auth, admin, validate(addBreakSchema), addBreakTime);
router.post('/block', auth, admin, validate(blockSlotSchema), blockSpecificSlot);

// Public
router.get('/slots', getAvailableSlotsForDate);

module.exports = router;

