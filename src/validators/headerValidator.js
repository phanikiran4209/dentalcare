const Joi = require('joi');

const socialLinkSchema = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().allow('', null).optional(), // optionally allowing empty url if they don't have it yet
});

const headerCreateSchema = Joi.object({
  locationName: Joi.string().allow('', null).optional(),
  mapLink: Joi.string().allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  timings: Joi.string().allow('', null).optional(),
  callNumber: Joi.string().allow('', null).optional(),
  whatsappNumber: Joi.string().allow('', null).optional(),
  socialLinks: Joi.array().items(socialLinkSchema).optional(),
});

const headerUpdateSchema = headerCreateSchema;

module.exports = {
  headerCreateSchema,
  headerUpdateSchema,
};
