const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const COMMISSION_RATE = 0.001; // 0.1%

// Ban/cooldown check helper
async function checkBanCooldown(userId) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { isBanned: true, banReason: true, cooldownUntil: true } });
  if (u?.isBanned) return { blocked: true, reason: u.banReason || 'Account suspended due to policy violations' };
  if (u?.cooldownUntil && new Date(u.cooldownUntil) > new Date()) return { blocked: true, reason: `Account on cooldown until ${u.cooldownUntil.toLocaleDateString()}` };
  return { blocked: false };
}

// ─── FILE UPLOAD CONFIG ─────────────────────────────────────────────────────
//
//  CURRENT (MVP / local dev):
//    Files saved to backend/uploads/ via multer disk storage.
//    Served via express.static('/uploads', ...) in index.js.
//    ⚠️  NOT suitable for production on stateless containers (Railway, Heroku,
//        Render) — the uploads/ folder is wiped on every deploy/restart.
//
//  TO GO LIVE (cloud storage):
//    Option A — Cloudinary (recommended, free tier: 25GB storage, 25GB/month BW):
//      1. npm install cloudinary multer-storage-cloudinary
//      2. Set in .env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
//      3. Replace `const storage = multer.diskStorage(...)` below with:
//         const { CloudinaryStorage } = require('multer-storage-cloudinary');
//         const cloudinary = require('cloudinary').v2;
//         cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//           api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
//         const storage = new CloudinaryStorage({ cloudinary, params: {
//           folder: 'metalxpress', allowed_formats: ['jpg','png','gif','webp','mp4','mov','webm'] }});
//      4. The upload returns full https://res.cloudinary.com/... URLs — no /uploads/ prefix needed.
//
//    Option B — AWS S3 + multer-s3:
//      npm install @aws-sdk/client-s3 multer-s3
//      Set: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
//
//  Seed data (listings in seed.js) uses Pexels CDN + Wikimedia URLs directly —
//  no local files, works in any environment including production cloud.
// ─────────────────────────────────────────────────────────────────────────────

// Ensure uploads directory exists (for local dev / MVP)
const fs = require('fs');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only images and videos allowed (jpg, png, gif, webp, mp4, mov, webm)'));
  },
});

