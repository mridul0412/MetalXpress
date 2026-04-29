/**
 * One-shot cleanup: removes all synthetic/fabricated price history.
 * After this runs, the DB only contains:
 *   - Admin-pasted rates (source: 'admin')
 *   - Real cron-fetched rates (source: 'cron') — accumulates every 15 min
 *   - Original seed rates (source: 'seed')
 *
 * Charts will show "collecting data" until enough cron snapshots accumulate.
 * Run once via temp start script.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Removing synthetic/fabricated price history...\n');

  const lmeDeleted = await prisma.lMERate.deleteMany({
    where: { source: { in: ['yahoo-historical', 'seed-history'] } },
  });
  const mcxDeleted = await prisma.mCXRate.deleteMany({
    where: { source: { in: ['yahoo-historical', 'seed-history'] } },
  });

  console.log(`   ✅ LME synthetic rows deleted: ${lmeDeleted.count}`);
  console.log(`   ✅ MCX synthetic rows deleted: ${mcxDeleted.count}`);

  // Show what remains
  const lmeRemaining = await prisma.lMERate.count();
  const mcxRemaining = await prisma.mCXRate.count();
  const lmeBySource = await prisma.lMERate.groupBy({
    by: ['source'], _count: { source: true },
  });

  console.log(`\n📊 Remaining data:`);
  console.log(`   LME total: ${lmeRemaining} rows`);
  console.log(`   MCX total: ${mcxRemaining} rows`);
  console.log(`   By source:`, lmeBySource.map(s => `${s.source}=${s._count.source}`).join(', '));

  console.log(`\n🎉 Cleanup complete! Charts will populate from now via 15-min cron.`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
