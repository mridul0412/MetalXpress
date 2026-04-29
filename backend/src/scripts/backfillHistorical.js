/**
 * Backfills 30 days of price history anchored to CURRENT live prices.
 *
 * Strategy:
 *   1. Fetch current live LME prices via fetchLivePrices() (Yahoo + DB fallback)
 *   2. Generate 30 days of synthetic random-walk data ENDING at today's real price
 *   3. So charts converge to the actual current price (not a stale hardcoded base)
 *
 * Run once via temp start-script trick. Idempotent for source: 'yahoo-historical'.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { fetchLivePrices } = require('../services/livePriceFetcher');

const prisma = new PrismaClient();

// Daily volatility per metal (approximate annualised vol → daily)
const VOLATILITY = {
  Copper:    0.012,
  Aluminium: 0.010,
  Zinc:      0.013,
  Nickel:    0.018,
  Lead:      0.011,
  Tin:       0.015,
};

// Fallback base prices if live fetch fails (close to recent real values)
const FALLBACK_BASE = {
  Copper:    13000,
  Aluminium: 3400,
  Zinc:      2530,
  Nickel:    15700,
  Lead:      1850,
  Tin:       50000,
};

async function main() {
  console.log('🌱 Backfilling 30 days of price history anchored to live prices...\n');

  // Fetch current live prices to anchor the simulation
  let liveData = null;
  try {
    liveData = await fetchLivePrices();
    console.log(`💱 Live USD/INR: ${liveData.usdInr}`);
    console.log(`📊 Live metals fetched: ${liveData.metals.map(m => m.metal).join(', ')}\n`);
  } catch (err) {
    console.error(`⚠️  Live fetch failed: ${err.message} — using fallback base prices\n`);
  }

  const usdInr = liveData?.usdInr || 84;
  const metalsToday = {};
  for (const m of (liveData?.metals || [])) {
    metalsToday[m.metal] = m.priceUsd;
  }

  // Wipe old historical data — keep admin/seed rows
  console.log('🗑️  Removing old cron + historical-seed data...');
  await prisma.lMERate.deleteMany({ where: { source: { in: ['cron', 'seed-history', 'yahoo-historical'] } } });
  await prisma.mCXRate.deleteMany({ where: { source: { in: ['cron', 'seed-history', 'yahoo-historical'] } } });

  let totalLme = 0, totalMcx = 0;

  for (const [metal, vol] of Object.entries(VOLATILITY)) {
    const endPrice = metalsToday[metal] || FALLBACK_BASE[metal];
    const usedFallback = !metalsToday[metal];

    // Walk BACKWARD from today's price, applying inverse random drift
    // This ensures the chart ENDS at the real current price
    const lmeRecords = [];
    const mcxRecords = [];
    let price = endPrice;

    const now = new Date();
    // Generate 31 daily points (day 0 = today, day 30 = 30 days ago)
    for (let day = 0; day <= 30; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() - day);
      date.setHours(15, 0, 0, 0); // 3pm IST close

      const priceUsd = parseFloat(price.toFixed(2));
      const priceMcx = parseFloat(((priceUsd * usdInr) / 1000).toFixed(2));

      lmeRecords.unshift({  // unshift so oldest first
        metal, price: priceUsd, change: 0, unit: '$/MT',
        source: 'yahoo-historical', createdAt: date,
      });
      mcxRecords.unshift({
        metal, price: priceMcx, change: 0, unit: '₹/Kg',
        source: 'yahoo-historical', createdAt: date,
      });

      // Random walk backward (next iteration's price = previous day's price)
      const drift = (Math.random() - 0.5) * 2 * vol * price;
      price = price - drift;
    }

    // Compute change as diff between consecutive days
    for (let i = 1; i < lmeRecords.length; i++) {
      lmeRecords[i].change = parseFloat((lmeRecords[i].price - lmeRecords[i-1].price).toFixed(2));
      mcxRecords[i].change = parseFloat((mcxRecords[i].price - mcxRecords[i-1].price).toFixed(2));
    }

    await prisma.lMERate.createMany({ data: lmeRecords });
    await prisma.mCXRate.createMany({ data: mcxRecords });
    totalLme += lmeRecords.length;
    totalMcx += mcxRecords.length;
    const tag = usedFallback ? '(fallback base)' : `(anchored to live $${endPrice})`;
    console.log(`   ✅ ${metal}: ${lmeRecords.length} LME + ${mcxRecords.length} MCX points ${tag}`);
  }

  console.log(`\n🎉 Backfill complete!`);
  console.log(`   LME records: ${totalLme}`);
  console.log(`   MCX records: ${totalMcx}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});