// POST /api/marketplace/upload — upload up to 5 images/videos, returns file URLs
router.post('/upload', authMiddleware, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    // Returns /uploads/filename paths — frontend prefixes with backend URL for display.
    // When using Cloudinary/S3, this returns full https:// URLs instead.
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

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
          user: { select: { name: true, city: true, completedDeals: true, avgRating: true, kycVerified: true } },
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
      sellerCompletedDeals: l.user?.completedDeals || 0,
      sellerAvgRating: l.user?.avgRating || 0,
      sellerKycVerified: l.user?.kycVerified || false,
      imageUrls: l.images ? JSON.parse(l.images) : [],
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
    // Ban/cooldown check
    const banCheck = await checkBanCooldown(req.user.userId);
    if (banCheck.blocked) return res.status(403).json({ error: banCheck.reason, code: 'ACCOUNT_BLOCKED' });

    // KYC check
    const userObj = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!userObj.kycVerified) return res.status(403).json({ error: 'KYC verification required before posting listings', code: 'KYC_REQUIRED' });

    const { metalId, gradeId, qty, unit, location, price, description, contact, images } = req.body;

    if (!metalId || !qty || !location || !contact) {
      return res.status(400).json({ error: 'metalId, qty, location, contact required' });
    }

    // Validate images array (URLs stored as JSON string)
    let imagesJson = null;
    if (images) {
      const arr = Array.isArray(images) ? images : [];
      if (arr.length > 5) return res.status(400).json({ error: 'Maximum 5 images allowed' });
      imagesJson = arr.length > 0 ? JSON.stringify(arr) : null;
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
        images: imagesJson,
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
      include: {
        metal: true, grade: true,
        user: { select: { id: true, name: true, phone: true, email: true, kycVerified: true, phoneVerified: true, city: true, traderType: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse images for admin view
    const enriched = listings.map(l => ({
      ...l,
      imageUrls: l.images ? JSON.parse(l.images) : [],
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending listings' });
  }
});

// Helper: expire stale deals (lazy check)
async function expireStaleDeals(userId) {
  await prisma.deal.updateMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      status: 'negotiating',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'expired' },
  });
}

const DEAL_INCLUDE = {
  listing: { include: { metal: true, grade: true } },
  buyer: { select: { id: true, name: true, city: true } },
  seller: { select: { id: true, name: true, city: true } },
  offers: { orderBy: { createdAt: 'asc' } },
};

// ── Deal / Negotiation Flow ──────────────────────────────────────────────────

// POST /api/marketplace/deals — buyer makes initial offer
router.post('/deals', authMiddleware, async (req, res) => {
  try {
    // Ban/cooldown check
    const banCheck = await checkBanCooldown(req.user.userId);
    if (banCheck.blocked) return res.status(403).json({ error: banCheck.reason, code: 'ACCOUNT_BLOCKED' });

    const { listingId, pricePerKg, qty, message } = req.body;
    if (!listingId || !pricePerKg) return res.status(400).json({ error: 'listingId and pricePerKg required' });

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { metal: true, grade: true },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'verified') return res.status(400).json({ error: 'Listing not available' });
    if (listing.userId === req.user.userId) return res.status(400).json({ error: 'Cannot make offer on your own listing' });

    // Check for existing active deal between same buyer+listing
    const existing = await prisma.deal.findFirst({
      where: {
        listingId, buyerId: req.user.userId,
        status: { in: ['negotiating', 'agreed'] },
      },
    });
    if (existing) return res.status(400).json({ error: 'You already have an active negotiation on this listing', dealId: existing.id });

    const offerQty = parseFloat(qty) || listing.qty;
    const now = new Date();

    const deal = await prisma.deal.create({
      data: {
        listingId,
        buyerId: req.user.userId,
        sellerId: listing.userId,
        status: 'negotiating',
        lastOfferAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        offers: {
          create: {
            fromUserId: req.user.userId,
            pricePerKg: parseFloat(pricePerKg),
            qty: offerQty,
            message: message || null,
            status: 'pending',
          },
        },
      },
      include: DEAL_INCLUDE,
    });

    res.status(201).json({ deal, message: 'Offer sent! The seller will be notified.' });
  } catch (err) {
    console.error('/api/marketplace/deals POST error:', err);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// POST /api/marketplace/deals/:id/counter — counter-offer
router.post('/deals/:id/counter', authMiddleware, async (req, res) => {
  try {
    // Ban/cooldown check
    const banCheck = await checkBanCooldown(req.user.userId);
    if (banCheck.blocked) return res.status(403).json({ error: banCheck.reason, code: 'ACCOUNT_BLOCKED' });

    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: { offers: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.status !== 'negotiating') return res.status(400).json({ error: 'Deal is not in negotiation' });

    const userId = req.user.userId;
    if (deal.buyerId !== userId && deal.sellerId !== userId) return res.status(403).json({ error: 'Not your deal' });

    const lastOffer = deal.offers[0];
    if (!lastOffer || lastOffer.fromUserId === userId) {
      return res.status(400).json({ error: 'You cannot counter your own offer — wait for the other party' });
    }

    const { pricePerKg, qty, message } = req.body;
    if (!pricePerKg) return res.status(400).json({ error: 'pricePerKg required' });

    // Mark previous offer as countered, create new one
    await prisma.offer.update({ where: { id: lastOffer.id }, data: { status: 'countered' } });

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        lastOfferAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        offers: {
          create: {
            fromUserId: userId,
            pricePerKg: parseFloat(pricePerKg),
            qty: parseFloat(qty) || lastOffer.qty,
            message: message || null,
            status: 'pending',
          },
        },
      },
      include: DEAL_INCLUDE,
    });

    res.json({ deal: updated, message: 'Counter-offer sent!' });
  } catch (err) {
    console.error('/api/marketplace/deals/counter error:', err);
    res.status(500).json({ error: 'Failed to counter' });
  }
});

