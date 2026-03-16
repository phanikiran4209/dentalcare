const Joi = require('joi');

const commaSeparatedToArray = (value, helpers) => {
  if (typeof value !== 'string') return value;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const serviceCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  // Backward compatible short description
  description: Joi.string().max(1000).required(),
  shortDescription: Joi.string().max(200).allow(''),
  detailedDescription: Joi.string().max(5000).allow(''),
  points: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().max(120)).default([]),
      Joi.string().allow('').custom(commaSeparatedToArray)
    )
    .default([]),
  icon: Joi.string().allow(''),
  active: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const serviceUpdateSchema = serviceCreateSchema.fork(
  ['name', 'description'],
  (schema) => schema.optional()
);

module.exports = {
  serviceCreateSchema,
  serviceUpdateSchema,
};

