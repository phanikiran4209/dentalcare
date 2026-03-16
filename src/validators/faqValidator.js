const Joi = require('joi');

const faqCreateSchema = Joi.object({
  question: Joi.string().max(1000).required(),
  answer: Joi.string().max(4000).required(),
  faqType: Joi.string().valid('COACHING', 'CONTACT', 'GENERAL').required(),
  status: Joi.boolean().default(true),
});

const faqUpdateSchema = faqCreateSchema
  .fork(['question', 'answer', 'faqType'], (schema) => schema.optional())
  .fork(['status'], (schema) => schema.optional());

module.exports = {
  faqCreateSchema,
  faqUpdateSchema,
};

