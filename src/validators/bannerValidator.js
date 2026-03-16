const Joi = require('joi');

const bannerCreateSchema = Joi.object({
  countText: Joi.string().trim().max(20).required(),
  category: Joi.string().trim().max(60).required(),
  logoUrl: Joi.string().uri().trim().max(500).required(),
  active: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const bannerUpdateSchema = bannerCreateSchema.fork(
  ['countText', 'category', 'logoUrl'],
  (schema) => schema.optional()
);

module.exports = {
  bannerCreateSchema,
  bannerUpdateSchema,
};

