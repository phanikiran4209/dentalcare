const Joi = require('joi');

const subscribeSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(254).required(),
});

const listSubscriptionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
  status: Joi.string().valid('subscribed', 'unsubscribed', 'all').default('subscribed'),
  q: Joi.string().trim().max(254).allow('').default(''),
});

const sendBulkEmailSchema = Joi.object({
  subject: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(20000).allow(''),
  html: Joi.string().trim().max(200000).allow(''),
  mode: Joi.string().valid('all', 'selected').default('all'),
  selectedIds: Joi.array().items(Joi.string().trim()).default([]),
  selectedEmails: Joi.array()
    .items(Joi.string().trim().email({ tlds: { allow: false } }).max(254))
    .default([]),
}).custom((value, helpers) => {
  if (!value.message && !value.html) {
    return helpers.error('any.custom', { message: 'Either message or html is required' });
  }
  if (value.mode === 'selected' && value.selectedIds.length === 0 && value.selectedEmails.length === 0) {
    return helpers.error('any.custom', { message: 'Selected recipients required for mode=selected' });
  }
  return value;
});

module.exports = {
  subscribeSchema,
  listSubscriptionsQuerySchema,
  sendBulkEmailSchema,
};