// POST /api/marketplace/deals/:id/accept — accept the last pending offer
router.post('/deals/:id/accept', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: { offers: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.status !== 'negotiating') return res.status(400).json({ error: 'Deal is not in negotiation' });

    const userId = req.user.userId;
    if (deal.buyerId !== userId && deal.sellerId !== userId) return res.status(403).json({ error: 'Not your deal' });

    const lastOffer = deal.offers[0];
    if (!lastOffer || lastOffer.fromUserId === userId) {
      return res.status(400).json({ error: 'You can only accept the other party\'s offer' });
    }

    // Calculate commission on agreed price
    const agreedPrice = lastOffer.pricePerKg;
    const agreedQty = lastOffer.qty;
    const dealAmount = agreedPrice * agreedQty;
    const commission = Math.max(Math.ceil(dealAmount * COMMISSION_RATE), 1);

    await prisma.offer.update({ where: { id: lastOffer.id }, data: { status: 'accepted' } });

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: { status: 'agreed', agreedPrice, agreedQty, dealAmount, commission },
      include: DEAL_INCLUDE,
    });

    res.json({
      deal: updated,
      commission,
      commissionFormatted: `₹${commission.toLocaleString('en-IN')}`,
      message: `Both parties agreed on ₹${agreedPrice}/kg × ${agreedQty}kg = ₹${dealAmount.toLocaleString('en-IN')}. Pay ₹${commission.toLocaleString('en-IN')} (0.1%) commission to connect.`,
    });
  } catch (err) {
    console.error('/api/marketplace/deals/accept error:', err);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// POST /api/marketplace/deals/:id/reject — reject and cancel negotiation
router.post('/deals/:id/reject', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: { offers: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId && deal.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not your deal' });
    }
    if (!['negotiating', 'agreed'].includes(deal.status)) {
      return res.status(400).json({ error: 'Cannot reject deal in this state' });
    }

    if (deal.offers[0]) {
      await prisma.offer.update({ where: { id: deal.offers[0].id }, data: { status: 'rejected' } });
    }

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
      include: DEAL_INCLUDE,
    });

    res.json({ deal: updated, message: 'Deal cancelled.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject deal' });
  }
});

