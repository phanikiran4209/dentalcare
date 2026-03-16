const Joi = require('joi');

const blogCategoryCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().max(1000).allow(''),
  active: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const blogCategoryUpdateSchema = blogCategoryCreateSchema.fork(['name', 'slug'], (s) => s.optional());

module.exports = {
  blogCategoryCreateSchema,
  blogCategoryUpdateSchema,
};

