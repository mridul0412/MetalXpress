const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/metals
router.get('/', async (req, res) => {
  try {
    const metals = await prisma.metal.findMany({
      include: { grades: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(metals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metals' });
  }
});

module.exports = router;
