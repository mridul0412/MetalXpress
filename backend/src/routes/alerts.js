const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/alerts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.userId },
      include: {
        grade: { include: { metal: true } },
        hub: { include: { city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { gradeId, hubId, threshold, direction } = req.body;

    if (!gradeId || !hubId || !threshold || !direction) {
      return res.status(400).json({ error: 'gradeId, hubId, threshold, direction required' });
    }

    if (!['above', 'below'].includes(direction)) {
      return res.status(400).json({ error: 'direction must be "above" or "below"' });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: req.user.userId,
        gradeId,
        hubId,
        threshold: parseFloat(threshold),
        direction,
      },
      include: {
        grade: { include: { metal: true } },
        hub: { include: { city: true } },
      },
    });

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const alert = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (alert.userId !== req.user.userId) return res.status(403).json({ error: 'Not your alert' });

    await prisma.alert.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