// POST /api/marketplace/deals/:id/pay — pay commission after agreement (dev: instant)
router.post('/deals/:id/pay', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        listing: { include: { metal: true, grade: true, user: { select: { name: true, phone: true, email: true } } } },
        buyer: { select: { name: true, phone: true, email: true } },
        seller: { select: { name: true, phone: true, email: true } },
        offers: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId) return res.status(403).json({ error: 'Only the buyer pays commission' });
    if (deal.status !== 'agreed') return res.status(400).json({ error: 'Deal must be agreed before payment' });

    // TODO: Verify Razorpay payment in production
    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: { status: 'connected', paidAt: new Date() },
      include: {
        listing: { include: { metal: true, grade: true, user: { select: { name: true, phone: true, email: true } } } },
        buyer: { select: { name: true, phone: true, email: true } },
        seller: { select: { name: true, phone: true, email: true } },
        offers: { orderBy: { createdAt: 'asc' } },
      },
    });

    res.json({
      success: true,
      deal: updated,
      sellerContact: {
        name: updated.seller.name,
        phone: updated.seller.phone,
        email: updated.seller.email,
        listingContact: updated.listing.contact,
      },
      buyerContact: {
        name: updated.buyer.name,
        phone: updated.buyer.phone,
        email: updated.buyer.email,
      },
      message: 'Commission paid! Contact details revealed.',
    });
  } catch (err) {
    console.error('/api/marketplace/deals/pay error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// GET /api/marketplace/deals/:id — single deal detail with offer history
router.get('/deals/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        ...DEAL_INCLUDE,
        // Only reveal contacts if deal is connected/completed
        buyer: { select: { id: true, name: true, city: true, phone: true, email: true } },
        seller: { select: { id: true, name: true, city: true, phone: true, email: true } },
      },
    });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId && deal.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not your deal' });
    }

    // Strip contact info unless deal is connected/completed
    if (!['connected', 'completed'].includes(deal.status)) {
      deal.buyer.phone = undefined;
      deal.buyer.email = undefined;
      deal.seller.phone = undefined;
      deal.seller.email = undefined;
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// GET /api/marketplace/my-deals — all deals for current user (as buyer OR seller)
router.get('/my-deals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    await expireStaleDeals(userId);

    const { role } = req.query; // buyer | seller | all (default)
    const where = {};
    if (role === 'buyer') where.buyerId = userId;
    else if (role === 'seller') where.sellerId = userId;
    else where.OR = [{ buyerId: userId }, { sellerId: userId }];

    const deals = await prisma.deal.findMany({
      where,
      include: {
        listing: { include: { metal: true, grade: true } },
        buyer: { select: { id: true, name: true, city: true } },
        seller: { select: { id: true, name: true, city: true } },
        offers: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastOfferAt: 'desc' },
    });

    // Add role flag and unread indicator
    const enriched = deals.map(d => ({
      ...d,
      myRole: d.buyerId === userId ? 'buyer' : 'seller',
      otherParty: d.buyerId === userId ? d.seller : d.buyer,
      lastOffer: d.offers[0] || null,
      hasNewOffer: d.offers[0] && d.offers[0].fromUserId !== userId && d.offers[0].status === 'pending',
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// GET /api/marketplace/notifications — lightweight poll for deal activity
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Count deals where the latest offer is from the other party and pending
    const [pendingAsbuyer, pendingAsSeller, agreedDeals] = await Promise.all([
      prisma.deal.count({
        where: {
          buyerId: userId, status: 'negotiating',
          offers: { some: { fromUserId: { not: userId }, status: 'pending' } },
        },
      }),
      prisma.deal.count({
        where: {
          sellerId: userId, status: 'negotiating',
          offers: { some: { fromUserId: { not: userId }, status: 'pending' } },
        },
      }),
      prisma.deal.count({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }], status: 'agreed' },
      }),
    ]);

    res.json({
      pendingOffers: pendingAsbuyer + pendingAsSeller,
      agreedDeals,
      total: pendingAsbuyer + pendingAsSeller + agreedDeals,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/marketplace/deals/:id/dispute — raise a dispute on a connected deal
router.post('/deals/:id/dispute', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId && deal.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not your deal' });
    }
    if (!['connected', 'completed'].includes(deal.status)) {
      return res.status(400).json({ error: 'Can only dispute connected or completed deals' });
    }

    const { reason, evidence, category } = req.body;
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a detailed reason (at least 10 characters)' });
    }

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        status: 'disputed',
        disputeReason: reason.trim(),
        disputedAt: new Date(),
        disputeEvidence: evidence ? JSON.stringify(evidence) : null,
        disputeCategory: category || 'other',
      },
      include: DEAL_INCLUDE,
    });

    // Increment dispute count for the filing user; if >= 3, set cooldown
    const newCount = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { disputeCount: true } });
    const updatedCount = (newCount?.disputeCount || 0) + 1;
    const cooldownData = updatedCount >= 3 ? { cooldownUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } : {};
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { disputeCount: updatedCount, ...cooldownData },
    });

    res.json({
      deal: updated,
      message: 'Dispute raised. Our team will review within 48 hours. Commission is held in escrow until resolved.',
    });
  } catch (err) {
    console.error('/api/marketplace/deals/dispute error:', err);
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
});

// GET /api/marketplace/disputes — admin: get all disputed deals
router.get('/disputes', async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password'];
    if (adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const deals = await prisma.deal.findMany({
      where: { status: 'disputed' },
      include: {
        ...DEAL_INCLUDE,
        buyer: { select: { id: true, name: true, city: true, phone: true, email: true } },
        seller: { select: { id: true, name: true, city: true, phone: true, email: true } },
      },
      orderBy: { disputedAt: 'desc' },
    });

    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disputes' });
  }
});

