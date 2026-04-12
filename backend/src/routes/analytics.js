/**
 * Analytics API — Pro tier feature
 * Provides price history, marketplace stats, and market intelligence
 */
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// ── Auth helper ──────────────────────────────────────────────────────────────
function verifyJWT(req) {
  const header = req.headers.authorization;
  if (!header) throw new Error('No token');
  return jwt.verify(header.replace('Bearer ', ''), process.env.JWT_SECRET);
}

// ── GET /api/analytics/price-history ─────────────────────────────────────────
// Returns LME price history for charting
// Query: ?metal=Copper&period=7d (7d|30d|90d|all)
router.get('/price-history', async (req, res) => {
  try {
    const { metal, period = '30d' } = req.query;

    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === 'all' ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where = { createdAt: { gte: since } };
    if (metal) where.metal = metal;

    const lmeRates = await prisma.lMERate.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: { metal: true, price: true, change: true, createdAt: true },
    });

    const mcxRates = await prisma.mCXRate.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: { metal: true, price: true, change: true, createdAt: true },
    });

    // Group by metal for multi-line charts
    const lmeByMetal = {};
    lmeRates.forEach(r => {
      if (!lmeByMetal[r.metal]) lmeByMetal[r.metal] = [];
      lmeByMetal[r.metal].push({ date: r.createdAt, price: r.price, change: r.change });
    });

    const mcxByMetal = {};
    mcxRates.forEach(r => {
      if (!mcxByMetal[r.metal]) mcxByMetal[r.metal] = [];
      mcxByMetal[r.metal].push({ date: r.createdAt, price: r.price, change: r.change });
    });

    res.json({ lme: lmeByMetal, mcx: mcxByMetal, period, since });
  } catch (err) {
    console.error('/api/analytics/price-history error:', err);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// ── GET /api/analytics/overview ──────────────────────────────────────────────
// Returns marketplace and platform stats
router.get('/overview', async (req, res) => {
  try {
    // Marketplace stats
    const [totalListings, activeListings, verifiedListings] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.listing.count({ where: { status: 'verified' } }),
    ]);

    // Deal stats
    const [totalDeals, completedDeals, activeDealCount] = await Promise.all([
      prisma.deal.count(),
      prisma.deal.count({ where: { status: 'completed' } }),
      prisma.deal.count({ where: { status: { in: ['negotiating', 'agreed', 'paid', 'connected'] } } }),
    ]);

    // GMV — total deal value of completed deals
    const gmvResult = await prisma.deal.aggregate({
      where: { status: { in: ['completed', 'connected', 'paid'] } },
      _sum: { dealAmount: true, commission: true },
    });

    // Volume by metal (from listings)
    const metalVolume = await prisma.listing.groupBy({
      by: ['metalId'],
      _count: { id: true },
      _sum: { qty: true },
      where: { isActive: true },
    });

    // Get metal names
    const metals = await prisma.metal.findMany({ select: { id: true, name: true, emoji: true } });
    const metalMap = {};
    metals.forEach(m => { metalMap[m.id] = m; });

    const volumeByMetal = metalVolume.map(v => ({
      metal: metalMap[v.metalId]?.name || 'Unknown',
      emoji: metalMap[v.metalId]?.emoji || '',
      listings: v._count.id,
      totalQty: v._sum.qty || 0,
    }));

    // Average deal size
    const avgDeal = await prisma.deal.aggregate({
      where: { dealAmount: { not: null } },
      _avg: { dealAmount: true },
    });

    // Deal close rate
    const closeRate = totalDeals > 0
      ? parseFloat(((completedDeals / totalDeals) * 100).toFixed(1))
      : 0;

    // User stats
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { kycVerified: true } });

    // Latest LME prices (current snapshot)
    const latestLME = await prisma.lMERate.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['metal'],
      take: 6,
    });

    // Latest MCX prices
    const latestMCX = await prisma.mCXRate.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['metal'],
      take: 6,
    });

    // Price high/low from LME history
    const priceExtremes = {};
    for (const m of ['Copper', 'Aluminium', 'Zinc', 'Nickel', 'Lead', 'Tin']) {
      const [high, low] = await Promise.all([
        prisma.lMERate.findFirst({ where: { metal: m }, orderBy: { price: 'desc' } }),
        prisma.lMERate.findFirst({ where: { metal: m }, orderBy: { price: 'asc' } }),
      ]);
      if (high && low) {
        priceExtremes[m] = {
          high: high.price, highDate: high.createdAt,
          low: low.price, lowDate: low.createdAt,
        };
      }
    }

    res.json({
      marketplace: {
        totalListings, activeListings, verifiedListings,
        totalDeals, completedDeals, activeDeals: activeDealCount,
        gmv: gmvResult._sum.dealAmount || 0,
        totalCommission: gmvResult._sum.commission || 0,
        avgDealSize: avgDeal._avg.dealAmount || 0,
        closeRate,
        volumeByMetal,
      },
      users: { total: totalUsers, verified: verifiedUsers },
      latestLME, latestMCX, priceExtremes,
    });
  } catch (err) {
    console.error('/api/analytics/overview error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ── GET /api/analytics/local-history ─────────────────────────────────────────
// Returns local rate history for a specific hub and metal
router.get('/local-history', async (req, res) => {
  try {
    const { hubSlug, metal, period = '30d' } = req.query;
    if (!hubSlug) return res.status(400).json({ error: 'hubSlug required' });

    const hub = await prisma.hub.findUnique({ where: { slug: hubSlug } });
    if (!hub) return res.status(404).json({ error: 'Hub not found' });

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where = {
      hubId: hub.id,
      createdAt: { gte: since },
    };

    // If metal filter, join through grade → metal
    if (metal) {
      const metalRecord = await prisma.metal.findFirst({ where: { name: metal } });
      if (metalRecord) {
        const grades = await prisma.grade.findMany({
          where: { metalId: metalRecord.id },
          select: { id: true },
        });
        where.gradeId = { in: grades.map(g => g.id) };
      }
    }

    const rates = await prisma.rate.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        grade: { include: { metal: { select: { name: true } } } },
      },
    });

    // Group by grade
    const byGrade = {};
    rates.forEach(r => {
      const key = `${r.grade.metal.name} - ${r.grade.name}`;
      if (!byGrade[key]) byGrade[key] = [];
      byGrade[key].push({
        date: r.createdAt,
        buyPrice: r.buyPrice,
        sellPrice: r.sellPrice,
      });
    });

    res.json({ hub: hub.name, data: byGrade, period });
  } catch (err) {
    console.error('/api/analytics/local-history error:', err);
    res.status(500).json({ error: 'Failed to fetch local history' });
  }
});

module.exports = router;
