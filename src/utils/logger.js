const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const httpLogger = {
  stream: {
    write: (message) => {
      logger.http ? logger.http(message.trim()) : logger.info(message.trim());
    },
  },
};

module.exports = { logger, httpLogger };

