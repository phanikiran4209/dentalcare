const Joi = require('joi');

const contactCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  message: Joi.string().max(1000).required(),
});

module.exports = {
  contactCreateSchema,
};

