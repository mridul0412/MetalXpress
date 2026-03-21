const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const COMMISSION_RATE = 0.001; // 0.1%

// GET /api/marketplace/listings — public browse (only verified+active listings)
router.get('/listings', async (req, res) => {
  try {
    const { city, metal, metalId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      status: 'verified',
      expiresAt: { gt: new Date() },
    };

    if (metalId) {
      where.metalId = metalId;
    } else if (metal) {
      where.metal = { name: { equals: metal, mode: 'insensitive' } };
    }
    if (city) {
      where.location = { contains: city, mode: 'insensitive' };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          metal: true,
          grade: true,
          user: { select: { name: true, city: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.listing.count({ where }),
    ]);

    // Never expose contact info in browse — contacts revealed only after deal payment
    const sanitized = listings.map(l => ({
      ...l,
      contact: undefined, // strip contact from browse response
      sellerName: l.user?.name || 'Anonymous',
      sellerCity: l.user?.city || l.location,
    }));

    res.json({ listings: sanitized, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('/api/marketplace/listings GET error:', err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// GET /api/marketplace/my-listings — user's own listings (all statuses)
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId: req.user.userId, isActive: true },
      include: { metal: true, grade: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your listings' });
  }
});

// POST /api/marketplace/listings — create new listing (goes to pending)
router.post('/listings', authMiddleware, async (req, res) => {
  try {
    const { metalId, gradeId, qty, unit, location, price, description, contact } = req.body;

    if (!metalId || !qty || !location || !contact) {
      return res.status(400).json({ error: 'metalId, qty, location, contact required' });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

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
        status: 'pending',
      },
      include: { metal: true, grade: true },
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error('/api/marketplace/listings POST error:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// DELETE /api/marketplace/listings/:id — deactivate own listing
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

// PATCH /api/marketplace/listings/:id/verify — admin verification
router.patch('/listings/:id/verify', async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password'];
    if (adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "verified" or "rejected"' });
    }

    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status },
      include: { metal: true, grade: true },
    });

    res.json({ success: true, listing: updated });
  } catch (err) {
    console.error('/api/marketplace/verify error:', err);
    res.status(500).json({ error: 'Failed to update listing status' });
  }
});

// GET /api/marketplace/pending — admin: get all pending listings
router.get('/pending', async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password'];
    if (adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const listings = await prisma.listing.findMany({
      where: { status: 'pending', isActive: true },
      include: { metal: true, grade: true, user: { select: { name: true, phone: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending listings' });
  }
});

// ── Deal Flow ─────────────────────────────────────────────────────────────────

// POST /api/marketplace/deals — buyer initiates a deal (calculates commission)
router.post('/deals', authMiddleware, async (req, res) => {
  try {
    const { listingId, offerPrice } = req.body;
    if (!listingId) return res.status(400).json({ error: 'listingId required' });

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { metal: true, grade: true },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'verified') return res.status(400).json({ error: 'Listing not available' });
    if (listing.userId === req.user.userId) return res.status(400).json({ error: 'Cannot buy your own listing' });

    // Calculate deal amount and commission
    const pricePerKg = offerPrice || listing.price;
    if (!pricePerKg) return res.status(400).json({ error: 'Price required — listing has no price, provide offerPrice' });

    const dealAmount = pricePerKg * listing.qty;
    const commission = Math.max(Math.ceil(dealAmount * COMMISSION_RATE), 1); // min ₹1

    const deal = await prisma.deal.create({
      data: {
        listingId,
        buyerId: req.user.userId,
        dealAmount,
        commission,
        status: 'pending',
      },
      include: {
        listing: { include: { metal: true, grade: true, user: { select: { name: true } } } },
      },
    });

    res.status(201).json({
      deal,
      commission,
      commissionFormatted: `₹${commission.toLocaleString('en-IN')}`,
      message: `Pay ₹${commission.toLocaleString('en-IN')} commission (0.1%) to connect with the seller.`,
    });
  } catch (err) {
    console.error('/api/marketplace/deals POST error:', err);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// POST /api/marketplace/deals/:id/pay — buyer pays commission (dev: instant, prod: Razorpay)
router.post('/deals/:id/pay', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        listing: { include: { metal: true, grade: true, user: { select: { name: true, phone: true, email: true } } } },
        buyer: { select: { name: true, phone: true, email: true } },
      },
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId) return res.status(403).json({ error: 'Not your deal' });
    if (deal.status !== 'pending') return res.status(400).json({ error: 'Deal already processed' });

    // TODO: Verify Razorpay payment in production
    // For dev mode: instantly mark as paid
    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: { status: 'connected', paidAt: new Date() },
      include: {
        listing: { include: { metal: true, grade: true, user: { select: { name: true, phone: true, email: true } } } },
        buyer: { select: { name: true, phone: true, email: true } },
      },
    });

    // Return contact details of BOTH parties
    res.json({
      success: true,
      deal: updated,
      sellerContact: {
        name: updated.listing.user.name,
        phone: updated.listing.user.phone,
        email: updated.listing.user.email,
        listingContact: updated.listing.contact,
      },
      buyerContact: {
        name: updated.buyer.name,
        phone: updated.buyer.phone,
        email: updated.buyer.email,
      },
      message: 'Commission paid! Contact details revealed. Complete the deal directly with the seller.',
    });
  } catch (err) {
    console.error('/api/marketplace/deals/pay error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// GET /api/marketplace/my-deals — buyer's deals
router.get('/my-deals', authMiddleware, async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { buyerId: req.user.userId },
      include: {
        listing: { include: { metal: true, grade: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// PATCH /api/marketplace/deals/:id/complete — mark deal as completed
router.patch('/deals/:id/complete', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId) return res.status(403).json({ error: 'Not your deal' });
    if (deal.status !== 'connected') return res.status(400).json({ error: 'Deal not in connected state' });

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: { status: 'completed', completedAt: new Date() },
    });

    res.json({ success: true, deal: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete deal' });
  }
});

module.exports = router;
