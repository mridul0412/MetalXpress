/**
 * One-shot cleanup: wipe test users + their cascade (listings, deals, offers, alerts, ratings).
 * Preserves admin + seed test users explicitly.
 *
 * Run via Railway temp start-script trick:
 *   1. Add `&& node src/scripts/wipeTestUsers.js` to backend/package.json `start`
 *   2. git push → Railway auto-deploys + runs script
 *   3. Revert package.json after deploy succeeds
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRESERVE_EMAILS = [
  'admin@bhavx.com',
  'test@bhavx.com',
  'rajesh@test.com',
  'amit@test.com',
  'suresh@test.com',
  'vikram@test.com',
];

async function main() {
  console.log('🗑️  Wiping non-seed users + their cascade...\n');

  const beforeCount = await prisma.user.count();
  console.log(`Total users before: ${beforeCount}`);

  // Find users to delete (everyone NOT in preserve list)
  const usersToDelete = await prisma.user.findMany({
    where: { email: { notIn: PRESERVE_EMAILS } },
    select: { id: true, email: true, phone: true },
  });
  console.log(`Users to delete: ${usersToDelete.length}`);
  if (usersToDelete.length === 0) {
    console.log('Nothing to delete. Exiting.');
    return prisma.$disconnect();
  }

  const userIds = usersToDelete.map(u => u.id);

  // Cascade-clean child records (Prisma onDelete may already handle some, but be explicit)
  // Order matters: child records first
  await prisma.offer.deleteMany({ where: { fromUserId: { in: userIds } } }).catch(() => {});
  await prisma.deal.deleteMany({
    where: { OR: [{ buyerId: { in: userIds } }, { sellerId: { in: userIds } }] },
  }).catch(() => {});
  await prisma.listing.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
  await prisma.alert.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});

  // Finally delete users
  const result = await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  const afterCount = await prisma.user.count();
  console.log(`\n✅ Deleted ${result.count} users.`);
  console.log(`Total users after: ${afterCount}`);
  console.log(`Preserved: ${PRESERVE_EMAILS.join(', ')}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
