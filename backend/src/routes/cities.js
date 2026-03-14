const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/cities
router.get('/', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      include: { hubs: true },
      orderBy: { name: 'asc' },
    });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

module.exports = router;
