/**
 * Seeds 30 days of realistic LME + MCX price history (every 4 hours = 6 points/day)
 * with small random daily drift so the charts look alive.
 * Run: node src/scripts/seedPriceHistory.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Base prices close to real LME values ($/MT)
const BASE = {
  Copper:    12800,
  Aluminium: 3450,
  Zinc:      2530,
  Nickel:    15200,
  Lead:      1890,
  Tin:       47500,
};

// USD/INR baseline
const USD_INR = 93.3;

// Volatility per metal (daily % swing range)
const VOLATILITY = {
  Copper: 0.012, Aluminium: 0.010, Zinc: 0.013,
  Nickel: 0.018, Lead: 0.009, Tin: 0.011,
};

function jitter(base, pct) {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

async function seed() {
  const METALS = Object.keys(BASE);
  const DAYS = 90;          // 90 days of history
  const POINTS_PER_DAY = 8; // every 3 hours = 8 points/day
  const MS_PER_POINT = (24 * 60 * 60 * 1000) / POINTS_PER_DAY;

  const now = Date.now();
  const startMs = now - DAYS * 24 * 60 * 60 * 1000;

  // Delete existing cron rows to start fresh
  console.log('Deleting old cron rows...');
  await prisma.lMERate.deleteMany({ where: { source: 'cron' } });
  await prisma.mCXRate.deleteMany({ where: { source: 'cron' } });

  // Generate a trending price walk per metal
  // Each day drifts slightly, intra-day fluctuates within daily range
  const records = [];
  const mcxRecords = [];

  for (const metal of METALS) {
    let price = BASE[metal];
    const vol = VOLATILITY[metal];

    for (let i = 0; i < DAYS * POINTS_PER_DAY; i++) {
      const ts = new Date(startMs + i * MS_PER_POINT);

      // Daily drift: slight mean-reversion random walk
      const dailyDrift = (Math.random() - 0.49) * vol * price;
      price = Math.max(price * 0.85, price + dailyDrift);

      // Intra-day noise: smaller fluctuation around the daily price
      const intraDay = jitter(price, vol * 0.4);
      const roundedPrice = parseFloat(intraDay.toFixed(2));
      const change = parseFloat(((dailyDrift / price) * 100).toFixed(2));

      records.push({
        metal,
        price: roundedPrice,
        change,
        unit: '$/MT',
        source: 'cron',
        createdAt: ts,
      });

      const mcxPrice = parseFloat(((roundedPrice * USD_INR) / 1000).toFixed(2));
      mcxRecords.push({
        metal,
        price: mcxPrice,
        change,
        unit: '₹/Kg',
        source: 'cron',
        createdAt: ts,
      });
    }
  }

  console.log(`Inserting ${records.length} LME records and ${mcxRecords.length} MCX records...`);

  // Insert in batches of 500
  const batchSize = 500;
  for (let i = 0; i < records.length; i += batchSize) {
    await prisma.lMERate.createMany({ data: records.slice(i, i + batchSize) });
    process.stdout.write('.');
  }
  for (let i = 0; i < mcxRecords.length; i += batchSize) {
    await prisma.mCXRate.createMany({ data: mcxRecords.slice(i, i + batchSize) });
    process.stdout.write('.');
  }

  console.log(`\nDone. ${records.length} LME + ${mcxRecords.length} MCX rows inserted.`);
  console.log(`Coverage: ${DAYS} days × ${POINTS_PER_DAY} pts/day × ${METALS.length} metals`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
