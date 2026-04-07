const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const DEV_OTP = '1234';
const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 12;

// Normalize phone: strip spaces/dashes, remove +91/91 prefix → bare 10-digit
function normalizePhone(raw) {
  if (!raw) return null;
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('+91')) p = p.slice(3);
  else if (p.startsWith('91') && p.length === 12) p = p.slice(2);
  return /^[6-9]\d{9}$/.test(p) ? p : null;
}

// POST /api/auth/request-otp
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) {
      return res.status(400).json({ error: 'Valid 10-digit Indian phone number required (starting with 6-9)' });
    }

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

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return res.status(400).json({ error: 'Valid Indian phone number required' });

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

    // Find existing user by phone (exact match or on an email-registered account)
    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

    if (user) {
      // Update profile fields if provided + mark phone as verified
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: true,
          ...(name && { name }),
          ...(city && { city }),
          ...(traderType && { traderType }),
        },
      });
    } else {
      // Create new user with phone
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          phoneVerified: true,
          name: name || null,
          city: city || null,
          traderType: traderType || 'CHECKING_RATES',
        },
      });
    }

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
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, phone: true, email: true, name: true, city: true, traderType: true,
        phoneVerified: true, kycVerified: true, createdAt: true, updatedAt: true,
        isBanned: true, banReason: true, cooldownUntil: true,
        completedDeals: true, avgRating: true, disputeCount: true,
        businessName: true, tradeCategory: true, termsAcceptedAt: true,
        panNumber: true, gstNumber: true, legalName: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// PATCH /api/auth/profile — update user profile (name, city, phone, email linking)
router.patch('/profile', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token' });
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { name, traderType, city, phone, email, businessName, tradeCategory, kycComplete, panNumber, gstNumber, legalName } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (traderType) updateData.traderType = traderType;
    if (city) updateData.city = city;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (tradeCategory) updateData.tradeCategory = tradeCategory;
    if (legalName) updateData.legalName = legalName;

    // PAN validation (ABCDE1234F format)
    if (panNumber) {
      const pan = panNumber.toUpperCase().trim();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
        return res.status(400).json({ error: 'Invalid PAN format. Expected: ABCDE1234F (5 letters, 4 digits, 1 letter)' });
      }
      updateData.panNumber = pan;
    }

    // GST validation (15 alphanumeric)
    if (gstNumber) {
      const gst = gstNumber.toUpperCase().trim();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(gst)) {
        return res.status(400).json({ error: 'Invalid GST format. Expected 15-character GSTIN (e.g., 07ABCDE1234F1Z5)' });
      }
      updateData.gstNumber = gst;
    }

    // KYC completion: requires PAN + tradeCategory at minimum
    if (kycComplete === true) {
      if (!updateData.panNumber && !req.body.panNumber) {
        const currentUser = await prisma.user.findUnique({ where: { id: payload.userId }, select: { panNumber: true } });
        if (!currentUser?.panNumber) return res.status(400).json({ error: 'PAN Card number required to complete verification' });
      }
      updateData.kycVerified = true;
    }

    // Link/change phone — requires OTP verification if changing
    if (phone) {
      const cleanPhone = normalizePhone(phone);
      if (!cleanPhone) return res.status(400).json({ error: 'Valid Indian phone number required' });
      const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existing && existing.id !== payload.userId) {
        return res.status(409).json({ error: 'This phone number is already linked to another account' });
      }
      // Require OTP if phone is being changed (not just linked for the first time)
      const currentUser = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (currentUser.phone && currentUser.phone !== cleanPhone) {
        const { phoneOtp } = req.body;
        if (!phoneOtp) return res.status(400).json({ error: 'OTP required to change phone number' });
        const session = await prisma.oTPSession.findFirst({
          where: { phone: cleanPhone, used: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        });
        if (!session || session.otp !== phoneOtp) return res.status(400).json({ error: 'Invalid or expired OTP for phone change' });
        await prisma.oTPSession.update({ where: { id: session.id }, data: { used: true } });
        updateData.phoneVerified = true;
      }
      updateData.phone = cleanPhone;
    }

    // Link email to account
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing && existing.id !== payload.userId) {
        return res.status(409).json({ error: 'This email is already linked to another account' });
      }
      updateData.email = cleanEmail;
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error('/api/auth/profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// GET /api/auth/subscription — check user subscription status
router.get('/subscription', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.json({ plan: 'free', active: false });
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.json({ plan: 'free', active: false });

    // Pro test accounts: test@metalxpress.in or any email in PRO_EMAILS env var
    const proEmails = (process.env.PRO_EMAILS || 'test@metalxpress.in').split(',').map(e => e.trim().toLowerCase());
    if (user.email && proEmails.includes(user.email.toLowerCase())) {
      return res.json({ plan: 'pro', active: true, userId: user.id });
    }

    // TODO: real subscription lookup when Razorpay is integrated
    res.json({ plan: 'free', active: true, userId: user.id });
  } catch {
    res.json({ plan: 'free', active: false });
  }
});

// ── Email + Password Auth ────────────────────────────────────────────────────

// POST /api/auth/register — email+password+phone signup (OTP required)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, traderType, city, phone, otp, termsAccepted, businessName, tradeCategory, panNumber, gstNumber, legalName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) return res.status(400).json({ error: 'Valid 10-digit Indian phone number required for verification' });

    // Verify OTP if provided (required for new registration)
    if (otp) {
      const session = await prisma.oTPSession.findFirst({
        where: { phone: cleanPhone, used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      });
      if (!session) return res.status(400).json({ error: 'OTP expired or not found. Request a new one.' });
      if (session.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
      // Mark OTP as used
      await prisma.oTPSession.update({ where: { id: session.id }, data: { used: true } });
    } else {
      return res.status(400).json({ error: 'Phone OTP verification required to create an account' });
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    // Check phone uniqueness
    const phoneUser = await prisma.user.findUnique({ where: { phone: cleanPhone } });
    if (phoneUser) return res.status(409).json({ error: 'This phone number is already registered' });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: cleanPhone,
        phoneVerified: true,
        name: name || null,
        city: city || null,
        traderType: traderType || 'CHECKING_RATES',
        ...(termsAccepted ? { termsAcceptedAt: new Date() } : {}),
        ...(businessName ? { businessName } : {}),
        ...(tradeCategory ? { tradeCategory } : {}),
        ...(legalName ? { legalName } : {}),
        ...(panNumber ? { panNumber: panNumber.toUpperCase().trim() } : {}),
        ...(gstNumber ? { gstNumber: gstNumber.toUpperCase().trim() } : {}),
        ...(panNumber && tradeCategory ? { kycVerified: true } : {}),
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, traderType: user.traderType } });
  } catch (err) {
    console.error('/api/auth/register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login — email+password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, traderType: user.traderType } });
  } catch (err) {
    console.error('/api/auth/login error:', err);
    res.status(500).json({ error: 'Login failed' });
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

    // Find existing user by email first, then by google phone placeholder
    let user;
    const existingByEmail = googleUser.email
      ? await prisma.user.findUnique({ where: { email: googleUser.email.toLowerCase() } })
      : null;
    const phonePlaceholder = `google_${googleUser.id}`;
    const existingByPhone = await prisma.user.findFirst({ where: { phone: phonePlaceholder } });

    const existing = existingByEmail || existingByPhone;

    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: existing.name || googleUser.name || null,
          email: existing.email || googleUser.email?.toLowerCase() || null,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: googleUser.email?.toLowerCase() || null,
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
