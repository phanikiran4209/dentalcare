const validateMiddleware = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };

  const { error, value } = schema.validate(req.body, options);

  if (error) {
    const details = error.details.map((d) => d.message);
    return res.status(400).json({ message: 'Validation error', errors: details });
  }

  req.body = value;
  next();
};

module.exports = validateMiddleware;

