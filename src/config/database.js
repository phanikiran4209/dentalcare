const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { logger } = require('../utils/logger');

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);
  // Prevent requests from hanging forever when Mongo is down.
  mongoose.set('bufferCommands', false);

  await mongoose.connect(uri, {
    autoIndex: true,
    // Fail fast instead of "loading forever" in Swagger/UI.
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 5000,
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 20000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
  });

  logger.info('MongoDB connected');
};

module.exports = { connectDB };

