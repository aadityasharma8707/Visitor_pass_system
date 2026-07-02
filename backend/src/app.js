const express = require('express');
const cors = require('cors');

const config = require('./config/config');
const apiRoutes = require('./routes/index');
const healthRoute = require('./routes/healthRoute');
const errorMiddleware = require('./middleware/errorMiddleware');
const { requestContextMiddleware } = require('./middleware/requestContext');
const standardResponseMiddleware = require('./middleware/standardResponse');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// Request context and standard response format
app.use(requestContextMiddleware);
app.use(standardResponseMiddleware);

// Parsers
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cors({ origin: config.corsOrigin }));

// Security - skip heavy or mutating middlewares during tests (Jest sets JEST_WORKER_ID)
if (!process.env.JEST_WORKER_ID && process.env.NODE_ENV !== 'test') {
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
  app.use(mongoSanitize());
  app.use(xss());

  const limiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
  app.use(limiter);

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many auth attempts, please try again later.' }, standardHeaders: true, legacyHeaders: false });
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/auth', authLimiter);
} else {
  // In tests, still add minimal rate limiting to avoid test flakiness
  const limiter = rateLimit({ windowMs: 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false });
  app.use(limiter);
}

// Routes
app.use(healthRoute);
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// Error handler
app.use(errorMiddleware);

module.exports = app;
