const Joi = require('joi');

const dayOfWeekSchema = Joi.string().valid(
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
);

const setAvailabilitySchema = Joi.object({
  doctor_id: Joi.string().required(),
  day_of_week: dayOfWeekSchema.required(),
  date: Joi.string().optional(),
  start_time: Joi.string().required(),
  end_time: Joi.string().required(),
  slot_duration: Joi.number().integer().min(5).max(240).required(),
});

const addBreakSchema = Joi.object({
  doctor_id: Joi.string().required(),
  day_of_week: dayOfWeekSchema.required(),
  date: Joi.string().optional(),
  start_time: Joi.string().required(),
  end_time: Joi.string().required(),
  reason: Joi.string().allow(''),
});

const blockSlotSchema = Joi.object({
  doctor_id: Joi.string().required(),
  date: Joi.string().required(),
  start_time: Joi.string().required(),
  end_time: Joi.string().required(),
  reason: Joi.string().allow(''),
});

module.exports = {
  setAvailabilitySchema,
  addBreakSchema,
  blockSlotSchema,
};