// PATCH /api/marketplace/deals/:id/resolve-dispute — admin resolves a dispute
router.patch('/deals/:id/resolve-dispute', async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password'];
    if (adminPass !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { resolution } = req.body; // 'refund' | 'completed' | 'cancelled'
    if (!['refund', 'completed', 'cancelled'].includes(resolution)) {
      return res.status(400).json({ error: 'Resolution must be refund, completed, or cancelled' });
    }

    const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.status !== 'disputed') return res.status(400).json({ error: 'Deal is not in disputed state' });

    // Refund policy automation based on dispute category
    const REFUND_POLICY = {
      seller_no_response: { refund: true, banSeller: false, action: 'warn_seller' },
      buyer_ghosted: { refund: false, banBuyer: false },
      material_quality: { refund: false, shareKyc: true },
      fake_listing: { refund: true, banSeller: true },
      both_claim_no_deal: { refund: false },
    };

    const policy = REFUND_POLICY[deal.disputeCategory] || {};
    const shouldRefund = resolution === 'refund' || (policy.refund && resolution !== 'completed');
    const newStatus = shouldRefund ? 'cancelled' : resolution === 'completed' ? 'completed' : 'cancelled';

    const updated = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        status: newStatus,
        resolvedAt: new Date(),
        resolvedBy: 'admin',
        refundIssued: shouldRefund,
        ...(newStatus === 'completed' ? { completedAt: new Date() } : {}),
      },
      include: DEAL_INCLUDE,
    });

    // If fake_listing policy triggers, ban the seller
    if (policy.banSeller && deal.sellerId) {
      await prisma.user.update({
        where: { id: deal.sellerId },
        data: { isBanned: true, banReason: 'Fake listing detected via dispute resolution', bannedAt: new Date() },
      });
    }

    res.json({
      deal: updated,
      policyApplied: deal.disputeCategory ? (policy.refund !== undefined ? deal.disputeCategory : 'manual') : 'manual',
      message: shouldRefund
        ? 'Dispute resolved: commission refunded, deal cancelled.'
        : newStatus === 'completed'
        ? 'Dispute resolved: deal marked as completed.'
        : 'Dispute resolved: deal cancelled.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

// PATCH /api/marketplace/deals/:id/complete — mark deal as completed
router.patch('/deals/:id/complete', authMiddleware, async (req, res) => {
  try {
    const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.buyerId !== req.user.userId && deal.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not your deal' });
    }
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

// POST /api/marketplace/deals/:id/rate — rate a completed deal
router.post('/deals/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { score, comment } = req.body;
    if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Score must be 1-5' });

    const deal = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    if (deal.status !== 'completed') return res.status(400).json({ error: 'Can only rate completed deals' });

    const isBuyer = deal.buyerId === req.user.userId;
    const isSeller = deal.sellerId === req.user.userId;
    if (!isBuyer && !isSeller) return res.status(403).json({ error: 'Not your deal' });

    const toUserId = isBuyer ? deal.sellerId : deal.buyerId;

    try {
      const rating = await prisma.rating.create({
        data: { dealId: deal.id, fromUserId: req.user.userId, toUserId, score: parseInt(score), comment: comment?.substring(0, 500) }
      });

      // Recalculate stats
      const agg = await prisma.rating.aggregate({ where: { toUserId }, _avg: { score: true }, _count: true });
      await prisma.user.update({ where: { id: toUserId }, data: { avgRating: agg._avg.score || 0, completedDeals: agg._count } });

      res.json({ rating });
    } catch (e) {
      if (e.code === 'P2002') return res.status(400).json({ error: 'Already rated this deal' });
      throw e;
    }
  } catch (err) {
    console.error('/api/marketplace/deals/rate error:', err);
    res.status(500).json({ error: 'Failed to rate deal' });
  }
});

// GET /api/marketplace/users/:id/ratings — public user ratings
router.get('/users/:id/ratings', async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { toUserId: req.params.id },
      include: { fromUser: { select: { name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { avgRating: true, completedDeals: true, name: true } });
    res.json({ ratings, user });
  } catch (err) {
    console.error('/api/marketplace/users/ratings error:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

module.exports = router;
