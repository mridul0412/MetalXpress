const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
// ── SMS Provider: MSG91 (parked — switch back by uncommenting and removing Firebase below)
// const { sendOTP } = require('../services/smsService');
const { verifyFirebaseToken } = require('../services/firebaseAdmin');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

const DEV_OTP = '1234';
const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

// Normalize phone: strip spaces/dashes, remove +91/91 prefix → bare 10-digit
function normalizePhone(raw) {
  if (!raw) return null;
  let p = raw.replace(/[\s\-()]/g, '');
  if (p.startsWith('+91')) p = p.slice(3);
  else if (p.startsWith('91') && p.length === 12) p = p.slice(2);
  return /^[6-9]\d{9}$/.test(p) ? p : null;
}

// Generate a secure random token (hex string)
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Strip sensitive fields (passwordHash, OTP secrets, reset tokens) and return
// the standardized public-facing user shape. Use this everywhere a token-issuing
// endpoint sends a `user` object back to the frontend — keeps the AuthContext
// state in sync with what GET /me returns, so KYC + verification gates don't
// flicker between login and the first /me refresh.
function publicUserFields(u) {
  if (!u) return null;
  return {
    id:             u.id,
    email:          u.email,
    name:           u.name,
    phone:          u.phone,
    city:           u.city,
    traderType:     u.traderType,
    emailVerified:  u.emailVerified,
    phoneVerified:  u.phoneVerified,
    kycVerified:    u.kycVerified,
    panNumber:      u.panNumber,
    tradeCategory:  u.tradeCategory,
    businessName:   u.businessName,
    legalName:      u.legalName,
    gstNumber:      u.gstNumber,
    isBanned:       u.isBanned,
    banReason:      u.banReason,
    cooldownUntil:  u.cooldownUntil,
    avgRating:      u.avgRating,
    completedDeals: u.completedDeals,
    disputeCount:   u.disputeCount,
    termsAcceptedAt: u.termsAcceptedAt,
    createdAt:      u.createdAt,
  };
}

// Sign a JWT
function signJWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Verify JWT and return userId
function verifyJWT(req) {
  const header = req.headers.authorization;
  if (!header) throw new Error('No token');
  const token = header.replace('Bearer ', '');
  return jwt.verify(token, process.env.JWT_SECRET);
}

// ════════════════════════════════════════════════════════════════════════════
// MSG91 OTP endpoints — PARKED. Uncomment to switch back to MSG91.
// To re-enable: uncomment below, re-import sendOTP, remove Firebase import.
// ════════════════════════════════════════════════════════════════════════════
//
// router.post('/request-otp', async (req, res) => {
//   try {
//     const { phone } = req.body;
//     const cleanPhone = normalizePhone(phone);
//     if (!cleanPhone) return res.status(400).json({ error: 'Valid 10-digit Indian phone number required' });
//     await prisma.oTPSession.deleteMany({ where: { phone: cleanPhone } });
//     const isMSG91Configured = process.env.MSG91_API_KEY && process.env.MSG91_API_KEY !== 'your_msg91_api_key';
//     const otp = isMSG91Configured ? Math.floor(1000 + Math.random() * 9000).toString() : DEV_OTP;
//     const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
//     await prisma.oTPSession.create({ data: { phone: cleanPhone, otp, expiresAt } });
//     await sendOTP(cleanPhone, otp);
//     res.json({ success: true, message: isMSG91Configured ? 'OTP sent' : `Dev OTP: ${DEV_OTP}`, dev: !isMSG91Configured });
//   } catch (err) { console.error('/request-otp error:', err); res.status(500).json({ error: 'Failed to send OTP' }); }
// });
//
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { phone, otp, name, traderType, city } = req.body;
//     if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
//     const cleanPhone = normalizePhone(phone);
//     if (!cleanPhone) return res.status(400).json({ error: 'Valid Indian phone number required' });
//     const session = await prisma.oTPSession.findFirst({ where: { phone: cleanPhone, used: false, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
//     if (!session) return res.status(400).json({ error: 'OTP expired or not found' });
//     if (session.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
//     await prisma.oTPSession.update({ where: { id: session.id }, data: { used: true } });
//     let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
//     if (user) {
//       user = await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true, ...(name && { name }), ...(city && { city }), ...(traderType && { traderType }) } });
//     } else {
//       user = await prisma.user.create({ data: { phone: cleanPhone, phoneVerified: true, name: name || null, city: city || null, traderType: traderType || 'CHECKING_RATES' } });
//     }
//     const token = signJWT({ userId: user.id, phone: user.phone });
//     res.json({ success: true, token, user });
//   } catch (err) { console.error('/verify-otp error:', err); res.status(500).json({ error: 'Verification failed' }); }
// });
// ════════════════════════════════════════════════════════════════════════════

