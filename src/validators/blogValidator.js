const Joi = require('joi');

const commaSeparatedToArray = (value, helpers) => {
  if (typeof value !== 'string') return value;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const blogCreateSchema = Joi.object({
  title: Joi.string().max(200).required(),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  content: Joi.string().required(),
  shortDescription: Joi.string().max(300).allow(''),
  longDescription: Joi.string().max(20000).allow(''),
  summaryPoints: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().max(160)).default([]),
      Joi.string().allow('').custom(commaSeparatedToArray)
    )
    .default([]),
  author: Joi.string().allow(''),
  // Backward compatible string category
  category: Joi.string().allow(''),
  // Preferred category reference
  categoryId: Joi.string().hex().length(24).allow(''),
  // Or a category slug (server will resolve to categoryId)
  categorySlug: Joi.string().pattern(/^[a-z0-9-]+$/).allow(''),
  tags: Joi.array().items(Joi.string()).default([]),
  featuredImage: Joi.string().uri().allow(''),
  seoTitle: Joi.string().max(60).allow(''),
  seoDescription: Joi.string().max(160).allow(''),
  published: Joi.boolean().default(true),
});

const blogUpdateSchema = blogCreateSchema.fork(
  ['title', 'slug', 'content'],
  (schema) => schema.optional()
);

module.exports = {
  blogCreateSchema,
  blogUpdateSchema,
};

