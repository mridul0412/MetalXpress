const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { parseRateMessage } = require('../services/rateParser');
const { getLatestLMERates, getLatestMCXRates, getLatestForexRates } = require('../services/lmeService');
const { fetchLivePrices } = require('../services/livePriceFetcher');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/rates/local?hub=mandoli-delhi
router.get('/local', async (req, res) => {
  try {
    const { hub: hubSlug } = req.query;
    if (!hubSlug) return res.status(400).json({ error: 'hub query param required' });

    const hub = await prisma.hub.findUnique({
      where: { slug: hubSlug },
      include: { city: true },
    });

    if (!hub) return res.status(404).json({ error: 'Hub not found' });

    // Get all metals with their grades
    const metals = await prisma.metal.findMany({
      include: { grades: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Get latest rate for each grade in this hub
    const result = [];

    for (const metal of metals) {
      const gradeRates = [];

      for (const grade of metal.grades) {
        const latestRate = await prisma.rate.findFirst({
          where: { gradeId: grade.id, hubId: hub.id },
          orderBy: { createdAt: 'desc' },
          include: {
            rateUpdate: {
              include: { contributor: true },
            },
          },
        });

        // Get previous rate to calculate change
        const previousRate = latestRate
          ? await prisma.rate.findFirst({
              where: {
                gradeId: grade.id,
                hubId: hub.id,
                createdAt: { lt: latestRate.createdAt },
              },
              orderBy: { createdAt: 'desc' },
            })
          : null;

        let change = null;
        if (latestRate && previousRate) {
          const cur = latestRate.buyPrice || latestRate.sellPrice;
          const prev = previousRate.buyPrice || previousRate.sellPrice;
          if (cur && prev) change = cur - prev;
        }

        gradeRates.push({
          grade: {
            id: grade.id,
            name: grade.name,
            hasVariants: grade.hasVariants,
            variantLabel: grade.variantLabel,
          },
          rate: latestRate
            ? {
                buyPrice: latestRate.buyPrice,
                sellPrice: latestRate.sellPrice,
                variantPrice: latestRate.variantPrice,
                variantLabel: latestRate.variantLabel,
                updatedAt: latestRate.createdAt,
                contributor: latestRate.rateUpdate?.contributor?.name || null,
                change,
              }
            : null,
        });
      }

      result.push({
        metal: {
          id: metal.id,
          name: metal.name,
          emoji: metal.emoji,
          colorHex: metal.colorHex,
        },
        grades: gradeRates,
      });
    }

    // Get last update time for this hub
    const lastUpdate = await prisma.rateUpdate.findFirst({
      where: { hubId: hub.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      hub: { id: hub.id, name: hub.name, slug: hub.slug, city: hub.city.name },
      rates: result,
      lastUpdated: lastUpdate?.createdAt || null,
    });
  } catch (err) {
    console.error('/api/rates/local error:', err);
    res.status(500).json({ error: 'Failed to fetch local rates' });
  }
});

// GET /api/rates/lme?force=true  — fetch live from Yahoo Finance + save to DB
// GET /api/rates/lme             — return latest from DB
router.get('/lme', async (req, res) => {
  try {
    if (req.query.force === 'true') {
      const data = await fetchLivePrices();
      const live = data.metals || [];
      if (live.length > 0) {
        // Upsert each metal into LMERate table
        for (const r of live) {
          await prisma.lMERate.create({
            data: {
              metal: r.metal,
              price: r.priceUsd,
              change: r.change,
              unit: '$/MT',
            },
          }).catch(() => {}); // silently skip if model differs
        }
        return res.json({ rates: live, fetchedAt: new Date().toISOString(), source: 'live' });
      }
    }
    const rates = await getLatestLMERates();
    res.json({ rates, fetchedAt: new Date().toISOString(), source: 'db' });
  } catch (err) {
    console.error('/api/rates/lme error:', err);
    res.status(500).json({ error: 'Failed to fetch LME rates' });
  }
});

// GET /api/rates/live — always fetch from live sources (no DB write)
// Returns: { metals, forex, indices, crude, usdInr, fetchedAt }
// For metals not available from Yahoo/Stooq (Lead, Tin), falls back to last admin-pasted LME data.
router.get('/live', async (req, res) => {
  try {
    const data = await fetchLivePrices(); // returns {metals, forex, indices, crude, usdInr}
    const usdInr = data.usdInr || 84;

    // Metals covered by Yahoo/Stooq
    const liveCovered = new Set(data.metals.map(m => m.metal));

    // For Lead and Tin (no free live source), try DB — last admin-pasted LME value within 7 days
    const DB_METALS = ['Lead', 'Tin'];
    const missing = DB_METALS.filter(m => !liveCovered.has(m));
    if (missing.length > 0) {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      for (const metalName of missing) {
        const dbRate = await prisma.lMERate.findFirst({
          where: { metal: { contains: metalName }, createdAt: { gte: cutoff } },
          orderBy: { createdAt: 'desc' },
        }).catch(() => null);
        if (dbRate) {
          const priceUsd = dbRate.price;
          const priceMcx = parseFloat(((priceUsd * usdInr) / 1000).toFixed(2));
          const change = dbRate.change || 0;
          data.metals.push({ metal: metalName, priceUsd, priceMcx, change, source: 'admin-update' });
        }
      }
    }

    res.json({ ...data, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('/api/rates/live error:', err);
    res.status(500).json({ error: 'Failed to fetch live prices' });
  }
});

// GET /api/rates/mcx
router.get('/mcx', async (req, res) => {
  try {
    const rates = await getLatestMCXRates();
    res.json({ rates, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MCX rates' });
  }
});

// GET /api/rates/forex
router.get('/forex', async (req, res) => {
  try {
    const rates = await getLatestForexRates();
    res.json({ rates, fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forex rates' });
  }
});

// POST /api/rates/parse — parse raw WhatsApp message
router.post('/parse', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message field required' });

    const parsed = parseRateMessage(message);
    res.json({ success: true, parsed });
  } catch (err) {
    console.error('/api/rates/parse error:', err);
    res.status(500).json({ error: 'Failed to parse message' });
  }
});

// POST /api/rates/manual — admin save rates
router.post('/manual', adminMiddleware, async (req, res) => {
  try {
    const { hubSlug, contributorId, rates } = req.body;
    // rates = [{ gradeId, buyPrice, sellPrice, variantPrice, variantLabel }]

    const hub = await prisma.hub.findUnique({ where: { slug: hubSlug } });
    if (!hub) return res.status(404).json({ error: 'Hub not found' });

    const rateUpdate = await prisma.rateUpdate.create({
      data: {
        hubId: hub.id,
        contributorId: contributorId || null,
        rawMessage: 'Manual entry',
      },
    });

    const created = [];
    for (const r of rates) {
      const rate = await prisma.rate.create({
        data: {
          gradeId: r.gradeId,
          hubId: hub.id,
          buyPrice: r.buyPrice || null,
          sellPrice: r.sellPrice || null,
          variantPrice: r.variantPrice || null,
          variantLabel: r.variantLabel || null,
          rateUpdateId: rateUpdate.id,
        },
      });
      created.push(rate);
    }

    res.json({ success: true, rateUpdateId: rateUpdate.id, count: created.length });
  } catch (err) {
    console.error('/api/rates/manual error:', err);
    res.status(500).json({ error: 'Failed to save rates' });
  }
});

// POST /api/rates/save-parsed — admin confirms parsed rates and saves
router.post('/save-parsed', adminMiddleware, async (req, res) => {
  try {
    const { hubSlug, contributorId, rawMessage, parsed } = req.body;

    const hub = await prisma.hub.findUnique({ where: { slug: hubSlug } });
    if (!hub) return res.status(404).json({ error: 'Hub not found' });

    // Save LME rates if present
    if (parsed.lme && parsed.lme.length > 0) {
      for (const lme of parsed.lme) {
        await prisma.lMERate.create({ data: lme });
      }
    }

    // Save MCX rates if present
    if (parsed.mcx && parsed.mcx.length > 0) {
      for (const mcx of parsed.mcx) {
        await prisma.mCXRate.create({ data: mcx });
      }
    }

    // Save Forex rates if present
    const allForex = [...(parsed.forex || []), ...(parsed.indices || [])];
    for (const fx of allForex) {
      await prisma.forexRate.create({ data: fx });
    }

    // Save local metal rates
    if (parsed.metals && parsed.metals.length > 0) {
      const rateUpdate = await prisma.rateUpdate.create({
        data: {
          hubId: hub.id,
          contributorId: contributorId || null,
          rawMessage: rawMessage || '',
          parsedAt: new Date(parsed.parsedAt),
        },
      });

      // Build grade name → id map
      const grades = await prisma.grade.findMany({ include: { metal: true } });
      const gradeMap = {};
      for (const g of grades) {
        gradeMap[`${g.metal.name}:${g.name}`] = g.id;
        gradeMap[g.name.toLowerCase()] = g.id;
      }

      let savedCount = 0;
      for (const metalSection of parsed.metals) {
        for (const rate of metalSection.rates) {
          // Try to find matching grade
          const gradeId =
            gradeMap[`${metalSection.metal}:${rate.gradeName}`] ||
            gradeMap[rate.gradeName.toLowerCase()];

          if (!gradeId) {
            console.warn(`[PARSE] No grade found for: ${metalSection.metal}:${rate.gradeName}`);
            continue;
          }

          await prisma.rate.create({
            data: {
              gradeId,
              hubId: hub.id,
              buyPrice: rate.buyPrice || null,
              sellPrice: rate.sellPrice || null,
              variantPrice: rate.variantPrice || null,
              variantLabel: rate.variantLabel || null,
              rateUpdateId: rateUpdate.id,
            },
          });
          savedCount++;
        }
      }

      return res.json({ success: true, savedRates: savedCount, rateUpdateId: rateUpdate.id });
    }

    res.json({ success: true, savedRates: 0 });
  } catch (err) {
    console.error('/api/rates/save-parsed error:', err);
    res.status(500).json({ error: 'Failed to save parsed rates' });
  }
});

module.exports = router;