// ── POST /api/auth/check-phone ───────────────────────────────────────────────
// Quick check: is this phone number registered? Used by Login before sending OTP.
router.post('/check-phone', async (req, res) => {
  try {
    const cleanPhone = normalizePhone(req.body.phone);
    if (!cleanPhone) return res.status(400).json({ error: 'Invalid phone number' });
    const user = await prisma.user.findUnique({ where: { phone: cleanPhone }, select: { id: true } });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// ── POST /api/auth/verify-firebase-otp ──────────────────────────────────────
// Firebase Phone Auth: frontend verifies OTP directly with Firebase,
// then sends the resulting ID token here. We verify it and issue our JWT.
router.post('/verify-firebase-otp', async (req, res) => {
  try {
    const { firebaseToken, name, traderType, city, loginOnly } = req.body;
    if (!firebaseToken) return res.status(400).json({ error: 'Firebase ID token required' });

    // Verify the token with Firebase Admin SDK
    const decoded = await verifyFirebaseToken(firebaseToken);
    const firebasePhone = decoded.phone_number; // format: +919876543210

    if (!firebasePhone) return res.status(400).json({ error: 'No phone number in Firebase token' });

    // Normalize to bare 10-digit for our DB
    const cleanPhone = normalizePhone(firebasePhone);
    if (!cleanPhone) return res.status(400).json({ error: 'Invalid phone number from Firebase' });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

    if (user) {
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
      if (loginOnly) {
        return res.status(404).json({ error: 'No account found with this number. Please sign up first.' });
      }
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

    const token = signJWT({ userId: user.id, phone: user.phone });
    res.json({ success: true, token, user: publicUserFields(user) });
  } catch (err) {
    console.error('/verify-firebase-otp error:', err);
    if (err.code === 'auth/id-token-expired') return res.status(401).json({ error: 'Firebase token expired, please try again' });
    if (err.code === 'auth/argument-error') return res.status(400).json({ error: 'Invalid Firebase token' });
    res.status(500).json({ error: 'Phone verification failed' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const payload = verifyJWT(req);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, phone: true, email: true, name: true, city: true, traderType: true,
        phoneVerified: true, emailVerified: true, kycVerified: true,
        createdAt: true, updatedAt: true,
        isBanned: true, banReason: true, cooldownUntil: true,
        completedDeals: true, avgRating: true, disputeCount: true,
        businessName: true, tradeCategory: true, termsAcceptedAt: true,
        panNumber: true, gstNumber: true, legalName: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ── PATCH /api/auth/profile ──────────────────────────────────────────────────
router.patch('/profile', async (req, res) => {
  try {
    const payload = verifyJWT(req);
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

    // KYC completion: requires PAN
    if (kycComplete === true) {
      if (!updateData.panNumber) {
        const currentUser = await prisma.user.findUnique({ where: { id: payload.userId }, select: { panNumber: true } });
        if (!currentUser?.panNumber) return res.status(400).json({ error: 'PAN Card number required to complete verification' });
      }
      updateData.kycVerified = true;
    }

    // Link/change phone — requires OTP if changing existing phone
    if (phone) {
      const cleanPhone = normalizePhone(phone);
      if (!cleanPhone) return res.status(400).json({ error: 'Valid Indian phone number required' });
      const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existing && existing.id !== payload.userId) {
        return res.status(409).json({ error: 'This phone number is already linked to another account' });
      }
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

    const user = await prisma.user.update({ where: { id: payload.userId }, data: updateData });
    res.json({ success: true, user });
  } catch (err) {
    console.error('/api/auth/profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// ── GET /api/auth/subscription ───────────────────────────────────────────────
router.get('/subscription', async (req, res) => {
  try {
    const payload = verifyJWT(req);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.json({ plan: 'free', active: false });

    const proEmails = (process.env.PRO_EMAILS || 'test@metalxpress.in').split(',').map(e => e.trim().toLowerCase());
    if (user.email && proEmails.includes(user.email.toLowerCase())) {
      return res.json({ plan: 'pro', active: true, userId: user.id });
    }

    res.json({ plan: 'free', active: true, userId: user.id });
  } catch {
    res.json({ plan: 'free', active: false });
  }
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, traderType, city, firebaseToken, termsAccepted, businessName, tradeCategory, panNumber, gstNumber, legalName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/[0-9]/.test(password) && !/[!@#$%^&*(),.?":{}|<>_\-]/.test(password))
      return res.status(400).json({ error: 'Password must contain at least one number or special character' });

    // Phone verification via Firebase token (mandatory for new signups)
    let cleanPhone = null;
    let phoneVerified = false;

    if (firebaseToken) {
      // Verify the Firebase ID token and extract the phone number
      const decoded = await verifyFirebaseToken(firebaseToken);
      const fbPhone = decoded.phone_number; // e.g. +919876543210
      cleanPhone = normalizePhone(fbPhone);
      if (!cleanPhone) return res.status(400).json({ error: 'Could not extract a valid Indian phone number from Firebase verification' });
      phoneVerified = true;
    }
    // Note: phone-less signups (Google OAuth etc.) remain possible — phone is only
    // required at the frontend signup form, not enforced here so OAuth path still works.

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingEmail) return res.status(409).json({ error: 'An account with this email already exists' });

    // Check phone uniqueness only if phone provided
    if (cleanPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: cleanPhone } });
      if (existingPhone) return res.status(409).json({ error: 'This phone number is already registered' });
    }

    // Generate email verification token
    const emailVerifyToken = generateToken();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        ...(cleanPhone ? { phone: cleanPhone } : {}),
        phoneVerified,
        emailVerified: false,
        emailVerifyToken,
        emailVerifyExpiry,
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

    // Send verification email (non-blocking — don't fail registration if this fails)
    sendVerificationEmail(user.email, user.name, emailVerifyToken).catch(err =>
      console.error('[Register] Failed to send verification email:', err.message)
    );

    const token = signJWT({ userId: user.id, email: user.email });
    res.json({
      success: true,
      token,
      user: publicUserFields(user),
      emailVerificationSent: true,
    });
  } catch (err) {
    console.error('/api/auth/register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signJWT({ userId: user.id, email: user.email });
    res.json({
      success: true,
      token,
      user: publicUserFields(user),
    });
  } catch (err) {
    console.error('/api/auth/login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET /api/auth/verify-email?token=xxx ─────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token required' });

    // Find user with this token (regardless of verified status)
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link. Please request a new one.' });
    }

    // Already verified (e.g. double-click, StrictMode) — still return success
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email already verified!', alreadyVerified: true });
    }

    // Check expiry
    if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        // Keep the token so repeat clicks still resolve to this user
        // Token will be replaced on next resend anyway
        emailVerifyExpiry: null,
      },
    });

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (err) {
    console.error('/api/auth/verify-email error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── POST /api/auth/resend-verification ───────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const payload = verifyJWT(req);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email is already verified' });
    if (!user.email) return res.status(400).json({ error: 'No email address linked to this account' });

    // Rate limit: only allow resend once every 60 seconds
    if (user.emailVerifyExpiry) {
      const lastSentAt = new Date(user.emailVerifyExpiry.getTime() - 24 * 60 * 60 * 1000);
      const secondsSinceSent = Math.floor((Date.now() - lastSentAt.getTime()) / 1000);
      if (secondsSinceSent < 60) {
        return res.status(429).json({
          error: `Please wait ${60 - secondsSinceSent} seconds before requesting another email.`,
          retryAfter: 60 - secondsSinceSent,
        });
      }
    }

    const emailVerifyToken = generateToken();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry },
    });

    try {
      await sendVerificationEmail(user.email, user.name, emailVerifyToken);
    } catch (emailErr) {
      console.error('/api/auth/resend-verification email error:', emailErr.message);
      // Resend sandbox can only send to the account owner's email.
      // Surface a helpful message instead of a generic 500.
      return res.status(502).json({
        error: `Email delivery failed: ${emailErr.message}. In dev, Resend sandbox only sends to your registered Resend account email.`,
      });
    }

    res.json({ success: true, message: 'Verification email resent. Check your inbox.' });
  } catch (err) {
    console.error('/api/auth/resend-verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Always return success (don't reveal if email exists — security best practice)
    if (!user || !user.passwordHash) {
      return res.json({ success: true, message: 'If an account exists with this email, you will receive a reset link shortly.' });
    }

    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpiry: resetExpiry },
    });

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ success: true, message: 'If an account exists with this email, you will receive a reset link shortly.' });
  } catch (err) {
    console.error('/api/auth/forgot-password error:', err);
    res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and new password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (!/[0-9]/.test(password) && !/[!@#$%^&*(),.?":{}|<>_\-]/.test(password))
      return res.status(400).json({ error: 'Password must contain at least one number or special character' });

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('/api/auth/reset-password error:', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

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
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get('/google/callback', async (req, res) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId === 'your_google_client_id.apps.googleusercontent.com') {
    return res.redirect(`${FRONTEND_URL}/?error=google_not_configured`);
  }

  const { code, error: oauthError } = req.query;
  if (oauthError || !code) return res.redirect(`${FRONTEND_URL}/?error=google_auth_failed`);

  try {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token from Google');

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();
    if (!googleUser.id || !googleUser.email) throw new Error('Invalid user info from Google');

    const existingByEmail = await prisma.user.findUnique({ where: { email: googleUser.email.toLowerCase() } });
    const phonePlaceholder = `google_${googleUser.id}`;
    const existingByPhone = await prisma.user.findFirst({ where: { phone: phonePlaceholder } });
    const existing = existingByEmail || existingByPhone;

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: existing.name || googleUser.name || null,
          email: existing.email || googleUser.email?.toLowerCase() || null,
          // Google-verified emails are trusted
          emailVerified: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: googleUser.email?.toLowerCase() || null,
          phone: phonePlaceholder,
          name: googleUser.name || null,
          traderType: 'CHECKING_RATES',
          emailVerified: true, // Google already verified the email
        },
      });
    }

    const jwtToken = signJWT({ userId: user.id, phone: user.phone });
    res.redirect(`${FRONTEND_URL}/?token=${jwtToken}`);
  } catch (err) {
    console.error('[Google OAuth] Callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/?error=google_auth_failed`);
  }
});

module.exports = router;
