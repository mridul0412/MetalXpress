const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { parseRateMessage, cleanText } = require('../services/rateParser');
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

    // Re-extract display timestamp string from rawMessage (no timezone conversion needed)
    // Returns e.g. "20 Mar, 01:45 PM" — exactly what the message said.
    function extractDisplayTs(rawMsg) {
      if (!rawMsg) return null;
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      for (const line of rawMsg.split('\n').slice(0, 8)) {
        const clean = cleanText(line).trim();
        const m = clean.match(
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[^\d]+(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i
        );
        if (m) {
          const [, day, month,, hours, minutes,, ampm] = m;
          const mon = MONTHS[parseInt(month, 10) - 1] || month;
          return `${parseInt(day, 10)} ${mon}, ${hours.padStart(2,'0')}:${minutes}${ampm ? ' '+ampm.toUpperCase() : ''}`;
        }
      }
      return null;
    }

    res.json({
      hub: { id: hub.id, name: hub.name, slug: hub.slug, city: hub.city.name },
      rates: result,
      lastUpdated: lastUpdate?.createdAt || null,
      messageTimestampStr: extractDisplayTs(lastUpdate?.rawMessage) || null,
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

// GET /api/rates/live
// Priority per data type:
//   LME metals  : admin paste (15m)  → Yahoo/Stooq → DB fallback Lead/Tin (7d)
//   MCX prices  : admin paste (10m)  → calculated (LME × usdInr / 1000)
//   Forex/Indices: admin paste (10m) → Yahoo Finance
//   usdInr      : admin paste (10m)  → Yahoo (used for MCX calculation)
router.get('/live', async (req, res) => {
  try {
    const CUTOFF_10M = new Date(Date.now() - 10 * 60 * 1000);
    const CUTOFF_15M = new Date(Date.now() - 60 * 60 * 1000); // 60 min — admin paste takes priority for 1 hour, then COMEX kicks in
    const CUTOFF_7D  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ALL_METALS = ['Copper', 'Aluminium', 'Zinc', 'Nickel', 'Lead', 'Tin'];

    // Fetch Yahoo + all DB tables in parallel
    // IMPORTANT: for admin-priority check, only look at source='admin' rows (not cron auto-saves)
    const [yahooData, lmeRates, mcxRates, forexRates] = await Promise.all([
      fetchLivePrices(),
      prisma.lMERate.findMany({ where: { createdAt: { gte: CUTOFF_15M }, source: 'admin' }, orderBy: { createdAt: 'desc' } }).catch(() => []),
      prisma.mCXRate.findMany({ where: { createdAt: { gte: CUTOFF_10M }, source: 'admin' }, orderBy: { createdAt: 'desc' } }).catch(() => []),
      prisma.forexRate.findMany({ where: { createdAt: { gte: CUTOFF_10M } }, orderBy: { createdAt: 'desc' } }).catch(() => []),
    ]);

    // ── 1. USD/INR — admin paste takes priority for MCX calculation ──────
    let usdInr = yahooData.usdInr || 84;
    let forexSource = 'yahoo';
    let forexUpdatedAt = null;

    // Build forex map from DB (dedup — take latest per pair)
    const fxMap = {};
    for (const f of forexRates) {
      const key = (f.pair || '').toUpperCase().trim();
      if (!fxMap[key]) { fxMap[key] = f; if (!forexUpdatedAt || f.createdAt > forexUpdatedAt) forexUpdatedAt = f.createdAt; }
    }
    if (fxMap['USD/INR']) { usdInr = fxMap['USD/INR'].price; forexSource = 'admin-update'; }

    // ── 2. Forex & Indices display data ──────────────────────────────────
    let forex, indices, crude;
    // Helper: convert a ForexRate row's absolute change → % change
    function fxChangePct(row, fallbackPct) {
      if (!row) return fallbackPct ?? 0;
      const abs = parseFloat(row.change) || 0;
      if (abs === 0) return fallbackPct ?? 0;
      const prev = parseFloat(row.price) - abs;
      if (!prev || prev === 0) return fallbackPct ?? 0;
      return parseFloat(((abs / prev) * 100).toFixed(4));
    }

    if (forexSource === 'admin-update') {
      const eurUsd = fxMap['EUR/USD']?.price ??
        (fxMap['EUR/INR']?.price ? parseFloat((fxMap['EUR/INR'].price / usdInr).toFixed(4)) : null);
      forex = {
        usdInr,
        eurUsd:       eurUsd ?? yahooData.forex?.eurUsd,
        usdInrChange: fxChangePct(fxMap['USD/INR'], yahooData.forex?.usdInrChange),
        eurUsdChange: fxChangePct(fxMap['EUR/USD'], yahooData.forex?.eurUsdChange),
      };
      // Indices — WhatsApp broadcast usually doesn't have Nifty/Sensex, fall back to Yahoo
      indices = {
        nifty:        fxMap['NIFTY']?.price    ?? yahooData.indices?.nifty,
        sensex:       fxMap['SENSEX']?.price   ?? yahooData.indices?.sensex,
        niftyChange:  fxChangePct(fxMap['NIFTY'],  yahooData.indices?.niftyChange),
        sensexChange: fxChangePct(fxMap['SENSEX'], yahooData.indices?.sensexChange),
      };
      // Crude from broadcast if present, else Yahoo
      const crudeEntry = fxMap['CRUDE'] ?? fxMap['CRUDE WTI'] ?? fxMap['CRUDEOIL'];
      crude = {
        price:  crudeEntry?.price  ?? yahooData.crude?.price,
        change: fxChangePct(crudeEntry, yahooData.crude?.change),
      };
    } else {
      forex = yahooData.forex; indices = yahooData.indices; crude = yahooData.crude;
    }

    // ── 3. LME metals ─────────────────────────────────────────────────────
    let metals = [];
    let lmeSource = 'yahoo';
    let lmeUpdatedAt = null;

    // Helper: convert absolute price change to % change
    // e.g. price=12205, absChange=-100  →  prevPrice=12305  →  -0.81%
    function absToChangePct(price, absChange) {
      if (!absChange || absChange === 0) return 0;
      const prev = price - absChange;
      if (!prev || prev === 0) return 0;
      return parseFloat(((absChange / prev) * 100).toFixed(2));
    }

    if (lmeRates.length >= 3) {
      // Admin-pasted LME (15m window)
      // LME change stored as absolute USD/MT — convert to % for display
      const usedMetals = new Set();
      for (const rate of lmeRates) {
        const metalName = ALL_METALS.find(m => rate.metal.toLowerCase().includes(m.toLowerCase()));
        if (metalName && !usedMetals.has(metalName)) {
          usedMetals.add(metalName);
          const priceUsd = parseFloat(rate.price);
          const absChange = parseFloat(rate.change) || 0;
          metals.push({ metal: metalName, priceUsd, change: absToChangePct(priceUsd, absChange), source: 'admin-update' });
          if (!lmeUpdatedAt || rate.createdAt > lmeUpdatedAt) lmeUpdatedAt = rate.createdAt;
        }
      }
      // Fill any gaps from Yahoo
      const covered = new Set(metals.map(m => m.metal));
      yahooData.metals.filter(m => !covered.has(m.metal)).forEach(m => metals.push({ ...m }));
      lmeSource = 'admin-update';
    } else {
      metals = yahooData.metals.map(m => ({ ...m }));
      // DB fallback for Lead & Tin — also convert absolute → %
      const covered = new Set(metals.map(m => m.metal));
      for (const metalName of ['Lead', 'Tin']) {
        if (covered.has(metalName)) continue;
        const dbRate = await prisma.lMERate.findFirst({
          where: { metal: { contains: metalName }, createdAt: { gte: CUTOFF_7D }, source: 'admin' },
          orderBy: { createdAt: 'desc' },
        }).catch(() => null);
        if (dbRate) {
          const priceUsd = parseFloat(dbRate.price);
          const absChange = parseFloat(dbRate.change) || 0;
          metals.push({ metal: metalName, priceUsd, change: absToChangePct(priceUsd, absChange), source: 'admin-update' });
        }
      }
    }

    // ── 4. MCX prices — admin paste (10m) overrides calculated ───────────
    const mcxMap = {};
    for (const r of mcxRates) {
      const metalName = ALL_METALS.find(m => r.metal.toLowerCase().includes(m.toLowerCase()));
      if (metalName && !mcxMap[metalName]) mcxMap[metalName] = parseFloat(r.price);
    }

    for (const m of metals) {
      if (mcxMap[m.metal] != null) {
        m.priceMcx  = mcxMap[m.metal];
        m.mcxSource = 'admin-update';
      } else {
        m.priceMcx  = parseFloat(((m.priceUsd * usdInr) / 1000).toFixed(2));
        m.mcxSource = 'calculated';
      }
    }

    // ── 5. Canonical sort ─────────────────────────────────────────────────
    metals.sort((a, b) => {
      const ai = ALL_METALS.indexOf(a.metal), bi = ALL_METALS.indexOf(b.metal);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    res.json({
      metals, forex, indices, crude, usdInr,
      lmeSource,  lmeUpdatedAt:  lmeUpdatedAt?.toISOString()  || null,
      forexSource, forexUpdatedAt: forexUpdatedAt?.toISOString() || null,
      fetchedAt: new Date().toISOString(),
    });
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
// hubSlug is optional — if omitted, only LME/MCX/Forex are saved (no local rates)
router.post('/save-parsed', adminMiddleware, async (req, res) => {
  try {
    const { hubSlug, contributorId, rawMessage, parsed } = req.body;

    // Hub is only required if there are local metal rates to save
    let hub = null;
    if (hubSlug) {
      hub = await prisma.hub.findUnique({ where: { slug: hubSlug } });
      if (!hub) return res.status(404).json({ error: 'Hub not found' });
    }

    let lmeSaved = 0, mcxSaved = 0, fxSaved = 0;

    // Save LME rates if present — normalise metal names for reliable matching in /live
    if (parsed.lme && parsed.lme.length > 0) {
      const CANONICAL = ['Copper', 'Aluminium', 'Aluminum', 'Zinc', 'Nickel', 'Lead', 'Tin'];
      for (const lme of parsed.lme) {
        // Resolve fuzzy name (e.g. "🥇 Copper") to canonical
        const canonical = CANONICAL.find(c =>
          lme.metal.toLowerCase().includes(c.toLowerCase())
        );
        const metalName = canonical === 'Aluminum' ? 'Aluminium' : (canonical || lme.metal);
        try {
          await prisma.lMERate.create({
            data: {
              metal: metalName,
              price: lme.price,
              change: lme.change,
              unit: lme.unit || '$/MT',
            },
          });
          lmeSaved++;
        } catch {}
      }
    }

    // Save MCX rates if present
    if (parsed.mcx && parsed.mcx.length > 0) {
      for (const mcx of parsed.mcx) {
        try { await prisma.mCXRate.create({ data: mcx }); mcxSaved++; } catch {}
      }
    }

    // Save Forex rates if present
    const allForex = [...(parsed.forex || []), ...(parsed.indices || [])];
    for (const fx of allForex) {
      try { await prisma.forexRate.create({ data: fx }); fxSaved++; } catch {}
    }

    // Save local metal rates (only if hub provided)
    if (hub && parsed.metals && parsed.metals.length > 0) {
      const rateUpdate = await prisma.rateUpdate.create({
        data: {
          hubId: hub.id,
          contributorId: contributorId || null,
          rawMessage: rawMessage || '',
          parsedAt: new Date(parsed.parsedAt),
        },
      });

      // Normalise grade name for fuzzy matching:
      // Strip ALL non-alphanumeric chars (dots, spaces, dashes) then lowercase.
      // "C C Rod" → "ccrod"  "C.C. Rod" → "ccrod"  "C C R" → "ccr"  "CC Rod" → "ccrod"
      // This handles WhatsApp bold unicode that decodes with spaces: 𝐂𝐂𝐑 → "C C R"
      function normGrade(s) {
        return s.replace(/[^a-z0-9]/gi, '').toLowerCase();
      }

      const grades = await prisma.grade.findMany({ include: { metal: true } });
      const gradeMap = {};      // exact key → id
      const gradeMapNorm = {};  // normalised key → id
      for (const g of grades) {
        gradeMap[`${g.metal.name}:${g.name}`] = g.id;
        gradeMap[g.name.toLowerCase()] = g.id;
        gradeMapNorm[`${g.metal.name.toLowerCase()}:${normGrade(g.name)}`] = g.id;
        gradeMapNorm[normGrade(g.name)] = g.id;
      }

      let savedCount = 0;
      for (const metalSection of parsed.metals) {
        for (const rate of metalSection.rates) {
          const metalKey  = metalSection.metal;
          const gradeKey  = rate.gradeName;
          const normKey   = `${metalKey.toLowerCase()}:${normGrade(gradeKey)}`;
          // Priority: exact → case-insensitive → normalised with metal → normalised name-only
          const gradeId =
            gradeMap[`${metalKey}:${gradeKey}`] ||
            gradeMap[gradeKey.toLowerCase()] ||
            gradeMapNorm[normKey] ||
            gradeMapNorm[normGrade(gradeKey)];

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

      return res.json({
        success: true,
        savedRates: savedCount,
        rateUpdateId: rateUpdate.id,
        lmeSaved, mcxSaved, fxSaved,
      });
    }

    res.json({ success: true, savedRates: 0, lmeSaved, mcxSaved, fxSaved });
  } catch (err) {
    console.error('/api/rates/save-parsed error:', err);
    res.status(500).json({ error: 'Failed to save parsed rates' });
  }
});

module.exports = router;
