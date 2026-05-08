/**
 * BB Enterprise — Express API entry point
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const { handleStripeWebhook } = require('./controllers/paymentController');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const allowRenderSubdomains = true;

function toOrigin(value) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const configuredCorsOrigins = new Set(
  [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
    .map((value) => toOrigin(value && value.trim()))
    .filter(Boolean)
);

// Stripe webhook must use raw body (before express.json)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, health checks) with no Origin header.
      if (!origin) return callback(null, true);
      if (configuredCorsOrigins.has(origin)) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/i.test(origin)) return callback(null, true);
      if (/^http:\/\/127\.0\.0\.1:\d+$/i.test(origin)) return callback(null, true);
      if (
        allowRenderSubdomains &&
        /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'BB Enterprise API',
    message: 'API is running. Use /api/health for health checks.',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'BB Enterprise API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
}

startServer();
