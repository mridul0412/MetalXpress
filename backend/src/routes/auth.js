const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const DEV_OTP = '1234';
const OTP_EXPIRY_MINUTES = 10;

// POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\+?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Valid Indian phone number required' });
    }

    const cleanPhone = phone.replace(/\s/g, '');

    // Delete old OTP sessions for this phone
    await prisma.oTPSession.deleteMany({ where: { phone: cleanPhone } });

    // In production: send via Twilio/MSG91
    // For dev: always use 1234
    const otp = process.env.NODE_ENV === 'production'
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : DEV_OTP;

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.oTPSession.create({
      data: { phone: cleanPhone, otp, expiresAt },
    });

    console.log(`[OTP] Phone: ${cleanPhone}, OTP: ${otp}`);

    res.json({
      success: true,
      message: process.env.NODE_ENV === 'production'
        ? 'OTP sent to your phone'
        : `OTP sent (dev mode: use ${DEV_OTP})`,
    });
  } catch (err) {
    console.error('/api/auth/request-otp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, traderType, city } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

    const cleanPhone = phone.replace(/\s/g, '');

    const session = await prisma.oTPSession.findFirst({
      where: {
        phone: cleanPhone,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) return res.status(400).json({ error: 'OTP expired or not found' });
    if (session.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    // Mark used
    await prisma.oTPSession.update({ where: { id: session.id }, data: { used: true } });

    // Upsert user
    const user = await prisma.user.upsert({
      where: { phone: cleanPhone },
      create: {
        phone: cleanPhone,
        name: name || null,
        city: city || null,
        traderType: traderType || 'CHECKING_RATES',
      },
      update: {
        ...(name && { name }),
        ...(city && { city }),
        ...(traderType && { traderType }),
      },
    });

    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error('/api/auth/verify-otp error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token' });
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
