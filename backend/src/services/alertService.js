const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Check all active alerts against current rates
 * Triggers alert if threshold is crossed
 */
async function checkAlerts() {
  const activeAlerts = await prisma.alert.findMany({
    where: { isActive: true },
    include: {
      grade: { include: { metal: true } },
      hub: { include: { city: true } },
      user: true,
    },
  });

  for (const alert of activeAlerts) {
    try {
      // Get latest rate for this grade+hub
      const latestRate = await prisma.rate.findFirst({
        where: {
          gradeId: alert.gradeId,
          hubId: alert.hubId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestRate) continue;

      const currentPrice = latestRate.buyPrice || latestRate.sellPrice;
      if (!currentPrice) continue;

      let triggered = false;
      if (alert.direction === 'above' && currentPrice >= alert.threshold) {
        triggered = true;
      } else if (alert.direction === 'below' && currentPrice <= alert.threshold) {
        triggered = true;
      }

      if (triggered) {
        // Mark alert as triggered
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            isActive: false,
            triggeredAt: new Date(),
          },
        });

        // In production: send WhatsApp/SMS via Twilio here
        console.log(`[ALERT] Triggered for user ${alert.user.phone}: ${alert.grade.name} at ${currentPrice} (threshold: ${alert.threshold} ${alert.direction})`);

        // TODO: Twilio integration
        // await sendWhatsAppAlert(alert.user.phone, alert, currentPrice);
      }
    } catch (err) {
      console.error(`[ALERT] Error checking alert ${alert.id}:`, err.message);
    }
  }
}

module.exports = { checkAlerts };
