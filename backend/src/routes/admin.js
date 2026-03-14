const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { adminMiddleware } = require('../middleware/auth');
const { parseRateMessage } = require('../services/rateParser');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/dashboard
router.get('/dashboard', adminMiddleware, async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: {
        hubs: {
          include: {
            rateUpdates: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const [userCount, listingCount, alertCount] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.alert.count({ where: { isActive: true } }),
    ]);

    res.json({ cities, stats: { users: userCount, listings: listingCount, alerts: alertCount } });
  } catch (err) {
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
});

// POST /api/admin/parse-preview — parse without saving
router.post('/parse-preview', adminMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const parsed = parseRateMessage(message);
    res.json({ success: true, parsed });
  } catch (err) {
    res.status(500).json({ error: 'Parse failed' });
  }
});

// GET /api/admin/rate-history?hubSlug=mandoli-delhi&limit=50
router.get('/rate-history', adminMiddleware, async (req, res) => {
  try {
    const { hubSlug, limit = 50 } = req.query;

    const where = {};
    if (hubSlug) {
      const hub = await prisma.hub.findUnique({ where: { slug: hubSlug } });
      if (hub) where.hubId = hub.id;
    }

    const updates = await prisma.rateUpdate.findMany({
      where,
      include: {
        hub: { include: { city: true } },
        contributor: true,
        rates: {
          include: { grade: { include: { metal: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rate history' });
  }
});

// GET /api/admin/contributors
router.get('/contributors', adminMiddleware, async (req, res) => {
  try {
    const contributors = await prisma.contributor.findMany({
      include: { city: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contributors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributors' });
  }
});

// POST /api/admin/contributors
router.post('/contributors', adminMiddleware, async (req, res) => {
  try {
    const { name, phone, cityId } = req.body;
    if (!name || !cityId) return res.status(400).json({ error: 'name and cityId required' });

    const contributor = await prisma.contributor.create({
      data: { name, phone: phone || null, cityId, isVerified: true },
      include: { city: true },
    });
    res.status(201).json(contributor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contributor' });
  }
});

// POST /api/admin/lme-override — manually set LME rates
router.post('/lme-override', adminMiddleware, async (req, res) => {
  try {
    const { rates } = req.body; // [{ metal, price, change, unit }]
    const created = [];
    for (const r of rates) {
      const rate = await prisma.lMERate.create({
        data: {
          metal: r.metal,
          price: parseFloat(r.price),
          change: parseFloat(r.change || 0),
          unit: r.unit || '$/MT',
        },
      });
      created.push(rate);
    }
    res.json({ success: true, count: created.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save LME rates' });
  }
});

// POST /api/admin/mcx-override
router.post('/mcx-override', adminMiddleware, async (req, res) => {
  try {
    const { rates } = req.body;
    const created = [];
    for (const r of rates) {
      const rate = await prisma.mCXRate.create({
        data: {
          metal: r.metal,
          price: parseFloat(r.price),
          change: parseFloat(r.change || 0),
          unit: r.unit || '₹/Kg',
        },
      });
      created.push(rate);
    }
    res.json({ success: true, count: created.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save MCX rates' });
  }
});

module.exports = router;
