const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong'
      : err.message || 'Server error';

  res.status(statusCode).json({
    message,
  });
};

module.exports = errorHandler;

