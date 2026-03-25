const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

const { connectDB } = require('./config/database');
const { logger, httpLogger } = require('./utils/logger');
const { swaggerDocument } = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const blogCategoryRoutes = require('./routes/blogCategoryRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const faqRoutes = require('./routes/faqRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const userRoutes = require('./routes/userRoutes');
const headerRoutes = require('./routes/headerRoutes');

dotenv.config();

const app = express();


// ✅ SMART CORS CONFIG (FINAL FIX)
const allowedOrigins = [
  'http://localhost:5173',
  'https://dental-fe-kappa.vercel.app',
  'https://dentalclinic-snowy.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      // allow known domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ✅ allow ANY vercel deployment automatically
      if (origin.includes('vercel.app')) {
        return callback(null, true);
      }

      console.log('❌ Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ✅ Handle preflight requests
app.options('*', cors());


// Global request timeout
app.use((req, res, next) => {
  res.setTimeout(Number(process.env.REQUEST_TIMEOUT_MS) || 15000, () => {
    if (!res.headersSent) {
      res.status(503).json({ message: 'Request timed out' });
    }
  });
  next();
});

// Trust proxy
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: httpLogger.stream }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blog-categories', blogCategoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schedule', schedulingRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/headers', headerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const BASE_PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectDB();

    const env = process.env.NODE_ENV || 'development';

    const server = app.listen(BASE_PORT, () => {
      logger.info(`Server running in ${env} mode on port ${BASE_PORT}`);
    });

    server.on('error', (err) => {
      logger.error('Server failed to start', { error: err });
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

module.exports = app;
