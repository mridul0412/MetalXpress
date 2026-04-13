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
const analyticsRouter = require('./routes/analytics');

const alertService = require('./services/alertService');
const { fetchLivePrices } = require('./services/livePriceFetcher');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
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
app.use('/api/analytics', analyticsRouter);

// Alert check cron job - every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('[CRON] Checking alerts...');
  try {
    await alertService.checkAlerts();
  } catch (err) {
    console.error('[CRON] Alert check failed:', err.message);
  }
});

// ── Price snapshot cron — every 15 minutes ─────────────────────────────────
// Fetches Yahoo Finance / Stooq prices and saves to LMERate + MCXRate with
// source='cron'. Skipped if an admin paste exists within the last 15 minutes
// (admin priority window). This gives ~96 data points/day for analytics charts
// and daily high/low computation.
cron.schedule('*/15 * * * *', async () => {
  try {
    // Check if admin pasted in the last 15 min — if so, skip (admin has priority)
    const CUTOFF_15M = new Date(Date.now() - 15 * 60 * 1000);
    const recentAdminPaste = await prisma.lMERate.findFirst({
      where: { createdAt: { gte: CUTOFF_15M }, source: 'admin' },
    }).catch(() => null);

    if (recentAdminPaste) {
      console.log('[CRON] Price snapshot skipped — admin paste active');
      return;
    }

    const data = await fetchLivePrices();
    const usdInr = data.usdInr || 84;
    const ALL_METALS = ['Copper', 'Aluminium', 'Zinc', 'Nickel', 'Lead', 'Tin'];

    let lmeSaved = 0, mcxSaved = 0;
    for (const m of data.metals || []) {
      const metalName = ALL_METALS.find(n => n.toLowerCase() === m.metal.toLowerCase()) || m.metal;
      await prisma.lMERate.create({
        data: { metal: metalName, price: m.priceUsd, change: m.change, unit: '$/MT', source: 'cron' },
      }).catch(() => {});
      lmeSaved++;

      const priceMcx = m.priceMcx ?? parseFloat(((m.priceUsd * usdInr) / 1000).toFixed(2));
      await prisma.mCXRate.create({
        data: { metal: metalName, price: priceMcx, change: m.change, unit: '₹/Kg', source: 'cron' },
      }).catch(() => {});
      mcxSaved++;
    }

    console.log(`[CRON] Price snapshot saved — LME: ${lmeSaved}, MCX: ${mcxSaved}`);
  } catch (err) {
    console.error('[CRON] Price snapshot failed:', err.message);
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
