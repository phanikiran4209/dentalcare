const Joi = require('joi');

const appointmentCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  service: Joi.string().max(100).required(),
  doctor_id: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),
  message: Joi.string().allow(''),
});

const appointmentStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
});

module.exports = {
  appointmentCreateSchema,
  appointmentStatusSchema,
};

