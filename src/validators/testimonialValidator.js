const Joi = require('joi');

const testimonialCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  review: Joi.string().max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  image: Joi.string().uri().allow(''),
  email: Joi.string().email().allow(''),
});

const testimonialUpdateSchema = testimonialCreateSchema
  .fork(['name', 'review', 'rating'], (schema) => schema.optional())
  .keys({
    approved: Joi.boolean(),
  });

module.exports = {
  testimonialCreateSchema,
  testimonialUpdateSchema,
};

