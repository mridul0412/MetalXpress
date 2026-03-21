require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const ratesRouter = require('./routes/rates');
const citiesRouter = require('./routes/cities');
const metalsRouter = require('./routes/metals');
const authRouter = require('./routes/auth');
const marketplaceRouter = require('./routes/marketplace');
const alertsRouter = require('./routes/alerts');
const adminRouter = require('./routes/admin');

const alertService = require('./services/alertService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/rates', ratesRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/metals', metalsRouter);
app.use('/api/auth', authRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/admin', adminRouter);

// Alert check cron job - every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('[CRON] Checking alerts...');
  try {
    await alertService.checkAlerts();
  } catch (err) {
    console.error('[CRON] Alert check failed:', err.message);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`MetalXpress backend running on port ${PORT}`);
});

module.exports = app;
