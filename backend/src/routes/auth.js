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

// PATCH /api/auth/profile — update user profile after OTP login
router.patch('/profile', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token' });
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { name, traderType, city } = req.body;
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(name && { name }),
        ...(traderType && { traderType }),
        ...(city && { city }),
      },
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error('/api/auth/profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// GET /api/auth/subscription — check user subscription status (stub)
router.get('/subscription', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.json({ plan: 'free', active: false });
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.json({ plan: 'free', active: false });
    // TODO: real subscription lookup when Razorpay is integrated
    res.json({ plan: 'free', active: true, userId: user.id });
  } catch {
    res.json({ plan: 'free', active: false });
  }
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

// GET /api/auth/google — redirect to Google consent page
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'your_google_client_id.apps.googleusercontent.com') {
    return res.status(503).json({
      error: 'Google OAuth not configured',
      setup: [
        '1. Go to https://console.cloud.google.com',
        '2. Create a project → APIs & Services → Credentials',
        '3. Create OAuth 2.0 Client ID (Web application)',
        `4. Add redirect URI: ${process.env.APP_URL || 'http://localhost:3001'}/api/auth/google/callback`,
        '5. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
      ],
    });
  }

  const redirectUri = `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/google/callback`;
  const scope = 'openid email profile';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// GET /api/auth/google/callback — exchange code, upsert user, issue JWT
router.get('/google/callback', async (req, res) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret ||
      clientId === 'your_google_client_id.apps.googleusercontent.com') {
    return res.redirect(`${FRONTEND_URL}/?error=google_not_configured`);
  }

  const { code, error: oauthError } = req.query;
  if (oauthError || !code) {
    return res.redirect(`${FRONTEND_URL}/?error=google_auth_failed`);
  }

  try {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token from Google');

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();
    if (!googleUser.id || !googleUser.email) throw new Error('Invalid user info from Google');

    // Use google_<id> as phone placeholder (phone is required in schema)
    const phonePlaceholder = `google_${googleUser.id}`;

    // Upsert user — try by phone placeholder first, then by email if available
    let user;
    const existing = await prisma.user.findFirst({
      where: { phone: phonePlaceholder },
    });

    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: existing.name || googleUser.name || null,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          phone: phonePlaceholder,
          name: googleUser.name || null,
          traderType: 'CHECKING_RATES',
        },
      });
    }

    const jwtToken = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.redirect(`${FRONTEND_URL}/?token=${jwtToken}`);
  } catch (err) {
    console.error('[Google OAuth] Callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/?error=google_auth_failed`);
  }
});

module.exports = router;
