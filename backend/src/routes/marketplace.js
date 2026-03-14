const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/marketplace/listings
router.get('/listings', async (req, res) => {
  try {
    const { city, metalId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      expiresAt: { gt: new Date() },
    };

    if (metalId) where.metalId = metalId;
    if (city) {
      where.location = { contains: city, mode: 'insensitive' };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          metal: true,
          grade: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({ listings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('/api/marketplace/listings GET error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// POST /api/marketplace/listings
router.post('/listings', authMiddleware, async (req, res) => {
  try {
    const { metalId, gradeId, qty, unit, location, price, description, contact } = req.body;

    if (!metalId || !qty || !location || !contact) {
      return res.status(400).json({ error: 'metalId, qty, location, contact required' });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const listing = await prisma.listing.create({
      data: {
        userId: req.user.userId,
        metalId,
        gradeId: gradeId || null,
        qty: parseFloat(qty),
        unit: unit || 'kg',
        location,
        price: price ? parseFloat(price) : null,
        description: description || null,
        contact,
        expiresAt,
      },
      include: { metal: true, grade: true },
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error('/api/marketplace/listings POST error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// DELETE /api/marketplace/listings/:id
router.delete('/listings/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.userId !== req.user.userId) return res.status(403).json({ error: 'Not your listing' });

    await prisma.listing.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
