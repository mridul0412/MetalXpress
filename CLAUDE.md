# BhavX — Project Context & Requirements

## 🎯 Current Business Focus (Month 1 — Foundation Sprint)
> **Source of truth**: [BUSINESS_ROADMAP.md](./BUSINESS_ROADMAP.md) — full 6-month fundraise plan
> **Product roadmap**: [ROADMAP.md](./ROADMAP.md) — keep separate from business
>
> **Right now (Month 1, Weeks 1-4)** — *Get to "VC-ready" state*:
> 1. 🚀 **Production deploy** (Week 1) — Cloudinary → Railway backend → Vercel frontend → DNS to bhavx.com
> 2. 👥 **Beta cohort** (Week 2) — onboard 20 hand-picked Delhi+Mumbai traders, daily check-ins
> 3. 🤝 **Co-founder hunt** (Week 3) — start now; this is the #1 fundability blocker for solo founders
> 4. 📊 **Pitch deck v1** (Week 4) — 10 slides + demo video + LinkedIn polish
>
> **Goal by end of Month 1**: live in production, 20 onboarded users, co-founder identified or in trial, deck v1 ready.
> **6-month goal**: ₹10-25 Cr seed (realistic) / ₹50 Cr (stretch) / ₹2-5 Cr angel (floor — already achievable).
>
> **At every session**: glance at BUSINESS_ROADMAP.md for current week's checkboxes. Tick what's done. Update this block when crossing into Month 2.

---

## What This App Is
BhavX (formerly MetalXpress) is a real-time metal intelligence platform for Indian traders. It replaces WhatsApp broadcast messages with a clean, organized mobile-first web app. Features: live LME/MCX rates, local spot rates by city, verified B2B marketplace with negotiation flow, and pro analytics. Admin pastes WhatsApp messages to update local rates.

**Brand**: BhavX | **Domain**: bhavx.com + bhavx.in | **Central config**: `frontend/src/config/brand.js`

## Owner Preferences (MUST FOLLOW)
- **Accent**: Gold (`#CFB53B`) + Black (`#0D0D0D`). Blue only for secondary actions.
- **Font**: JetBrains Mono / monospace throughout.
- **Style**: Dark navy glass-panel aesthetic. Large readable rate numbers. Minimal clutter.
- **Mobile-first**: Most users are on mobile (traders on the go).
- **Technical level**: Semi-technical. Understands code concepts, can read/follow code, but doesn't write it day-to-day. Explain decisions briefly but don't over-explain basics.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (port 5173)
- **Backend**: Node/Express + Prisma + PostgreSQL (port 3001)
- **Auth**: Email+password (bcrypt), Phone OTP via **Firebase Phone Auth** (real SMS, 6-digit code), Google OAuth — JWT tokens in localStorage as `mx_token`
- **Admin auth**: Password in localStorage as `mx_admin_pass`, sent as `x-admin-password` header

## Design System (dark navy glass)
- Background: `#080E1A` with subtle gold radial gradient at top
- Surface cards: `#0D1420` with `border: 1px solid rgba(255,255,255,0.07)`
- Glass panels: `backdrop-filter: blur(20px)`, `background: rgba(8,14,26,0.9)`
- Gold accent: `#CFB53B` (primary), `#A89028` (dark), `#E8CC5A` (light)
- Up color: `#34d399` (green), Down color: `#f87171` (red)
- Font: JetBrains Mono / monospace
- **IMPORTANT**: Do NOT use `@apply bg-gold` etc. in CSS — Tailwind custom colors fail with @apply.
  Always use direct CSS values: `background-color: #CFB53B`, `color: #CFB53B`

## CSS Class Reference
```css
.glass-panel    { background: rgba(13,20,32,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.07); }
.metallic-text  { background: linear-gradient(135deg, #CFB53B, #E8CC5A, #A89028); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.text-gold      { color: #CFB53B; }
.text-up        { color: #34d399; }
.text-down      { color: #f87171; }
.btn-primary    { background-color: #CFB53B; color: #000; font-weight: 700; }
.animate-marquee { animation: marquee 28s linear infinite; display: flex; white-space: nowrap; }
```

## Current Date
2026-04-29

## Session Log
- **2026-04-29 (session 22)**: Railway backend fully live — Postgres linked, DB schema pushed, seed ran (9 cities, all metals/grades, 27 Delhi Mandoli rates, 9 listings, test users), CRON saving LME/MCX every 15 min, Cloudinary active; domain `metalxpress-production.up.railway.app`; Vercel + DNS still pending — see Session 22 details below
- **2026-04-28 (session 21)**: Logo redesigned (clean SVG iris, 8 parallelogram blades, gold gradient — Navbar/Footer/favicon); rates-accuracy FAQ restored on Contact page; production deploy STARTED — backend on Railway (project "BhavX", postinstall hook for `prisma generate`, multi-origin CORS, `prisma db push` runs on each deploy via start script, Postgres linked via `${{Postgres.DATABASE_URL}}`); Vercel + DNS pending — see Session 21 details below
- **2026-04-27 (session 20)**: Cloudinary migration (images/videos off local disk); KYC re-verification bug fix (`publicUserFields()` helper); completed deal listing state bug (sold badge, OR query, isActive on complete); Contact page real numbers + email; support@bhavx.com forwarding via ImprovMX; prod env vars generated (`backend/.env.production`) — see Session 20 details below
- **2026-04-26 (session 19)**: 3 bug fixes (Lead/Tin missing from LME after session 18 seed change, sold listings still in Browse, Submit Dispute UX); Gold + Silver added under new "Precious Metals" section (Yahoo `GC=F`/`SI=F`); strategy discussion — TAM analysis, $1B path requires embedded-financing pivot in Year 2, freight + lab-assaying ideas dropped — see Session 19 details below
- **2026-04-24 (session 18)**: ngrok setup for Firebase localhost bypass; phone login UX fixes (pre-check + clean OTP screen); seed improvements (bhavx.com emails, emailVerified, source:'seed' for LME/MCX); 6 bug fixes (images on ngrok, Lightbox flicker, dispute scroll, own listings in browse, deal badges, KYC two-button, dirty-state Save); Navbar username → gold link to profile — see Session 18 details below
- **2026-04-21 (session 17)**: Firebase Phone Auth integrated end-to-end — real SMS OTP replaces hardcoded `1234`; MSG91 endpoints parked with comments; Login.jsx + Signup.jsx updated; full Firebase explanation pending — see Session 17 details below
- **2026-03-19**: Initial UI overhaul (Replit-quality design, LME/MCX panel, hub selector, Login, Admin, Marketplace)
- **2026-03-20 (session 1)**: Fixed Navbar not rendering (missing from App.jsx), rewrote CLAUDE.md, fixed Lead symbol (PB-USD→Stooq), added Forex+Indices+Crude display, city pills selector, standalone Admin layout, Login redesign (Google OAuth stub + phone OTP + profile), PaywallModal, plug-and-play API stubs for metals-api/Google/Razorpay/MSG91
- **2026-03-20 (session 2)**: Corrected CLAUDE.md — owner is semi-technical; fixed Live Data Sources table (Lead/Tin are DB fallback, not Stooq); fixed Stooq symbol case ni.f → NI.F in docs
- **2026-03-20 (session 3)**: Major fixes and unified Admin parser — see full details below
- **2026-03-21 (session 4)**: Auth overhaul, landing page, paywall gate, footer/legal pages — see Session 4 details below
- **2026-03-21 (session 5)**: Auth integration, pro test user, alerts fix, initial marketplace filters
- **2026-03-21 (session 6)**: Complete marketplace overhaul — deal flow with 0.1% commission gate, sell-only listings, card redesign, dropdown fix, listing verification, contact reveal after payment
- **2026-03-21 (session 7)**: Negotiation-first deal flow redesign, Profile page, Admin marketplace panel — see Session 7 details below
- **2026-03-21 (session 8)**: Auth unification, dispute flow, image support, admin verification overhaul — see Session 8 details below
- **2026-03-22 (session 9)**: OTP fix, multi-select trader type, file uploads, offer UX, admin user, comprehensive roadmap — see Session 9 details below
- **2026-03-22 (session 10)**: Image/video fix, Lightbox gallery, KYC overhaul (PAN-based), T&C enforcement, deal flow fixes — see Session 10 details below
- **2026-04-11 (session 11)**: Email verification system fully working — see Session 11 details below
- **2026-04-12 (session 12)**: Bug fixes, cleanup, Analytics page, mobile responsiveness — see Session 12 details below
- **2026-04-13 (session 13)**: Analytics full redesign (ApexCharts candlestick+line, cron price feed, OHLC, chart toggle, period H/L), landing page redesign (marketing page, FAQ, conditional nav), PRO gates (Analytics+Marketplace), signup simplification (removed KYC step), rebrand scrap→metal — see Session 13 details below
- **2026-04-14 (session 14)**: Landing page copy overhaul (new headline, hero, FAQ x11, 2-tier pricing), About page rewrite, font standardization, PaywallModal simplified, "Mandoli" removed — see Session 14 details below
- **2026-04-20 (session 15)**: Full brand rename MetalXpress → BhavX, central brand config created, domains bhavx.com + bhavx.in purchased — see Session 15 details below
- **2026-04-21 (session 16)**: BhavX hexagon logo (SVG, gold gradient, Navbar+Footer+favicon), ROADMAP.md created, Resend domain verified (bhavx.com), email now sends to any inbox from noreply@bhavx.com, hero CTA button changed to outline+hover-fill so OM watermark shows through — see Session 16 details below

## Session 22 Changes (2026-04-29) — Full Detail

### Railway Backend — Fully Live ✅

**What was completed this session:**

1. **Postgres plugin added** to Railway project — auto-linked via `${{Postgres.DATABASE_URL}}` reference variable. No manual copy-paste needed.

2. **DB schema pushed automatically** — `prisma db push --skip-generate` runs in the start script on every deploy. Confirmed in Deploy Logs: "Your database is now in sync with your Prisma schema. Done in 197ms"

3. **Seed ran via temporary start script trick** — added `node src/prisma/seed.js` to start script, pushed to GitHub (Railway auto-deployed), seed completed, immediately reverted. Safe approach because Railway CLI shell not available on free plan.

4. **Seed results (production DB):**
   - 9 cities: Delhi, Mumbai, Ahmedabad, Chennai, Kolkata, Ludhiana, Jaipur, Kanpur, Hyderabad
   - All metals + grades (Copper 6, Brass 3, Aluminium 5, Lead 3, Zinc 5, + others)
   - Delhi Mandoli local rates: 27 grades
   - LME rates: 6, MCX rates: 9, Forex rates: 4
   - 7 test users (5 traders + pro tester + admin)
   - 9 sample listings with Cloudinary images
   - 3 sample deals with offer history + 6 ratings

5. **CRON running** — `[CRON] Price snapshot saved — LME: 4, MCX: 4` confirmed in logs every 15 min

6. **Cloudinary active** — `[upload] Cloudinary active (folder: bhavx-prod/listings)` confirmed

7. **Public domain:** `metalxpress-production.up.railway.app`

### Gotchas (Session 22)
- **Railway Shell not available on free plan** — "..." menu only shows Restart/Redeploy/Remove. Use the temporary start-script trick or Railway CLI (`railway run npm run seed`) for one-off commands.
- **"Deployment successful" ≠ app works** — always check Deploy Logs, not just the green badge. The badge only confirms the Node process started.
- **Seed deletes everything first** (`deleteMany` on all tables) — never leave seed in the start script. Always revert immediately after seed run.

### Pending (next session — Vercel + DNS)
- Vercel: import GitHub repo → root dir `frontend` → env vars (`VITE_API_URL=https://metalxpress-production.up.railway.app/api`, `VITE_FIREBASE_*`) → deploy
- DNS on Hostinger: `A bhavx.com → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`, `CNAME api → metalxpress-production.up.railway.app`
- Railway env update: add Vercel URL + bhavx.com to `CORS_ORIGIN`, update `FRONTEND_URL`
- Firebase Console: add `bhavx.com` + Vercel URL to Authorized Domains
- Smoke test: signup → email verify → phone OTP → marketplace browse → admin panel

### Files Modified (Session 22)
- `backend/package.json` — temporarily added seed to start script, then reverted (2 commits)
- `CLAUDE.md` — session 22 added, date bumped to 2026-04-29

---

## Session 21 Changes (2026-04-28) — Full Detail

### Logo Redesign (Clean SVG)
- Iterated 5+ times: AI-generated PNG (black bg compression artifacts couldn't be `mix-blend-mode`'d cleanly), then committed to recreating in SVG
- Final blade geometry: `M 21,7 L 43,7 L 29,22 L 26,23 Z` rotated 8× by 45° around `(32,32)` in a `0 0 64 64` viewBox
- Outer edge wider than inner (parallelogram-trapezoid hybrid) → adjacent blades touch at outer rim, dark octagonal "iris hole" visible at center
- Linear gradient `#FFE9A8 → #E8CC5A → #CFB53B → #7A5A18` with `gradientUnits="userSpaceOnUse"` → each rotated blade samples a different gradient slice → natural directional metallic shimmer without per-blade gradients
- Drop-shadow filter `0 0 6px rgba(207,181,59,0.45)` for subtle glow
- Applied to Navbar (44×44), Footer (32×32), `favicon.svg` (plain SVG, kebab-case attrs)
- Verified via `mcp__Claude_Preview__preview_screenshot` end-to-end
- Orphan AI logo JPEG (`a-world-class-logo-design-for-bhavx-feat_*.jpeg`) deleted from `frontend/public/`

### Contact Page — Rates Accuracy FAQ Restored
- Removed in session 20 (per request), now back under Contact's "Common Questions" deflect block (3 entries: local rates / LME-MCX free / accuracy)
- Same one-line treatment as the other two — kept short to match block style

### Production Deploy — Backend (Railway)
- **Project**: "BhavX" on Railway (renamed from auto-generated "heartfelt-essence")
- **Services**:
  - `MetalXpress` — Node 22 backend, root dir `backend`, branch `main`
  - `Postgres` — managed plugin, auto-linked via `${{Postgres.DATABASE_URL}}` reference variable
- **`backend/package.json` deploy hooks**:
  - `postinstall: prisma generate` — Railway runs after `npm install`, generates Prisma client
  - `start: prisma db push --skip-generate && node src/index.js` — pushes schema on every deploy (idempotent for additive changes), then starts server
  - Rationale: avoids manual `npx prisma db push` after first deploy. Destructive schema changes will fail the deploy (good — fail-loud is correct for prod data).
- **`backend/src/index.js` CORS rewrite**:
  - `CORS_ORIGIN` now comma-separated list (e.g., `https://bhavx.com,https://www.bhavx.com,https://bhavx.in`)
  - Wildcard match for `*.vercel.app` so PR preview deploys work without re-adding origins
  - Allows no-origin requests (curl, server-to-server)
- **Env vars pasted via Variables → Raw Editor**: NODE_ENV, PORT, JWT_SECRET (64-hex), ADMIN_PASSWORD (20-char), SESSION_SECRET (32-hex), DATABASE_URL (reference), CORS_ORIGIN (3 origins), APP_URL, FRONTEND_URL, RESEND_API_KEY, EMAIL_FROM, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (multi-line PEM with `\n` escapes), CLOUDINARY_URL, CLOUDINARY_FOLDER (=`bhavx-prod`), PRO_EMAILS

### Frontend Deploy Prep (Vercel)
- **`frontend/vercel.json`** created — single rewrite rule `/(.*) → /index.html` so React Router routes don't 404 on direct visit / refresh
- Vercel deploy itself NOT YET STARTED — pending Railway backend domain finalisation

### Pending (next session)
- Generate Railway backend public domain (Settings → Networking → "Generate Domain")
- Railway one-shot seed run (`npm run seed` via Railway CLI or dashboard) to populate cities/hubs/metals/grades — without this, the app loads but has no metals to display
- Vercel project import → set root dir `frontend`, env vars (`VITE_API_URL`, `VITE_FIREBASE_*`)
- DNS records on Hostinger: `bhavx.com A` → Vercel, `www.bhavx.com CNAME` → Vercel, `api.bhavx.com CNAME` → Railway
- Update Railway `CORS_ORIGIN` and `FRONTEND_URL` once Vercel URL is live
- Firebase Console: add `bhavx.com` and Vercel `*.vercel.app` to Authorized Domains
- End-to-end smoke test: signup → email verify → phone OTP → marketplace browse

### Files Modified (Session 21)
- `frontend/src/components/Navbar.jsx` — SVG iris (44×44, restored metallic-text BhavX wordmark, removed `hidden sm:block` so wordmark shows on narrow viewports)
- `frontend/src/components/Footer.jsx` — SVG iris (32×32, gradient ID `ftBlade` to avoid SVG ID collision with Navbar)
- `frontend/public/favicon.svg` — plain SVG iris with kebab-case attrs (8 explicit `<path>` elements with `transform="rotate(...)"` since plain SVG can't `.map()`)
- `frontend/index.html` — favicon link reverted to `/favicon.svg` (briefly experimented with PNG)
- `frontend/src/pages/Contact.jsx` — rates accuracy FAQ entry added back to "Common Questions" block
- `frontend/vercel.json` — NEW: SPA rewrite for client-side routing
- `frontend/public/a-world-class-logo-design-for-bhavx-feat_*.jpeg` — DELETED (orphan)
- `backend/package.json` — `postinstall` + `start` updated for Railway deploy
- `backend/src/index.js` — multi-origin CORS with vercel.app wildcard
- `CLAUDE.md` — session 21 added, current date bumped to 2026-04-28
- `MEMORY.md` (user-level) — Railway deploy entry added

### Gotchas / Lessons
- **JPEG `mix-blend-mode: screen` doesn't fully clear "black" backgrounds** because JPEG compression introduces near-black pixels (not pure 0,0,0). For logos on dark backgrounds, always use SVG.
- **Railway "Deployment successful" ≠ app actually works** — Railway only checks the process is alive. Backend will start without env vars but crash on first DB query. Always validate with a real API call after deploy.
- **Railway auto-detects from repo root** — fails with "Error creating build plan with Railpack" if backend is in a subdirectory. Fix: Settings → Source → Root Directory → `backend`.
- **Railway's `${{ServiceName.VAR}}` reference variables** auto-link service vars (no manual copy-paste). `DATABASE_URL=${{Postgres.DATABASE_URL}}` is the canonical pattern.
- **Worktree branches accumulate over months** — repo had `claude/great-goldwasser`, `claude/metalxpress-platform-CzcmZ`, etc. Railway connecting to wrong (old) branch is a common foot-gun. Always verify branch in Settings before first deploy.

---

## Session 20 Changes (2026-04-27) — Full Detail

### Cloudinary Image/Video Migration

**Why**: Railway (production hosting) uses ephemeral containers — local `backend/uploads/` is wiped on every redeploy. Files must live on a CDN.

**Implementation**:

1. **`backend/src/services/cloudinary.js`** (NEW):
   - Central Cloudinary config using `CLOUDINARY_URL` env var (single var, no separate key/secret needed)
   - `makeStorage()` — returns `CloudinaryStorage` adapter for multer when `CLOUDINARY_URL` is set, `null` for disk fallback in local dev
   - `uploadFile(localPath, folder)` — manual upload helper for migration script
   - `deleteByUrl(url)` — deletes by Cloudinary URL (parses public_id)
   - `ping()` — health check, logs Cloudinary connection status on backend startup
   - Folder strategy: `bhavx-dev/listings/*` (user uploads) and `bhavx-dev/seed/*` (seed images)

2. **`backend/src/routes/marketplace.js`** — upload route uses `makeStorage()` with disk fallback; returns `f.path` (full Cloudinary HTTPS URL) when enabled vs `/uploads/${f.filename}` for disk

3. **`backend/src/scripts/migrate-uploads-to-cloudinary.js`** (NEW) — one-time migration script:
   - Walks `backend/uploads/`, uploads each file with stable `public_id` (idempotent — `overwrite: false`)
   - Patches `Listing.images` JSON in DB to replace local paths with Cloudinary URLs
   - Result: 13 files uploaded, 9 listings patched

4. **`backend/src/prisma/seed.js`** — `IMG` and `VID` maps updated to Cloudinary URLs (`res.cloudinary.com/dbaumhjh7/...`)

5. **`backend/.env`** — `CLOUDINARY_URL` and `CLOUDINARY_FOLDER=bhavx-dev` added

**Dev/prod parity**: `CLOUDINARY_URL` set in dev `.env` → uses Cloudinary everywhere. Remove it → falls back to local disk. No code changes needed.

### KYC Re-Verification Bug Fix

**Root cause**: Login endpoint (`/api/auth/login`, `/verify-firebase-otp`) returned a partial user object missing `kycVerified`, `panNumber`, `tradeCategory` and other KYC fields. `AuthContext.login()` stored this partial object → marketplace KYC gate saw `kycVerified: undefined` (falsy) → showed KYC form every login even for verified users.

**Fix 1 — Backend** (`backend/src/routes/auth.js`):
- New `publicUserFields(u)` helper — returns a consistent 22-field safe user shape from any Prisma user object. Fields: `id, email, name, phone, city, traderType, emailVerified, phoneVerified, kycVerified, panNumber, tradeCategory, businessName, legalName, gstNumber, isBanned, banReason, cooldownUntil, avgRating, completedDeals, disputeCount, termsAcceptedAt, createdAt`. Never includes `passwordHash`.
- Applied to `/login`, `/register`, `/verify-firebase-otp` response shapes. `kycVerified` always present.

**Fix 2 — Frontend** (`frontend/src/context/AuthContext.jsx`):
- `login()` now immediately calls `refreshUser()` + `refreshSubscription()` after `setUser(userData)`. Defense-in-depth: even if login response is incomplete, `/me` re-fetch fills in all fields within milliseconds.

### Completed Deal Listing State Bug

**Root cause**: Multiple compounding issues:
1. `/deals/:id/complete` didn't set `listing.isActive = false` — listing stayed "Verified & Live" after deal completed
2. `GET /my-listings` filtered `isActive: true` only — sold/completed listings disappeared from seller's own tab
3. `listingDealMap` in `MyListingsTab` had no priority system — lower-status deals (negotiating) could overwrite higher-status ones (completed)
4. 2 existing DB listings had stale `isActive: true` with completed deals (from before session 19's `/pay` fix)

**Fixes**:
- `/deals/:id/complete` now also sets `listing.isActive = false` (idempotent, defense-in-depth)
- `/my-listings` uses OR query: `{ OR: [{ isActive: true }, { isActive: false, deals: { some: { status: { in: ['connected','completed','paid'] } } } }] }` — keeps sold listings visible to seller
- Priority map: `{ completed: 5, connected: 4, paid: 4, agreed: 3, negotiating: 2 }` — highest status wins
- "Verified & Live" badge suppressed when listing has completed/connected/paid deal
- "Sold" gray badge added for completed/connected/paid status
- "Deal Completed" gray pill added in deal status display
- One-time DB cleanup: `updateMany` set `isActive: false` for 2 stale listings

### Contact Page Real Numbers
- Removed placeholder `XXXXX XXXXX` numbers
- WhatsApp: `+91 94736 36333` → `https://wa.me/919473636333`
- Phone: `+91 87077 18146` → `tel:+918707718146`
- Added `Mail` import + email card: `support@bhavx.com` → `mailto:support@bhavx.com`, "We reply within 24 hours"
- Removed "How accurate are the rates?" FAQ entry (user request)
- Removed stale `Mail` icon that was left after removing old email card in session 18

### Email Forwarding — support@bhavx.com (ImprovMX)

**Setup**: Since bhavx.com is domain-only on Hostinger (no hosting plan), Hostinger's free email forwarding isn't available. Used ImprovMX instead.

**What was configured**:
- `support@bhavx.com` → `mridul041298@gmail.com`
- `*@bhavx.com` (catch-all) → `mridul041298@gmail.com`
- MX records added to Hostinger DNS: `mx1.improvmx.com` (priority 10), `mx2.improvmx.com` (priority 20)
- SPF TXT record: `v=spf1 include:spf.improvmx.com ~all`
- ImprovMX shows "Email forwarding active" ✅
- DNS propagated globally (verified via dnschecker.org) ✅
- First emails delivered within ~10 min; landed in Gmail Promotions initially (normal for new domain — improves with volume)

**Limitation**: Free ImprovMX plan = receive only. To reply *as* `support@bhavx.com`, needs ImprovMX Premium ($9/mo) or Hostinger mailbox + Gmail SMTP. Not needed at MVP stage.

**Note**: Also reminded user to enable auto-renewal on bhavx.com in Hostinger (currently off, expires 2027-04-20).

### Production Env Vars — `backend/.env.production`

**Generated fresh secrets** (dev values `metalxpress-dev-secret-key-2024` / `admin123` are insecure):
- `JWT_SECRET` — 64 random hex chars
- `ADMIN_PASSWORD` — 20 chars with symbols
- `SESSION_SECRET` — 32 random hex chars

**`backend/.env.production`** (NEW, gitignored):
- Ready-to-paste template for Railway dashboard
- Pre-filled: JWT_SECRET, ADMIN_PASSWORD, SESSION_SECRET, CLOUDINARY_URL, EMAIL_FROM, CLOUDINARY_FOLDER=`bhavx-prod`
- Placeholders for: DATABASE_URL (Railway supplies), RESEND_API_KEY, Firebase keys, CORS_ORIGIN
- Comments explain which vars to copy from dev `.env` vs which Railway supplies automatically

**Note**: `CLOUDINARY_FOLDER` changes from `bhavx-dev` → `bhavx-prod` in production so dev/prod uploads don't mix.

### Files Modified (Session 20)
- `backend/src/services/cloudinary.js` — NEW: Cloudinary config + multer storage + upload/delete helpers
- `backend/src/scripts/migrate-uploads-to-cloudinary.js` — NEW: one-time migration script
- `backend/src/routes/marketplace.js` — Cloudinary upload adapter; `/complete` sets `isActive: false`; `/my-listings` OR query
- `backend/src/prisma/seed.js` — IMG/VID maps updated to Cloudinary URLs
- `backend/src/routes/auth.js` — `publicUserFields()` helper, applied to login/register/verify-firebase-otp responses
- `backend/.env` — CLOUDINARY_URL + CLOUDINARY_FOLDER added
- `backend/.env.production` — NEW: prod env template (gitignored)
- `frontend/src/context/AuthContext.jsx` — `login()` calls refreshUser() + refreshSubscription() immediately
- `frontend/src/pages/Marketplace.jsx` — priority-based listingDealMap, "Sold" badge, "Verified & Live" suppression
- `frontend/src/pages/Contact.jsx` — real phone numbers, support@bhavx.com email card, removed inaccurate FAQ entry
- `CLAUDE.md` — session 20 added, current date bumped to 2026-04-27
- `ROADMAP.md` — session 20 logged, completed items marked, deploy tasks reorganised
- `MEMORY.md` — session 20 events added

## Session 19 Changes (2026-04-26) — Full Detail

### Bug Fixes (3)

**1. Lead/Tin missing from LME rates** ([backend/src/routes/rates.js:272](backend/src/routes/rates.js))
- **Root cause**: Session 18 changed seeded LME/MCX rates to `source: 'seed'` (to avoid blocking the 15-minute admin-override window). The Lead/Tin DB-fallback query in `/api/rates/live` was filtering `source: 'admin'`, so it never matched the seeded rows.
- **Fix**: Removed the `source` filter from the Lead/Tin fallback `findFirst` — only the 7-day window remains.
- **Verified**: `/api/rates/live` now returns all 6 metals; Lead $1937.50, Tin $50205, source `admin-update`.

**2. Connected/sold listings still appearing in Browse** ([backend/src/routes/marketplace.js:94](backend/src/routes/marketplace.js))
- **Root cause 1**: `POST /deals/:id/pay` set deal status to `connected` but never touched the listing — `isActive` stayed true.
- **Root cause 2**: GET `/listings` only filtered `isActive: true` + `status: 'verified'` — no check for sold deals.
- **Fix 1 (forward-looking)**: Mark listing `isActive: false` in pay endpoint after deal becomes connected.
- **Fix 2 (cleans up existing bad data)**: Added Prisma relational filter to listings query: `deals: { none: { status: { in: ['connected', 'completed', 'paid'] } } }`. Idempotent — listings already with bad data automatically disappear.
- **Verified**: Purja listing (which the user had connected on but was still showing) now gone from Browse.

**3. Submit Dispute button "not working"** ([frontend/src/pages/Marketplace.jsx:1061](frontend/src/pages/Marketplace.jsx))
- **Root cause**: Session 18 added `overflowY: 'auto'` + `maxHeight: 55vh` to the action bar (to fix dispute-modal scroll). Result: when dispute form was open, error messages rendered at the **top** of the scroll area while the submit button was at the **bottom** — user clicked submit, validation failed, but the error was scrolled off-screen → looked like the button did nothing.
- **Fix**:
  - Moved error message + validation hint **inline above the submit button**.
  - Added derived `canSubmit` flag — disables button until category picked AND reason ≥10 chars.
  - Visual disabled state (red translucent bg, "not-allowed" cursor) so user sees why it's blocked.
  - Hint text shows characters needed: "Describe the issue — N more characters".
  - Cancel button now also clears `error` state alongside other fields.
- Also gave the dispute-category dropdown the shared `selectStyle` (with chevron) for consistency with the rest of the app.

### New Feature: Precious Metals Section (Gold + Silver)

**Why**: User asked for more LME/MCX metals. Investigated Yahoo Finance availability:
- `TIO=F` Iron Ore — **delisted on Yahoo, last update Aug 2021** (stale, unusable)
- `HRC=F` Steel HRC — works, but it's COMEX (US futures) not LME/MCX. Mislabeling risk.
- `GC=F` Gold — works, $4740/oz live
- `SI=F` Silver — works, $76/oz live
- **Decision**: Add Gold + Silver only. Steel HRC and Iron Ore parked for paid-API revisit at scale.

**Implementation**:

1. **`backend/src/services/livePriceFetcher.js`**:
   - New `PRECIOUS_METALS` array with `{ metal, symbol, mcxUnit, mcxFactor }`.
   - Gold: `mcxUnit: '₹/10g'`, `mcxFactor: 10 / 31.1035` (USD/oz → ₹/10g).
   - Silver: `mcxUnit: '₹/kg'`, `mcxFactor: 1000 / 31.1035` (USD/oz → ₹/kg).
   - Conversion formula: `priceMcx = priceUsd × usdInr × mcxFactor`.
   - Fetched in parallel after metals; appended to response as new `precious` array.
   - Return shape extended: `{ metals, precious, forex, indices, crude, usdInr, ... }`.

2. **`backend/src/routes/rates.js`** (line 312):
   - Pass-through: `precious: yahooData.precious ?? []` added to `/api/rates/live` JSON response.
   - No precedence rules (no admin override, no DB fallback) — just live Yahoo. Can extend later if needed.

3. **`frontend/src/pages/Home.jsx`**:
   - Added `Sparkles` icon import from lucide-react.
   - Added `Gold` and `Silver` entries to `METAL_META` constant (Gold gradient `#FFD700`, Silver `#C0C0C0`).
   - New **Precious Metals** section between LME/MCX panel and Forex panel.
   - Same glass-card grid layout as LME panel: `Metal | Intl ($/oz) | MCX (₹) | Chg%`.
   - Renders `precious[]` array from `liveData`. Each row shows:
     - Metal name with colored dot
     - USD/oz price
     - MCX price + small unit suffix (`₹/10g` for Gold, `₹/kg` for Silver)
     - Change% with up/down arrow
   - Section auto-hides if `precious.length === 0` (graceful Yahoo failure handling).

**Live verification (rendered values)**:
- Gold: $4,740.90 → ₹1,43,613.29/10g → -1.37%
- Silver: $76.41 → ₹2,31,464.31/kg → -4.43%

### Strategy Session (no code, but recorded for future reference)

**TAM analysis**:
- TAM (Indian metal trade): ~₹12-15 lakh crore (~$150-180B/yr)
- SAM (non-ferrous + scrap): ~₹3-4 lakh crore (~$40-50B)
- SOM (5-yr realistic): ~₹5,000-15,000 Cr GMV through platform
- Active metal traders in India: ~80K-1.5L
- Realistic paying-user TAM: 10-25K

**Honest assessment of current model ceiling**:
- Pure ₹299 Pro subscription + 0.1% commission caps at **₹50-200 Cr revenue (~$6-25M)** → **$60-250M valuation**.
- Not a $1B business as currently defined.
- Reason: ₹299/mo ARPU too low (Bloomberg = $2K/mo); 0.1% commission too thin (industry brokers take 1-3%); 60-80% of repeat deals leak offline once contacts exchanged.

**Path to $1B (only if these layers added)**:
1. **Embedded trade financing** (Year 2 priority) — partner with NBFC; bridge buyer credit (30-60-90 days) ↔ seller cash needs. Take 1.5-3% per deal vs 0.1%. **15x revenue multiplier per deal**. Requires 1-2 yrs of platform deal data for underwriting. This is what made OfBusiness a unicorn.
2. **Higher ARPU tier ("BhavX Terminal" ₹5,000/mo)** — for serious traders: API access, advanced charts, deal analytics, alerts. Mimic Bloomberg's playbook in miniature.
3. **Data licensing** — sell historical price + deal-flow data to banks/MNCs (₹50L-5Cr enterprise contracts).
4. **Geographic expansion** — Bangladesh, UAE, SEA.
5. **Cross-commodity** — agri, polymers, chemicals.

**Ideas explicitly dropped (don't pursue)**:
- ❌ Freight booking — saturated lane (BlackBuck, Vahak own it), doesn't fit data moat.
- ❌ Lab assaying / metal certification — doesn't match how scrap traders assess (sight + experience, not chemistry).

**Competitive positioning vs IndiaMART**:
- IndiaMART = horizontal phone-book (catalog play). FY24 revenue ~₹1,200 Cr, 11% paid conversion of 200M traffic.
- BhavX = vertical workflow (live rates + verified KYC + in-app negotiation). Different jobs-to-be-done.
- Risk: One-off bulk-purchase buyers default to IndiaMART. Stay focused on regular high-frequency traders.

**Corporate structure decision (parked)**:
- Indian Pvt Ltd now → Razorpay → revenue → CA consultation at PMF for GIFT City IFSC or Singapore HoldCo flip.
- Razorpay KYC does NOT lock you into Indian-only structure (Razorpay itself flipped to Delaware in 2015).
- Founder personal residency (UAE/Dubai for 0% personal tax on dividends) is independent of company structure.
- ⚠️ Get a startup-CA consult (₹15-30K) before incorporating.

### Next Roadmap Step (per ROADMAP.md)
**Cloudinary image storage migration** is the next critical blocker — Railway redeploy wipes local `backend/uploads/` so this MUST happen before deploy.

### Files Modified (Session 19)
- `backend/src/services/livePriceFetcher.js` — added `PRECIOUS_METALS` array + parallel fetch + return `precious` in response
- `backend/src/routes/rates.js` — Lead/Tin DB fallback fix (removed `source` filter); plumbed `precious` through `/api/rates/live` response
- `backend/src/routes/marketplace.js` — sold-listing filter on GET `/listings`; mark listing `isActive: false` on `/deals/:id/pay`
- `frontend/src/pages/Marketplace.jsx` — Submit Dispute UX fix (inline error/hint, `canSubmit` derived state, dispute dropdown selectStyle)
- `frontend/src/pages/Home.jsx` — Sparkles import, Gold/Silver in `METAL_META`, new Precious Metals section
- `CLAUDE.md` — session 19 added, current date bumped to 2026-04-26, **`## 🎯 Current Business Focus` block added at top** (auto-loads each session)
- `ROADMAP.md` — session 19 logged, Gold/Silver added to Completed
- **`BUSINESS_ROADMAP.md` (NEW)** — 6-month fundraise plan, Month-by-Month with weekly granularity. Floor ₹2-5 Cr angel / Realistic ₹10-25 Cr seed / Stretch ₹50 Cr Pre-Series A. Target VC list, advisor strategy, term-sheet pitfalls, use-of-funds, investor pitch script.
- **`.claude/settings.json` (NEW)** — SessionStart hook (matcher: `startup|resume|clear`) registered for `node .claude/scripts/session-brief.js`.
- **`.claude/scripts/session-brief.js` (NEW)** — generates briefing from BUSINESS_ROADMAP.md (current month/week open items) + ROADMAP.md (critical-path blockers). Silent before 2026-05-01 (tech sprint mode). Activates automatically May 1. Skips `[x]` items so cutover-to-done doesn't clutter briefings.
- **`.gitignore`** — flipped from "ignore `.claude/` wholesale" to "ignore specific personal files only" (`settings.local.json`, `launch.json`, `worktrees/`, `agents/`, `skills/`, `plans/`) so the shared SessionStart hook setup ships with the repo.

### Cutover Workflow (going forward)
- When you complete a roadmap item, edit `- [ ] item` → `- [x] item (done YYYY-MM-DD)`.
- Lines stay in the file forever as history. Briefing script ignores `[x]` items.
- Don't delete completed lines — that destroys progress history.

### Activation timeline
- **Apr 27-30 (tech sprint)**: SessionStart hook is silent. Focus on production deploy, Cloudinary, Razorpay prep. Nothing surfaces in Claude sessions.
- **May 1 onwards**: Hook activates automatically. Every new Claude session starts with a Month/Week briefing block injected as `additionalContext`. Edit `ACTIVATION_DATE` / `START_DATE` in `.claude/scripts/session-brief.js` to shift.

---

## Session 18 Changes (2026-04-24) — Full Detail

### ngrok Setup — Firebase Phone Auth on Localhost

**Problem**: Firebase Phone Auth refuses `localhost` as an authorized domain — can't send real SMS during local dev.
**Solution**: ngrok tunnel forwards `https://dandy-headrest-depravity.ngrok-free.dev` → `localhost:5173`. Firebase sees a real HTTPS domain; dev works end-to-end with real SMS.

**Setup steps (permanent)**:
1. `ngrok config add-authtoken 3Clm0TfbTT7FaUMdrC9WPcoewMG_22t34XofTkyWsBQ2Jtnmg`
2. `ngrok http 5173` → use the `https://dandy-headrest-depravity.ngrok-free.dev` URL
3. Firebase Console → Authentication → Settings → Authorized Domains → `dandy-headrest-depravity.ngrok-free.app` already added ✅
4. Vite config updated with `allowedHosts` + `/uploads` proxy (see below)

**`frontend/vite.config.js` changes**:
- `allowedHosts: ['dandy-headrest-depravity.ngrok-free.dev']` — lets ngrok browser context reach Vite dev server
- `/uploads` proxy added: `{ target: 'http://localhost:3001', changeOrigin: true }` — images/videos load correctly on ngrok

**CRITICAL — BACKEND_URL fallback**: In `Marketplace.jsx`, the backend URL used to build image `src` must fall back to `''` (empty string), NOT `'http://localhost:3001'`. This makes `/uploads/...` paths go through the Vite proxy and work on ngrok. Four occurrences changed.

### Phone Login UX Fixes

**1. Pre-check before OTP send** — prevents wasting Firebase SMS quota on unregistered numbers:
- Added `POST /api/auth/check-phone` backend endpoint — looks up normalized phone, returns `{ exists: bool }`
- Added `checkPhone` export to `frontend/src/utils/api.js`
- `Login.jsx` calls `checkPhone` *before* `signInWithPhoneNumber`; if `!exists` → shows "No account found with this number. Please sign up first." without spending an OTP

**2. Cleaned OTP screen for login** — removed name, trader type, and "Optional Profile" section from login phone flow. Login is login — not signup. Fields were confusing for returning users.
- Removed: `User` import, `name` state, `traderTypes` state, `TRADER_TYPES` constant, entire "Optional Profile" JSX block
- Login OTP screen now shows only: phone input with +91 badge → OTP input → submit

**3. `loginOnly: true` flag** — `verify-firebase-otp` backend now accepts `loginOnly` in request body. When `loginOnly: true` and no account exists for the phone, returns 404 instead of silently creating a new account. This prevents account creation from the login page.

### Seed Data Improvements

- All test user emails updated to `@bhavx.com` pattern: `admin@bhavx.com`, `test@bhavx.com`
- All test users now have `emailVerified: true` — no friction during dev testing
- `rajesh@test.com` and `amit@test.com` have `kycVerified: true` — ready for marketplace testing
- **LME/MCX rates seeded with `source: 'seed'`** — critical fix. Default was `source: 'admin'` which triggered the 15-minute admin-override window, blocking Yahoo Finance live fetch. Now live rates load immediately without needing an admin paste.
- `PRO_EMAILS` in `backend/.env` updated to include test traders: `test@bhavx.com,admin@bhavx.com,amit@test.com,rajesh@test.com,suresh@test.com,vikram@test.com`
- Two verified test journeys ready: seller `rajesh@test.com` (copper listings) and buyer `amit@test.com`

### Bug Fixes (Session 18)

**1. Images not loading on ngrok** — See BACKEND_URL fix above (`''` fallback + `/uploads` proxy)

**2. Lightbox flicker / auto-navigation** — Lightbox was rendered inside the `ListingCard`'s `onMouseEnter/Leave` div. Mouse events on the Lightbox overlay re-triggered card hover → re-renders → arrow keys jumped to different listing. **Fix**: `ListingCard` now returns `<>card div + lightbox</>` — Lightbox is outside the hover div in a React fragment.

**3. Dispute modal not scrollable** — Long dispute reason + action buttons overflowed the panel with no scroll. **Fix**: Action bar div gets `overflowY: 'auto'` + `maxHeight: '55vh'`.

**4. Own listings showing in Browse tab** — Seller saw their own listings in Browse, could accidentally "make offer" to themselves. **Fix**: `BrowseTab` filters `listings.filter(l => !user || l.userId !== user.id)`.

**5. Deal status badges on My Listings** — Users had no idea if their listed items had active negotiations. **Fix**: `MyListingsTab` now receives `deals` prop; builds `listingDealMap` (maps `listingId → status`); renders amber/green/blue status pill under each listing ("Negotiating" / "Agreed" / "Connected"). `loadDeals()` also called when switching to the `my-listings` tab.

**6. Profile KYC two-button mess** — There was a "Verify" button on the KYC status banner that toggled `showKyc` visibility, plus a separate Save button — confusing. **Fix**: Removed `showKyc` toggle state entirely. KYC form is always visible when `needsKyc && !isKycDone`. Added dedicated `handleVerify` with its own `verifying` + `kycMessage` states inside the KYC section. `handleSave` no longer touches KYC fields.

**7. Save Changes dirty state** — Save Changes was always enabled even with no changes, making it easy to accidentally save a blank form. **Fix**: Added `origValues` state capturing initial form values on load. `isDirty = (name !== origValues.name || email !== origValues.email || ...)`. Save button is `disabled={!isDirty || saving}` with `opacity: 0.4` when clean.

### Navbar Username — Gold Profile Link
- Username display in Navbar wrapped in `<Link to="/profile">` styled gold (`color: #CFB53B`) with underline on hover
- Clicking your name from anywhere navigates directly to profile page

### Test Accounts (updated session 18)
| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `admin@bhavx.com` | `admin1234` | Admin + Pro | emailVerified + kycVerified |
| `test@bhavx.com` | `test1234` | Pro tester | emailVerified + kycVerified |
| `rajesh@test.com` | `test1234` | Seller (Delhi) | emailVerified + kycVerified, copper listings |
| `amit@test.com` | `test1234` | Buyer (Mumbai) | emailVerified + kycVerified, Pro |
| `suresh@test.com` | `test1234` | Seller (Ahmedabad) | emailVerified + kycVerified |
| `vikram@test.com` | `test1234` | Seller (Ludhiana) | emailVerified + kycVerified |

### Files Modified (Session 18)
- `frontend/vite.config.js` — `allowedHosts` for ngrok, `/uploads` proxy
- `frontend/src/utils/api.js` — `checkPhone` export added
- `frontend/src/pages/Login.jsx` — removed name/traderTypes from OTP screen, `check-phone` pre-check, `loginOnly: true` flag
- `frontend/src/pages/Marketplace.jsx` — BACKEND_URL `''` fallback (×4), Lightbox outside hover div, dispute scroll fix, own-listing filter, deal badges in MyListingsTab, `loadDeals()` on tab switch
- `frontend/src/pages/Profile.jsx` — removed `showKyc` toggle, dedicated `handleVerify`, `origValues` dirty state, disabled Save when clean
- `frontend/src/components/Navbar.jsx` — username → gold Link to /profile
- `backend/src/routes/auth.js` — `POST /check-phone` endpoint, `loginOnly` flag in `verify-firebase-otp`
- `backend/src/prisma/seed.js` — `emailVerified: true` for all users, `@bhavx.com` admin emails, `source: 'seed'` on LME/MCX rates
- `backend/.env` — PRO_EMAILS updated with all test traders
- `ROADMAP.md` — session 18 logged, completed items marked

---

## Session 17 Changes (2026-04-21) — Full Detail

### Firebase Phone Auth — End-to-End Integration (replaces hardcoded OTP 1234)

**Why Firebase**: All Indian SMS providers (MSG91, Twilio, Fast2SMS) require TRAI DLT registration (3–7 day approval process, fees). Firebase Phone Auth bypasses DLT entirely — Google handles the SMS delivery, so no Indian operator registration is needed. Free up to 10,000 OTPs/month.

**How it works (full flow)**:
1. User enters phone → Login.jsx creates `RecaptchaVerifier` (invisible, no UI widget) + calls Firebase `signInWithPhoneNumber`
2. Firebase sends a real 6-digit SMS to the phone
3. User enters 6-digit code → `confirmationResult.confirm(otp)` verifies with Firebase
4. Frontend gets a **Firebase ID token** (a JWT signed by Google, valid 1 hour)
5. Frontend POSTs `firebaseToken` to `/api/auth/verify-firebase-otp`
6. Backend verifies token with Firebase Admin SDK → extracts phone number → finds-or-creates user → issues **our own app JWT**
7. App JWT stored in `localStorage` as `mx_token` — all subsequent API calls use this

**What each config value means**:
- `VITE_FIREBASE_API_KEY` — identifies the Firebase project to the web client (not secret, safe in browser)
- `VITE_FIREBASE_AUTH_DOMAIN` — the domain Firebase uses for auth flows (bhavx-ff380.firebaseapp.com)
- `VITE_FIREBASE_PROJECT_ID` — project ID: `bhavx-ff380`
- `VITE_FIREBASE_APP_ID` — identifies the specific web app within the project
- `FIREBASE_PROJECT_ID` — same project, but for backend (Admin SDK)
- `FIREBASE_CLIENT_EMAIL` — the service account email (has permission to verify tokens)
- `FIREBASE_PRIVATE_KEY` — the service account's private key (NEVER share — backend only)

**Backend files**:
- `backend/src/services/firebaseAdmin.js` (NEW) — initializes Admin SDK (lazy singleton), exports `verifyFirebaseToken(idToken)`
- `backend/src/routes/auth.js` — added `POST /api/auth/verify-firebase-otp` endpoint; MSG91 endpoints **commented out** (not deleted) with `PARKED` banner for easy switch-back

**Frontend files**:
- `frontend/src/config/firebase.js` (NEW) — initializes Firebase client SDK from `VITE_` env vars, exports `auth` and `isConfigured`
- `frontend/.env.local` (NEW) — `VITE_FIREBASE_*` values filled in
- `frontend/src/pages/Login.jsx` — full rewrite of phone OTP flow: `RecaptchaVerifier` + `signInWithPhoneNumber` + `confirmationResult.confirm` → `getIdToken` → POST to backend
- `frontend/src/pages/Signup.jsx` — cleaned up old `// No OTP — phone bypassed until DLT` comment
- `frontend/src/utils/api.js` — added `verifyFirebaseOTP` export

**Login.jsx OTP UX changes**:
- Phone input now shows `+91` prefix badge (India-first UX)
- OTP input accepts 6 digits (was 4 — Firebase OTPs are always 6-digit)
- "Dev mode: use 1234" hint replaced with "A 6-digit code will be sent via SMS"
- "Resend OTP" button goes back to phone screen (re-triggers Firebase flow)
- Error handling: `auth/invalid-phone-number`, `auth/too-many-requests`, `auth/invalid-verification-code`, `auth/code-expired` — each has specific user-friendly message

**Important production note**: 
- Firebase Console → Authentication → Settings → **Authorized Domains** — must add `bhavx.com` before going live (localhost already whitelisted by default)

**MSG91 parked (not deleted)**:
- Both `request-otp` and `verify-otp` endpoints commented out in `auth.js` with clear banner
- Can switch back in under 5 minutes: uncomment MSG91 endpoints, re-import `sendOTP`, remove Firebase import

### Files Modified (Session 17)
- `backend/src/services/firebaseAdmin.js` — NEW: Firebase Admin SDK wrapper
- `backend/src/routes/auth.js` — `/verify-firebase-otp` endpoint added; MSG91 endpoints parked
- `backend/.env` — FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY added
- `frontend/src/config/firebase.js` — NEW: Firebase client SDK init
- `frontend/.env.local` — NEW: VITE_FIREBASE_* values filled
- `frontend/src/pages/Login.jsx` — Full phone OTP flow rewritten for Firebase (6-digit OTP, RecaptchaVerifier, confirmationResult, error handling)
- `frontend/src/pages/Signup.jsx` — Cleaned up old DLT bypass comment; phone placeholder updated
- `frontend/src/utils/api.js` — `verifyFirebaseOTP` function added
- `CLAUDE.md` — session 17 added, architecture section updated

---

## Session 16 Changes (2026-04-21) — Full Detail

### BhavX Hexagon Logo (NEW)
- **File**: `frontend/public/favicon.svg` — new SVG hexagon mark (gold gradient outer ring, dark inner, Bx letterform inside)
- **Navbar**: Replaced OM symbol box with inline SVG logo mark + "BhavX" in InitCaps (gold drop-shadow glow)
- **Footer**: Replaced OM symbol box with matching smaller SVG logo mark + "BhavX"
- **Mobile**: No separate abbreviation needed — SVG scales cleanly at all sizes

### Resend Domain Verification (DONE ✅)
- **DNS records added** to bhavx.com on Hostinger: DKIM (TXT), SPF MX, SPF TXT, DMARC (TXT)
- **Domain verified** — Resend shows green on bhavx.com
- **`backend/.env` updated**: `EMAIL_FROM="BhavX <noreply@bhavx.com>"`
- **Tested**: Emails confirmed delivering to external inboxes (not just owner's email)
- **Spam note**: One test email went to spam — expected for new domain, improves naturally with volume. User should click "Not spam" on any that land there.
- **Resend cost**: Free tier = 3,000 emails/month, 100/day — sufficient until significant user base

### User DB Reset (for testing)
- All existing test users deleted via Prisma
- Admin account re-created: `admin@bhavx.com` / `admin1234` (emailVerified + kycVerified = true)
- Backend restarted to pick up new EMAIL_FROM env var

### Hero CTA Button — Outline Style
- **Problem**: Solid gold "Join BhavX Free" button covered the OM watermark in the hero
- **Fix**: Button is now transparent with gold border by default; fills gold on hover
- `onMouseEnter/Leave` handlers swap `background` and `color` inline
- Bottom-of-page CTA remains solid gold (no OM behind it)

### ROADMAP.md Created
- **File**: `ROADMAP.md` in repo root — master checklist with phases, daily progress tracking, session log
- Covers: Critical (go-live blockers), Revenue (paying users), Growth (post-launch), Capital & Scale, Completed items, Session log table

### Files Modified (Session 16)
- `frontend/public/favicon.svg` — NEW: BhavX hexagon SVG logo
- `frontend/src/components/Navbar.jsx` — SVG logo mark, "BhavX" InitCaps
- `frontend/src/components/Footer.jsx` — SVG logo mark, "BhavX" InitCaps
- `frontend/src/pages/Landing.jsx` — hero CTA button outline+hover style
- `backend/.env` — `EMAIL_FROM` updated to `noreply@bhavx.com`
- `ROADMAP.md` — NEW: master roadmap and progress tracker
- `CLAUDE.md` — session 16 added, date updated

## Session 15 Changes (2026-04-20) — Full Detail

### Brand Rename: MetalXpress → BhavX
- **Rationale**: Owner bought bhavx.com + bhavx.in. "Bhav" (भाव) = "price/rate" in Hindi trading vernacular ("aaj ka bhav kya hai?") — exact word traders use daily. Numerology: BhavX = Sun (1), same as Google/Tata/Disney. MetalXpress = Ketu (7), weakest for commerce.
- **Domain**: bhavx.com (primary), bhavx.in (India). Registered on GoDaddy; transfer to Cloudflare recommended before April 2027 renewal.
- **Scope**: All 33 files updated — `MetalXpress` → `BhavX`, `METALXPRESS` → `BHAVX` everywhere in source code

### Central Brand Config (NEW)
- **File**: `frontend/src/config/brand.js`
- **Purpose**: Single source of truth for brand name — future rebrand = edit one file
- **Contents**: `name`, `symbol` (⚡), `domain`, `email`, `tagline`, `description`, `fullTitle`, `metaDescription`
- **Imported by**: `Navbar.jsx` and `Footer.jsx` use `BRAND.name.toUpperCase()` dynamically; `Landing.jsx` imports for future use

### Navbar Update
- Desktop: `METALXPRESS` → `{BRAND.name.toUpperCase()}` (dynamic from config)
- Mobile abbreviation: `MX⚡` → `BX⚡`

### Footer Update
- Brand display: `METALXPRESS` → `{BRAND.name.toUpperCase()}` (dynamic from config)
- Copyright line: "BhavX. All rights reserved."

### Email Templates Update (emailService.js)
- Email header: `⚙ METALXPRESS` → `⚡ BHAVX`
- Email subtitle: "INDIA'S SCRAP METAL RATE PLATFORM" → "INDIA'S REAL-TIME METAL RATE PLATFORM"
- Email footer: "BhavX · India's Real-Time Metal Rate Platform"
- Subject lines, body text, welcome message all updated to BhavX

### index.html Update
- Title: "MetalXpress ⚡ Real-Time Metal Intelligence for India" → "BhavX ⚡ Real-Time Metal Intelligence for India"
- Meta description updated to BhavX

### Files Modified (Session 15)
- `frontend/src/config/brand.js` — NEW: central brand config
- `frontend/src/components/Navbar.jsx` — BRAND import, dynamic name, mobile abbreviation BX⚡
- `frontend/src/components/Footer.jsx` — BRAND import, dynamic name
- `frontend/src/components/LocalRatesGate.jsx` — text updated
- `frontend/src/components/PaywallModal.jsx` — text updated
- `frontend/src/pages/Landing.jsx` — BRAND import + all text updated
- `frontend/src/pages/About.jsx`, `Admin.jsx`, `Login.jsx`, `Marketplace.jsx`, `Profile.jsx`, `ResetPassword.jsx`, `Terms.jsx`, `VerifyEmail.jsx`, `Contact.jsx`, `Privacy.jsx`, `Home.jsx`, `Signup.jsx` — all text updated
- `frontend/index.html` — title + meta description
- `backend/src/services/emailService.js` — email header, footer, subjects, body
- `backend/src/services/smsService.js`, `backend/src/index.js`, `backend/src/routes/auth.js`, `backend/src/routes/marketplace.js`, `backend/src/prisma/seed.js` — text updated
- `backend/.env.example`, `README.md`, `.vscode/tasks.json` — text updated
- `CLAUDE.md` — renamed to BhavX, session 15 added, date updated to 2026-04-20

### Backup Files (intentionally NOT updated)
- `frontend/src/pages/Landing.backup.jsx` and `Landing.backup-v1.jsx` — historical rollback references, kept with old name

## Session 14 Changes (2026-04-14) — Full Detail

### Landing Page Copy Overhaul
- **Headline**: Changed from "Metal Rates. Local to Global." → "India's Biggest Metal Trading Platform"
- **Hero description**: Rewritten to emphasize WhatsApp replacement value — "The same rates you get on WhatsApp — but faster, cleaner, and always accurate."
- **City line**: "Live spot rates from: Delhi · Mumbai · Ahmedabad · Ludhiana · Chennai · +more" (removed "Mandoli" from all references)
- **Trust strip**: Changed from specific metrics to broader trust signals — "Real-time rate updates · Every trader verified · Every metal checked · Trusted by traders across India"
- **CTA button**: "Start for Free" → "Join MetalXpress Free"
- **How It Works**: Rewritten with detailed step descriptions — Check Live Rates / Buy & Sell on the Marketplace / Upgrade for the Full Edge
- **What You Get**: Free tier updated (no "basic charts" — analytics is PRO-only). Pro tier highlights verified marketplace.
- **FAQ**: Expanded from 5 → 11 questions covering: What is MetalXpress, metals covered, local rate sourcing, rate accuracy, WhatsApp comparison, seller/metal verification, commission, Pro plan, cities, data privacy, mobile access
- **Final CTA**: "Stop Trading on WhatsApp. Start Trading on MetalXpress." with expanded trust copy
- **FAQ heading**: "Frequently asked" → "Questions Traders Ask Us"

### Pricing Simplified — 3 Tiers → 2 Tiers
- **Removed Business/Vyapaar Plus tier** (₹999/month) from Landing.jsx and PaywallModal.jsx
- **Rationale**: Not enough distinct features to justify 3 tiers at launch. "Dedicated account manager" was a promise without infrastructure.
- **Remaining tiers**: Free (₹0/forever) and Pro (₹299/month)
- **Free features**: Live LME & MCX rates, updated throughout the day, price alerts, all metal types, works on any device
- **Pro features**: Everything in Free + full marketplace + local spot rates + candlestick charts & analytics + LME-MCX spread tracking + verified traders & materials

### About Page Rewrite
- **Tagline added**: "India's Biggest Metal Trading Platform" below heading
- **Sub-description**: "Live rates. Verified marketplace. Pro analytics. Built for traders who need accuracy — not WhatsApp forwards."
- **What We Do**: Rewritten to cover all metal types (ferrous, non-ferrous, scrap, alloys), WhatsApp replacement value, city coverage
- **Live Data**: Renamed from "Live Data Sources" — simplified to trader-facing language, removed technical implementation details
- **Our Mission**: Updated from "scrap metal trading" → "metal trading", added "tier-1 cities to tier-3 mandis" line
- **Body text**: Bumped from 13px → 14px for readability

### Font Standardization (Landing.jsx)
- **Problem**: Font sizes ranged from 9px to 34px with inconsistent body text (11px next to 12px next to 13px)
- **New consistent scale**:
  - 11px: Section labels (uppercase), metal names, footnotes
  - 12px: Trust strip, price %, plan name, period, captions
  - 13px: All body/description text, FAQ answers, pricing features
  - 14px: FAQ questions, card titles, hero CTAs, final CTA body
  - 15px: How It Works card titles
  - 22-26px: Section headings
  - 34px: Decorative elements (step numbers, price display)
- **Text opacity**: Bumped body text from `0.35/0.38` → `0.42` for better readability

### "Mandoli" Removed
- Removed "Mandoli" from all city references across the app — now just "Delhi" everywhere
- **Files affected**: Landing.jsx, About.jsx (already clean in FAQ items and other sections)

### PaywallModal Simplified
- Removed Business tier card (was 3 cards, now 2)
- Updated Pro features to match new landing page copy
- Removed `handleSubscribe` business tier logic (WhatsApp redirect)
- Updated subheadline: "Access local spot rates, verified marketplace, and advanced analytics."
- Modal maxWidth reduced from 680px → 520px (better proportions with 2 cards)

### Rebranding Completion — "Scrap Metal" → "Metal"
- **Login.jsx**: "I buy scrap metal" → "I buy metals", "I sell scrap metal" → "I sell metals"
- **Signup.jsx**: Same trader type description changes
- **Profile.jsx**: Same trader type description changes
- **Marketplace.jsx**: "Sell Your Scrap Metal" → "Sell Your Metal", "Login to sell your scrap metal" → "Login to sell your metal"
- **Terms.jsx**: "verified scrap metal traders" → "verified metal traders"
- **About.jsx**: Full rewrite (see above)
- **index.html**: Title → "MetalXpress ⚡ Real-Time Metal Intelligence for India", meta description updated

### OM Symbol Design
- Tested multiple layouts: watermark behind text (approved), OM-first at top (rejected — navbar overlap), OM at bottom of hero
- **Final approved version**: OM watermark at `top: 58%`, `fontSize: min(72vw, 560px)`, `opacity: 0.11`, positioned behind hero text
- **Backups saved**: `Landing.backup.jsx` and `Landing.backup-v1.jsx` for rollback reference

### Files Modified (Session 14)
- `frontend/src/pages/Landing.jsx` — complete copy rewrite, 2-tier pricing, 11 FAQs, font standardization, Mandoli removed
- `frontend/src/pages/About.jsx` — full rewrite with new copy and 14px body text
- `frontend/src/components/PaywallModal.jsx` — removed Business tier, updated Pro features
- `frontend/src/pages/Login.jsx` — trader type "scrap metal" → "metals"
- `frontend/src/pages/Signup.jsx` — trader type "scrap metal" → "metals"
- `frontend/src/pages/Profile.jsx` — trader type "scrap metal" → "metals"
- `frontend/src/pages/Marketplace.jsx` — "Scrap Metal" → "Metal" in sell tab
- `frontend/src/pages/Terms.jsx` — "scrap metal traders" → "metal traders"
- `frontend/index.html` — updated title and meta description
- `CLAUDE.md` — session 14 changes, updated date to 2026-04-14

## Session 13 Changes (2026-04-13) — Full Detail

### Analytics Page — Full Redesign (Trader-Centric)
- **Charting library**: Switched from `recharts` to `react-apexcharts` + `apexcharts` — canvas-based, faster, better animations, richer tooltips, zoom/pan support
- **Focus shift**: Removed all company/platform metrics (GMV, user counts, commission, deal close rate) — these were company dashboard metrics, not useful for traders
- **New sections**:
  - **Metal selector cards** — 6 clickable metal cards showing live price + change %, active card highlighted with metal color and glow
  - **Live price hero** — selected metal's LME price (large), change % badge with colored background, MCX equivalent, USD/INR rate
  - **Chart type toggle** — `LineChart` / `CandlestickChart` lucide icons; Line is default
  - **LME Line chart (default)** — mixed ApexCharts chart: `rangeArea` H-L band (subtle 9% opacity shadow) behind an `area` close line (gradient glow in metal color). Tooltip shows Close/High/Low
  - **LME Candlestick chart (optional)** — ApexCharts `candlestick` with green/red candles, wicks, custom HTML tooltip showing O/H/L/C + change%
  - **MCX chart** — same Line/Candle toggle as LME, shown when MCX history available
  - **Signal cards** (4 columns): vs 30-day average, 7-day momentum, today's High, MCX price
  - **Marketplace Activity by Metal** — relative bar chart per metal
  - **Period High/Low table** — computed from actual fetched price data (accurate per selected period, all 6 metals). Renamed from "All-Time" which was misleading
  - **Live LME snapshot** — bottom row of clickable metal cards
- **Backend fix**: Removed broken `listingType` groupBy (field doesn't exist in Listing schema). Simplified to single `groupBy(['metalId'])` with total count + qty

### Price Cron Job (Session 13)
- **Auto-fetch every 15 min**: `takePriceSnapshot()` in `backend/src/index.js` — saves Yahoo Finance prices to `LMERate`/`MCXRate` with `source: 'cron'`
- **Runs on startup**: Called immediately when backend starts, not just on schedule
- **Admin priority preserved**: CUTOFF check filters `source: 'admin'` only — cron rows don't interfere with the 15-min admin paste priority window
- **`source` field added** to `LMERate` and `MCXRate` schema: `String @default("admin")` — distinguishes admin pastes from auto-fetches

### Daily OHLC (Session 13)
- **Backend `toDailyOHLC()`** in `analytics.js` — groups all price rows per metal per day into `{ date, open, high, low, close }` buckets
- **Fetches all metals at once** — no `?metal=` filter on `/api/analytics/price-history` from frontend, so Period H/L table shows all 6 metals accurately

### Seed Script (Session 13)
- **`backend/src/scripts/seedPriceHistory.js`** — seeds 90 days × 8 pts/day × 6 metals of realistic price data (random walk with volatility per metal). Deletes old `source: 'cron'` rows first. Run: `node src/scripts/seedPriceHistory.js`

### Chart Design Details (Session 13)
- **Y-axis auto-scaled**: `yMin = Math.floor(min * 0.97)`, `yMax = Math.ceil(max * 1.03)` — 3% padding so candles fill the pane
- **Per-metal color theming**: Each metal has its own color (`METAL_COLORS` map) used for active card glow, chart gradients, toggle button highlight
- **Chart height**: LME 380px, MCX 280px
- **`key` prop** on charts forces remount on metal/period/type change — prevents stale data rendering

### Bug Fixes (Session 13)
- **Analytics overview API** — was crashing with `PrismaClientValidationError` on `listingType` field that doesn't exist in Listing schema. Fixed by removing the buy/sell split groupBy, using single metalId groupBy instead
- **VerifyEmail blank page** — `message` variable referenced but never defined in pending state block. Fixed to `resendError`
- **Admin + test accounts deleted** — re-created `admin@metalxpress.in` / `admin1234` and `test@metalxpress.in` / `test1234` with emailVerified + kycVerified = true after user DB wipe

### Dependencies Changed (Session 13)
- Added: `react-apexcharts ^2.1.0`, `apexcharts ^5.10.6` (frontend)

### Files Modified (Session 13)
- `frontend/src/pages/Analytics.jsx` — complete redesign: ApexCharts candlestick + line/area combo, chart type toggle (lucide icons), period H/L table, per-metal colors
- `backend/src/routes/analytics.js` — removed broken listingType groupBy; `toDailyOHLC()` for OHLC aggregation; all-metals fetch (no metal filter)
- `backend/src/index.js` — `takePriceSnapshot()` function, runs on startup + every 15 min; `source: 'cron'` on saved rows; admin priority CUTOFF filters `source: 'admin'` only
- `backend/prisma/schema.prisma` — added `source String @default("admin")` to `LMERate` and `MCXRate`
- `backend/src/scripts/seedPriceHistory.js` — NEW: 90-day price history seed script
- `CLAUDE.md` — updated current date, added session 13 changes

### Landing Page Redesign (Session 13 — continued)
- **New `Landing.jsx`** — full marketing landing page for non-logged-in users, replaces HeroSection
- **Sections**: Hero with OM watermark, live price preview (fetched from API), How It Works (3 steps), What You Get (Free/Pro), Pricing cards (Free/Pro/Business), FAQ accordion, Final CTA
- **OM watermark**: Unicode ॐ at `top: 58%`, `fontSize: min(72vw, 560px)`, `opacity: 0.11` — positioned below navbar to avoid overlap
- **Headline**: "Metal Rates. Local to Global." with gold city line (DELHI · MUMBAI · AHMEDABAD · LUDHIANA · AND MORE)
- **Sub-copy**: Highlights all features — local spot rates, LME/MCX benchmarks, verified B2B marketplace, pro analytics
- **Trust strip**: "Verified traders only | Live every 15 min | 0.1% commission on deals | PAN-verified KYC"
- **FAQ accordion**: 5 items covering local rate sourcing, marketplace safety, LME/MCX accuracy, Pro plan features, data privacy
- **Home.jsx**: `if (!user) return <Landing />;` — non-logged-in users see landing page, logged-in users see rates dashboard

### Navigation Overhaul (Session 13 — continued)
- **Desktop nav conditional**: `user ? NAV_ITEMS.map(...)` (app nav: Rates/Market/Analytics/Alerts/Admin) : marketing nav (About/Contact)
- **Auth section for visitors**: Login (text link) + Sign Up (gold button) side by side
- **Mobile bottom nav**: Hidden for non-logged-in users (`{user && <nav>...</nav>}`)
- **Rationale**: Visitors can't use app features (Rates/Market/Analytics/Alerts/Admin), so showing dead-end links is bad UX. Marketing nav guides them to About/Contact instead.

### Rebranding — "Scrap Metal" → "Metal" (Session 13 — continued)
- Removed "scrap" from all user-facing text across the app
- **Files updated**: Login.jsx, Signup.jsx, Profile.jsx (trader type descriptions), Marketplace.jsx ("Sell Your Metal"), About.jsx, Terms.jsx, Footer.jsx
- **Page title**: "MetalXpress ⚡ Real-Time Metal Intelligence for India"
- **Meta description**: Updated to mention marketplace, analytics, local rates

### PRO Gates (Session 13 — continued)
- **Analytics**: PRO-only (existing gate from session 12)
- **Marketplace**: PRO subscription gate added BEFORE KYC gate — non-PRO users see "Upgrade to Pro" CTA
- **KYC/PAN gate**: Only blocks Marketplace (not signup). Moved KYC step OUT of signup flow entirely — signup is now single-step (details + OTP). Users complete KYC from Profile page or when they first access Marketplace.

### Signup Simplification (Session 13 — continued)
- Removed entire KYC step 2 from signup flow (tradeCategory, businessName, panNumber, legalName, gstNumber)
- Signup is now: Details (name, email, phone, password, trader type) → OTP verification → done
- KYC can be completed later from Profile page or on first Marketplace access

### Additional Files Modified (Session 13 — continued)
- `frontend/src/pages/Landing.jsx` — NEW: full marketing landing page
- `frontend/src/pages/Home.jsx` — renders Landing for non-logged-in users
- `frontend/src/components/Navbar.jsx` — conditional nav (marketing vs app), hidden mobile nav for visitors
- `frontend/src/components/HeroSection.jsx` — feature cards reordered, Marketplace badge → PRO
- `frontend/src/components/Footer.jsx` — rebranded description
- `frontend/src/pages/Signup.jsx` — removed KYC step, simplified to single-step + OTP
- `frontend/src/pages/Marketplace.jsx` — PRO gate before KYC gate, rebranded text
- `frontend/src/pages/Login.jsx` — trader type desc rebranded
- `frontend/src/pages/Profile.jsx` — trader type desc rebranded
- `frontend/src/pages/About.jsx` — rebranded text
- `frontend/src/pages/Terms.jsx` — rebranded text
- `frontend/index.html` — updated title and meta description

## Session 12 Changes (2026-04-12) — Full Detail

### Bug Fixes

1. **VerifyEmail blank page crash** — `VerifyEmail.jsx` referenced undefined `message` variable in pending state. Fixed by replacing with `resendError` state variable.

2. **Email verification "expired" on repeat clicks** — Backend nulled `emailVerifyToken` after verification. If user clicked link again (or StrictMode double-fired), token couldn't be found → showed "expired". Fixed by keeping token in DB after verification and checking `emailVerified` status first. Repeat clicks now return success with `alreadyVerified: true`.

3. **Signup button enabled with short password** — Submit button disabled check used `password.length < 6` but validation required 8 chars. Fixed to `password.length < 8`.

4. **Email verification banner missing after signup** — Register endpoint didn't include `emailVerified: false` in user response. Banner check `user.emailVerified !== false` evaluated to `true` (since `undefined !== false`), so banner never showed. Fixed by adding `emailVerified: false` to register response.

### LMEStrip Fix
- Removed legacy `d.rates` fallback from LMEStrip.jsx — now uses `d.metals ?? []` only
- The `d.rates` shape hasn't existed since session 3; the fallback was dead code

### Legacy Cleanup
- **Deleted unused components**: `CitySelector.jsx`, `MetalCard.jsx`, `RateTable.jsx`, `LMERatesPanel.jsx` — none imported anywhere
- **Removed `ioredis`**: Was installed but never used in any backend code. `npm uninstall ioredis` removed 11 packages.

### Mobile Responsiveness Fixes
- **Marketplace listing grid**: Changed `minmax(320px, 1fr)` → `minmax(min(100%, 320px), 1fr)` to prevent overflow on 320px screens
- **Trader type grids** (Login + Signup): Changed `1fr 1fr 1fr` → `repeat(auto-fit, minmax(90px, 1fr))` for responsive collapse
- **Marketplace 2-column grids** (PostForm, filters, counter-offer, KYC gate): Changed all `1fr 1fr` → `repeat(auto-fit, minmax(140px, 1fr))` to collapse to single column on small screens

### Analytics Page (NEW — Pro Tier Feature)
- **Route**: `/analytics` — accessible from Navbar (desktop + mobile bottom nav)
- **Pro gate**: Non-subscribers see lock icon + "Upgrade to Pro — ₹299/mo" CTA
- **Backend**: `GET /api/analytics/overview` — marketplace stats, user counts, GMV, deal close rate, volume by metal, price extremes
- **Backend**: `GET /api/analytics/price-history?metal=Copper&period=30d` — LME + MCX price history grouped by metal
- **Backend**: `GET /api/analytics/local-history?hubSlug=delhi-mandoli&metal=Copper` — local rate history per hub
- **Charts** (recharts library):
  - LME price trend: Area chart with gold gradient, per-metal, 7d/30d/90d period selector
  - MCX price trend: Line chart
  - Metal selector pills: Copper, Aluminium, Zinc, Nickel, Lead, Tin
- **Stats grid**: Active Listings, Total Deals, Platform GMV, Deal Close Rate, Registered Users, Completed Deals
- **Listings by Metal**: Donut/pie chart with legend
- **LME All-Time High/Low**: Per-metal table with green high / red low
- **Current LME Snapshot**: Clickable metal cards showing live price + change %
- **Dependency**: `recharts` added to frontend

### Files Modified (Session 12)
- `frontend/src/pages/VerifyEmail.jsx` — `message` → `resendError` fix
- `frontend/src/pages/Signup.jsx` — password button check `< 6` → `< 8`, responsive trader grid
- `frontend/src/pages/Login.jsx` — responsive trader grid
- `frontend/src/pages/Marketplace.jsx` — responsive grids (listing, filters, PostForm, KYC gate)
- `frontend/src/pages/Analytics.jsx` — NEW: full analytics dashboard with recharts
- `frontend/src/components/Navbar.jsx` — added Analytics nav item with BarChart3 icon
- `frontend/src/components/LMEStrip.jsx` — removed `d.rates` fallback
- `frontend/src/App.jsx` — added Analytics import + route
- `backend/src/routes/auth.js` — verify-email keeps token, handles already-verified; register returns emailVerified
- `backend/src/routes/analytics.js` — NEW: overview, price-history, local-history endpoints
- `backend/src/index.js` — registered analytics router
- `backend/package.json` — removed ioredis
- `frontend/package.json` — added recharts

### Files Deleted (Session 12)
- `frontend/src/components/CitySelector.jsx` (legacy, unused)
- `frontend/src/components/MetalCard.jsx` (legacy, unused)
- `frontend/src/components/RateTable.jsx` (legacy, unused)
- `frontend/src/components/LMERatesPanel.jsx` (legacy, unused)

### Dependencies Changed (Session 12)
- Added: `recharts` (frontend) — React charting library for analytics
- Removed: `ioredis` (backend) — Redis client, was never used

## Session 10 Changes (2026-03-22) — Full Detail

### Image/Video Display Fix
- **Problem**: Seed listing images used Pexels CDN URLs which were hotlink-blocked by browsers (HTTP 200 from curl but blank/broken in `<img>` tags due to Referer checks)
- **Solution**: Downloaded 11 real scrap metal photos (26KB-99KB) + 2 videos to `backend/uploads/` folder. Switched seed.js from Pexels URLs to local `/uploads/seed-*.{jpg,webm}` paths served via Express static middleware
- **Files**: `seed-scrap-yard-1.jpg` through `seed-metal-factory-1.jpg`, `seed-scrap-metal-recycle.webm` (19.9MB, Wikimedia CC), `seed-copper-pipe.webm` (4.9MB, Wikimedia CC)
- **Express static**: Already configured `app.use('/uploads', express.static(...))` in `backend/src/index.js`

### Lightbox Gallery Component (Marketplace.jsx)
- **Full-screen image/video viewer** for quality inspection of scrap metal listings
- Features: arrow navigation (←→), keyboard support (Escape to close, arrow keys), thumbnail strip at bottom, video autoplay, counter display ("2 / 5"), click-outside-to-close
- Thumbnails in ListingCard now clickable — opens Lightbox at the clicked index
- ListingCard shows up to 4 thumbnails with "+N" overflow indicator and ZoomIn hover overlay
- Video files detected by extension (.mp4, .mov, .webm) and rendered with `<video>` tag

### Minimum 4 Media Required per Listing
- PostForm now requires at least 4 photos/videos before submit
- Validation message: "At least 4 photos/videos required for listing verification"
- Counter shows current count vs minimum

### T&C Enforcement (Explicit, Not Implicit)
- **PostForm**: Added T&C checkbox with links to Terms of Service and Dispute Policy. Submit blocked until both minimum media AND T&C are accepted
- **OfferModal**: Added T&C checkbox with links to Terms, Commission Policy, and Refund Policy. Submit disabled until checked
- **Signup.jsx**: T&C checkbox already present (from session 9) with links to Terms, commission policy, refund policy, ban policy, and Privacy Policy

### Deal Flow Bug Fix — "Make Offer Fails First Time"
- **Problem**: Frontend showed "Failed to send offer" error on first click, but deal was actually created (409 conflict on duplicate attempt)
- **Root cause**: Backend returned `{error, dealId}` for existing deal attempts, frontend only checked `err.response?.data?.error` for display
- **Fix**: Frontend now checks `err.response?.data?.dealId` — if present, navigates to existing deal instead of showing error
- **Additional**: BrowseTab now builds `activeDealMap` from loaded deals, shows "📋 View My Offer" button for listings with existing negotiations (prevents duplicate attempt entirely)

### Profile Page Fixes
- **Stale data bug**: After profile save, AuthContext `user` object wasn't refreshed. Added `refreshUser()` method to AuthContext that re-fetches `/api/auth/me` and updates state + localStorage. Called after successful profile save.
- **Phone change OTP**: Detects when phone number differs from original, shows "Send OTP" button, OTP input appears after send, backend verifies OTP before allowing phone change
- **KYC form overhaul** (see KYC section below)

### KYC Verification Overhaul — PAN-Based Identity Check
**Philosophy**: Thorough verification that maintains trader privacy. No scary government/tax language. Professional tone only.

**What we collect**:
- **PAN Card Number** (required) — `[A-Z]{5}[0-9]{4}[A-Z]` format validation, stored uppercase
- **Legal Name** (required) — as printed on PAN card
- **Trade Category** (required) — dropdown: Scrap Collector/Kabadiwala, Scrap Dealer/Merchant, Factory/Manufacturer, Recycler/Smelter, Individual Trader, Broker/Agent, Other
- **Business/Trade Name** (optional)
- **GSTIN** (optional) — 15-character format validation for GST-registered businesses

**KYC Gate — Blocks Entire Marketplace**:
- `KycGate` component in Marketplace.jsx renders ABOVE all tab content when `user && !user.kycVerified`
- Blocks ALL marketplace access: browsing, posting, negotiating — not just posting
- Professional messaging: "To keep the marketplace safe for everyone, we verify all participants..."
- Trust indicators: PAN-based identity check, End-to-end encrypted, Verified trader badge, Industry-standard security
- CTA: "Complete Verification →" navigates to `/profile`
- "Just Checking" users get: "Join as a Trader to Access Marketplace" variant

**Privacy Messaging (IMPORTANT — rephrased per owner feedback)**:
- **OLD (removed)**: "MetalXpress does NOT report any transaction data to GST, Income Tax, or any government body" — owner said this "seems too outright and makes my business seem illegitimate and fraudulent"
- **NEW**: "Your identity details are stored with bank-grade encryption and used solely for trader verification on MetalXpress. We never share your information with external parties."
- No mention of government, GST, Income Tax, or tax authorities anywhere in KYC flow
- Focus on: encryption, security, trust between traders, data protection

**Signup KYC Step (Step 3)**:
- For BUYER/SELLER signups only (CHECKING_RATES skips)
- Fields: PAN Card (required), Legal Name (required), Trade Category (required), Business Name (optional), GSTIN (optional)
- Real-time PAN format validation with error message
- "Skip for now" button available — but note: "Marketplace access requires verification"
- Professional privacy message (see above)

**Profile KYC Section**:
- Shows when `needsKyc` is true (user is buyer/seller and not yet verified)
- Same fields as Signup KYC step
- KYC status banner: green "Identity Verified ✓" or amber "Verification Required"
- Inline PAN format validation

**Backend KYC Logic** (auth.js):
- GET `/me`: Returns `panNumber`, `gstNumber`, `legalName`, `businessName`, `tradeCategory`, `termsAcceptedAt`
- PATCH `/profile`: PAN format validation (`/^[A-Z]{5}[0-9]{4}[A-Z]$/`), GST format validation (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/`), `kycComplete` flag requires PAN to be present
- POST `/register`: Accepts `panNumber`, `gstNumber`, `legalName`; sets `kycVerified: true` only when both PAN AND tradeCategory provided

**Schema Changes** (User model):
```prisma
panNumber     String?   // PAN card: ABCDE1234F
gstNumber     String?   // GSTIN: 22ABCDE1234F1Z5
legalName     String?   // Full legal name as on PAN
businessName  String?   // Trade/business name (optional)
tradeCategory String?   // Dropdown category
```

### Removed: JustCheckingGate
- Old `JustCheckingGate` references in BrowseTab and Sell tab removed
- Replaced by top-level `KycGate` in Marketplace component (blocks everything for unverified users, regardless of trader type)
- CHECKING_RATES users now see KycGate with "Join as a Trader" messaging

### AuthContext Enhancement
- Added `refreshUser()` method — calls GET `/api/auth/me`, updates `user` state and localStorage
- Exported in Provider value alongside `user`, `subscription`, `loading`, `login`, `logout`, `refreshSubscription`
- Used by Profile.jsx after save to ensure UI reflects latest data immediately

### Dependencies Added (Session 10)
- `multer` (added in session 9) — file upload middleware for Express

### Files Modified (Session 10)
- `backend/prisma/schema.prisma` — Added `panNumber`, `gstNumber`, `legalName` to User model
- `backend/src/routes/auth.js` — KYC fields in GET /me, PATCH /profile (PAN/GST validation), POST /register
- `backend/src/prisma/seed.js` — Local image/video paths replacing Pexels CDN URLs
- `backend/uploads/` — 11 seed images + 2 seed videos (local files)
- `frontend/src/pages/Marketplace.jsx` — KycGate (blocks entire marketplace), Lightbox gallery, ListingCard thumbnails, OfferModal T&C + dealId fix, PostForm min 4 media + T&C, BrowseTab activeDealMap, removed JustCheckingGate
- `frontend/src/pages/Profile.jsx` — refreshUser() after save, phone OTP flow, PAN/GST/legalName KYC form, rephrased privacy message
- `frontend/src/pages/Signup.jsx` — KYC step with PAN/Legal Name/GST fields, rephrased privacy message
- `frontend/src/context/AuthContext.jsx` — Added `refreshUser()` method
- `frontend/src/utils/api.js` — `uploadMedia()` function (added in session 9)

## Session 3 Changes (2026-03-20) — Full Detail

### UI Changes (Home.jsx)
- **Removed Mandi/Market column headers** from local rates. Prices now display inline as `₹BuyPrice / ₹SellPrice` with no table columns.
- **Variant price display**: Grades with `hasVariants=true` (Super D, CCR, Kaliya) now show a second line: `1.6MM: ₹variantPrice` in dimmed gold (rgba(207,181,59,0.6), font-size 10).
- **Removed source badge** ("Broadcast"/"Yahoo") from Forex & Indices section — was visual noise.
- **Local rates timestamp**: Now shows the timestamp *from inside the WhatsApp message* (e.g., "20 Mar, 01:45 PM"), not the backend fetch time. Uses `localRates.messageTimestampStr` (pre-formatted string from backend), displayed directly with no `date-fns` formatting.
- **Forex timestamp**: Uses `liveData.forexUpdatedAt` if admin-pasted, else falls back to `liveData.lmeUpdatedAt`.
- **Auto-refresh**: Local rates still refresh every 5 minutes via `setInterval`.

### Admin.jsx — Unified Smart Parser
- **Complete rewrite**: Replaced the two-panel grid (LocalRatesPanel + LMEParserPanel) with a single **`UnifiedParserPanel`** component.
- Admin pastes **any** broadcast message into one textarea — parser auto-detects type.
- Type detection via `detectMessageType(result)` in rateParser returns one of: `'lme-mcx'`, `'local-rates'`, `'mixed'`, `'unknown'`.
- **Type badge** shown after parse: blue "LME / MCX Broadcast", green "Local Spot Rates", amber "Mixed".
- City auto-detect banner only shown for local/mixed types (calls `resolveHub()` to fuzzy-match city name from parsed message against `/api/cities`).
- **Preview tables**: `PreviewTable` shared component renders LME/MCX/Forex previews from parsed data.
- **Save routing**: local-rates → POST with hubSlug; lme-mcx → POST without hubSlug; mixed → both saves.
- **Save button** label adapts: "Save 5 grades → Delhi · Go Live" or "Save 3 LME · 3 MCX · Go Live".
- Helper components: `Chip` (count badges), `buildSaveLabel()`, `TYPE_CONFIG` map.
- `canSave` logic: requires local-rates to have >0 grades + resolved hub; lme-mcx to have >0 entries.

### rateParser.js — Critical Fixes
1. **`extractMessageTimestamp` rewrite** (⏰ emoji fix):
   - Old regex used `\s+` between date and time → broke when ⏰ (U+23F0, not a surrogate pair) sat between them.
   - New regex uses `[^\d]+` (any non-digit chars, including emoji) as separator.
   - Returns `{ display, iso }` object:
     - `display`: raw-string like "20 Mar, 01:45 PM" — extracted directly from message, no timezone math.
     - `iso`: UTC-adjusted ISO string (subtracts 5h 30m IST offset using `Date.UTC()` arithmetic).
   - `MONTHS_SHORT` constant added at top for month name lookup.

2. **`detectMessageType(result)` function added**:
   ```js
   function detectMessageType(result) {
     const localGrades = result.metals?.reduce((s, m) => s + (m.rates?.length || 0), 0) || 0;
     const hasLME    = (result.lme?.length || 0) >= 2;
     const hasMCX    = (result.mcx?.length || 0) >= 2;
     const hasForex  = (result.forex?.length || 0) >= 1;
     const hasLocal  = localGrades > 0;
     if (hasLocal && !hasLME && !hasMCX) return 'local-rates';
     if ((hasLME || hasMCX || hasForex) && !hasLocal) return 'lme-mcx';
     if (hasLocal && (hasLME || hasMCX)) return 'mixed';
     return 'unknown';
   }
   ```

3. **`parseRateMessage` updated**: Now sets `result.parsedAt = msgTs?.iso` and `result.messageTimestampStr = msgTs?.display`.

4. **`cleanText` exported**: `module.exports = { parseRateMessage, cleanText }` so `rates.js` can reuse it.

### rates.js — Critical Fixes
1. **`absToChangePct` helper** — fixes % change showing -100% for metals:
   ```js
   function absToChangePct(price, absChange) {
     if (!absChange || absChange === 0) return 0;
     const prev = price - absChange;
     if (!prev || prev === 0) return 0;
     return parseFloat(((absChange / prev) * 100).toFixed(2));
   }
   ```
   - Admin-pasted LME messages store **absolute USD/MT change** (e.g., −100). Old code sent this raw to frontend which displayed it as %. Now correctly computes: Copper −100 / (12205 + 100) × 100 = −0.81%.

2. **`fxChangePct` helper** — same treatment for forex absolute changes:
   ```js
   function fxChangePct(row, fallbackPct) {
     if (!row) return fallbackPct ?? 0;
     const abs = parseFloat(row.change) || 0;
     if (abs === 0) return fallbackPct ?? 0;
     const prev = parseFloat(row.price) - abs;
     if (!prev || prev === 0) return fallbackPct ?? 0;
     return parseFloat(((abs / prev) * 100).toFixed(4));
   }
   ```

3. **`normGrade` fuzzy matching** in `/save-parsed`:
   ```js
   function normGrade(s) {
     return s.replace(/[^a-z0-9]/gi, '').toLowerCase();
   }
   ```
   - Strips ALL non-alphanumeric (spaces, dots, dashes). WhatsApp bold Unicode decodes `𝐂𝐂𝐑` with spaces between each letter: "C C R". Old code only stripped dots → "c c r" ≠ "ccrod". New: "C C R" → "ccr" = "CCR" → "ccr". ✓

4. **4-level grade lookup** in `/save-parsed`:
   ```js
   const gradeId =
     gradeMap[`${metalKey}:${gradeKey}`] ||
     gradeMap[gradeKey.toLowerCase()] ||
     gradeMapNorm[normKey] ||
     gradeMapNorm[normGrade(gradeKey)];
   ```

5. **`/local` endpoint** now returns `messageTimestampStr`:
   ```js
   function extractDisplayTs(rawMsg) { /* same regex as rateParser */ }
   // Response includes:
   messageTimestampStr: extractDisplayTs(lastUpdate?.rawMessage) || null
   ```

6. **Data priority in `/live`**: Admin paste (15m for LME, 10m for MCX/Forex) overrides Yahoo/Stooq. Yahoo is fallback.

### seed.js — Grade Name Fixes
Grade names updated to match actual WhatsApp message format (so `normGrade` matching works reliably):
- `Gun Metal Local` → `Gun Metal`
- `Mandi MS Scrap` → `Mandi Scrap`
- `Mandi MS Ingot` → `Mandi Ingot`
- `DELHI_MANDOLI_RATES` keys updated accordingly.
- DB reseeded: 27 Delhi Mandoli rates confirmed saved.

### Verified Working (session 3)
- **% change**: Copper −0.81%, Aluminium +1.16%, Zinc −1.11%, Nickel −1.16%, Lead −2.14%, Tin −0.57% ✓
- **Fuzzy grade matching**: C C Rod → ccrod, C C R → ccr, Gun Metal → gunmetal, Mandi Scrap → mandiscrap ✓
- **Timestamp**: "20 Mar, 01:45 PM" extracted from message and displayed directly ✓
- **Variant prices**: Super D, CCR, Kaliya show 1.6MM price on second line ✓
- **Unified parser**: LME message → auto-routes to LME save; local message → auto-routes to hub save ✓

## Session 4 Changes (2026-03-21) — Full Detail

### LME Admin Paste Cutoff: 12h → 15min
- `CUTOFF_12H` renamed to `CUTOFF_15M` in `rates.js` `/live` endpoint
- Admin-pasted LME data now only overrides Yahoo for 15 minutes (was 12 hours)
- MCX/Forex cutoff remains 10 minutes, Lead/Tin DB fallback remains 7 days

### Auth Overhaul — Email + Password
- **Prisma schema**: `phone` changed from `String @unique` to `String? @unique`; added `email String? @unique` and `passwordHash String?`
- **POST /api/auth/register**: Email+password signup with bcrypt hashing (12 rounds), JWT issuance, duplicate email check
- **POST /api/auth/login**: Email+password login with bcrypt.compare, JWT issuance
- **Google OAuth callback**: Now checks existing users by email first (dedup), then falls back to `google_<id>` phone placeholder
- **bcryptjs** already installed in backend
- **Frontend**: `registerEmail()` and `loginEmail()` added to `api.js`
- **AuthContext**: Added `subscription` state, `refreshSubscription()` method, fetches `/api/auth/subscription` on mount

### Login Page Redesign
- **Primary flow**: Email + Password form (email input, password with eye toggle, "Sign In" CTA)
- **Google OAuth**: Button above form (greyed "Soon" if not configured)
- **Phone OTP**: Secondary link "Login with Phone OTP" — toggles to phone/OTP flow inline
- **Mode state**: `mode: 'email' | 'phone' | 'otp'` — URL param `?method=phone` can set initial mode
- **Signup link**: "Don't have an account? Sign Up" at bottom

### New Signup Page (`/signup`)
- Full registration form: Name, Email, Password, Confirm Password, Trader Type (2x2 grid)
- Google OAuth button, Phone OTP link
- Terms/Privacy links at bottom
- Calls `POST /api/auth/register`, then `login(token, user)`, navigate to `/`

### Hero Section for Non-Logged-In Users
- **HeroSection.jsx**: Gold gradient headline "India's Real-Time Scrap Metal Rate Platform"
- Two CTAs: "Get Started Free" → `/signup`, "View Live Rates" → scrolls to `#lme-section`
- 2x2 feature cards: LME/MCX Live (FREE), Local Spot Rates (PRO), Marketplace (FREE), Price Alerts (FREE)
- Only renders when `!user` (logged-in users skip straight to rates)

### Local Rates Paywall Gate
- **LocalRatesGate.jsx**: Wraps the local rates accordion in Home.jsx
- Non-subscribed users see: blurred content (filter: blur(6px), maxHeight 320px) with gradient overlay
- CTA varies: `!user` → "Sign Up Free" + "Login" buttons; logged-in free user → "Upgrade to Pro — ₹299/mo" → opens PaywallModal
- Pro/Business subscribers see full content unblurred

### Accordion Default-All-Open
- Replaced `openMetal` (single string) with `closedMetals` (Set)
- Empty set = all metals expanded (default on load)
- Clicking a metal header toggles only that metal
- Added "Expand All" / "Collapse All" button in Local Spot Rates header

### Footer Component
- **Footer.jsx**: Renders on all consumer pages (not Admin) via AppShell
- 3-column layout: Brand + description, Company (About, Contact), Legal (Terms, Privacy)
- Copyright year + "Made in India 🇮🇳"

### Static Pages
- **About.jsx** (`/about`): Company info, What We Do, Live Data Sources, Mission — glass-panel sections
- **Terms.jsx** (`/terms`): Terms of Service with 8 sections (placeholder legal text)
- **Privacy.jsx** (`/privacy`): Privacy Policy with 8 sections (placeholder legal text)
- **Contact.jsx** (`/contact`): Contact cards (Email, WhatsApp, Phone, Office) + FAQ section

### App.jsx Route Updates
- Added routes: `/signup`, `/about`, `/terms`, `/privacy`, `/contact`
- Footer integrated into AppShell (renders on all consumer pages)
- Admin remains standalone (no Navbar, no Footer)

### Navbar Update
- User display now shows `user.name || user.email || user.phone` (was just `user.phone`)

## Session 5 Changes (2026-03-21) — Full Detail

### Alerts Page Fix
- **Duplicate Navbar removed**: Alerts.jsx imported and rendered its own `<Navbar />` while also wrapped in AppShell — caused double LME ticker strip. Removed the redundant import and render.

### Auth Integration (Phone + Email Linking)
- **OTP login**: Now checks for existing user by phone (was upsert which could create duplicates). If found, updates profile fields; if not, creates new user.
- **Email registration**: Accepts optional `phone` field — validates uniqueness before creating. Phone is linked to the same account.
- **Profile endpoint**: PATCH `/api/auth/profile` now supports linking `phone` or `email` to existing account with uniqueness validation.
- **Subscription endpoint**: `GET /api/auth/subscription` now returns `plan: 'pro'` for accounts in `PRO_EMAILS` env var (default: `test@metalxpress.in`).

### Pro Test User
- **Seeded**: `test@metalxpress.in` / `test1234` with `plan: 'pro'` subscription
- Add your own email to `PRO_EMAILS` env var (comma-separated) to get pro access on any account
- Pro users see full local rates (no blur), analytics (when built)

### Marketplace Overhaul
- **Filter fix**: Backend `/api/marketplace/listings` now accepts `metal` query param (name string like "Copper") in addition to `metalId`. Frontend sends metal name → backend matches via `metal.name` relation.
- **10 diverse dummy listings** seeded across 5 test users:
  - Sellers: Rajesh Kumar (Delhi), Suresh Patel (Ahmedabad), Priya Verma (Chennai), Vikram Singh (Ludhiana)
  - Buyer: Amit Sharma (Mumbai)
  - Metals: Copper (4), Brass (2), Aluminium (2), Lead (1), Zinc (1)
- **BUY/SELL tags**: Each listing shows a colored badge — blue "BUY" or green "SELL"
- **Verified badge**: Green shield + "Verified" for admin-verified listings
- **Price label adapts**: "Asking price" for sell, "Willing to pay" for buy, "Negotiate" when no price set
- **Listing verification**: PATCH `/api/marketplace/listings/:id/verify` endpoint (admin-only, requires `x-admin-password` header)

### Schema Changes
- `Listing` model: Added `isVerified Boolean @default(false)` and `listingType String @default("sell")`

### Seed Data Updates
- 6 test users created (5 traders + 1 pro test account)
- 10 marketplace listings with realistic descriptions, locations, and prices
- Pro test user: `test@metalxpress.in` / `test1234` (bcrypt hashed)

## Known Remaining Issues (updated session 9)
- **Alerts**: Backend CRUD works, but no cron/background job to actually trigger alerts when rates cross thresholds. Needs: periodic check + notification mechanism (SMS or in-app). `node-cron` is installed but only partially used.
- **PaywallModal**: Not wired to actual Razorpay yet — opens with plan cards, shows "Coming soon" alert. Razorpay env vars defined in `.env.example` but not integrated.
- **Local rates other cities**: Only Delhi Mandoli seeded. Admin must paste real WhatsApp messages per hub to populate other cities.
- **Nifty/Sensex**: ^NSEI and ^BSESN may occasionally return null (Yahoo rate limits); gracefully shows "—"
- **LMEStrip in Navbar**: Fixed (session 12) — uses `d.metals` only, legacy `d.rates` fallback removed
- **Lead/Tin DB fallback**: Only served if admin-pasted LME message is ≤7 days old; otherwise shows "—"
- **Forgot password**: Implemented and working (session 11) — reset email sent via Resend, token-based reset page, password complexity enforced.
- **Email verification**: Fully implemented and working (session 11) — verification email on signup, mandatory verification, amber banner reminder, 60s resend cooldown, StrictMode-safe.
- **Contact page**: Phone/WhatsApp numbers are placeholder "XXXXX XXXXX" in `Contact.jsx` — update with real numbers before go-live.
- **Marketplace commission**: 0.1% negotiation-first flow working in dev mode (instant payment) — needs Razorpay integration for production.
- **Deal notifications**: Polling-based (30s/15s intervals) — consider WebSocket or SSE for real-time updates in production.
- **KYC verification**: PAN-based KYC implemented (session 10). Collects PAN number, legal name, trade category, optional GST. Gates entire marketplace. Admin can still see `kycVerified` status in listing verification panel. No document upload yet (just data entry) — could add PAN card photo upload for extra verification in future.
- **Image storage for production**: Currently files saved to local `backend/uploads/` folder via multer. For production at scale, migrate to S3/Cloudinary with CDN. Local disk works fine for MVP/early launch.
- **Dispute SLA**: 48-hour resolution promise is manual (admin reviews) — needs notification to admin when dispute filed.
- **Analytics layer**: Built (session 12) — Pro-tier analytics dashboard with recharts. Hindi toggle still pending.
- **Legacy components**: Removed (session 12) — CitySelector, MetalCard, RateTable, LMERatesPanel deleted.
- **Unused dependencies**: `ioredis` removed (session 12).
- **Google OAuth**: Plug-and-play but shows greyed "Soon" when `GOOGLE_CLIENT_ID` not set.
- **SMS OTP**: **DONE (session 17+18)** — Firebase Phone Auth sends real 6-digit SMS. No DLT registration needed. Login pre-checks phone existence before sending OTP. `loginOnly: true` prevents silent account creation from login page. Requires ngrok for local testing (see ngrok section in session 18).
- **ngrok for dev**: Must run `ngrok http 5173` before testing phone OTP locally. Authorized domain already added to Firebase Console. Vite config has `allowedHosts` + `/uploads` proxy.
- **Subscription lookup**: Currently env-var based (`PRO_EMAILS`). Needs real subscription table + Razorpay webhook when payments go live.

## Session 11 Changes (2026-04-11) — Full Detail

### Email Verification — Fully Working End-to-End

**Bugs fixed in this session:**

1. **Blank /verify-email page** — `status === 'pending'` block referenced undefined `message` variable instead of `resendError`. Fixed by replacing `{message && ...}` with `{resendError && ...}`.

2. **StrictMode double-fire bug (critical)** — React StrictMode runs effects twice in dev. First run consumed the token from DB (set `emailVerifyToken: null`, `emailVerified: true`). Second run found no token → showed "Link expired or already used" even though verification succeeded. Fixed with a `verifiedRef = useRef(false)` guard that aborts on the second invocation.

3. **refreshUser() silently causing error state** — If `refreshUser()` threw (e.g. user not logged in when clicking link from email), the `.catch()` block fired and showed error state despite successful backend verification. Fixed by wrapping `refreshUser()` in its own try/catch: `try { if (refreshUser) await refreshUser(); } catch (_) {}`.

4. **Amber banner showing even after verification** — Login endpoint returned `emailVerified` at the top level of the response (`{ token, user: {...}, emailVerified: true }`) instead of inside the `user` object. `AuthContext` stored the user without `emailVerified`, so `user.emailVerified` was always `undefined`. Banner checked `!user.emailVerified` which was always truthy. **Two fixes**: (a) moved `emailVerified` inside `user` object in login response; (b) changed banner guard to `user.emailVerified !== false` (explicit false check, not falsy).

5. **Resend error message unhelpful** — When Resend API failed (e.g. sandbox can only send to registered account email), backend catch block returned generic "Failed to resend verification email". Fixed by wrapping `sendVerificationEmail()` in its own try/catch in the resend endpoint, returning the actual Resend error + explanation about sandbox limitation.

6. **60-second resend cooldown + timer** — Added countdown timer on resend button (both on `/verify-email` page and in the amber banner). Backend enforces 60-second rate limit using `emailVerifyExpiry` timestamp.

7. **"Skip for now" removed** — Email verification is now mandatory. Skip button removed from VerifyEmail.jsx.

8. **Post-login redirect to /verify-email** — Login.jsx now redirects to `/verify-email` if `emailVerified === false` instead of going to home.

### Password Complexity Rules
- Minimum 8 characters + at least 1 number or special character (`!@#$%^&*` etc.)
- Applied consistently in: `Signup.jsx` (frontend), `ResetPassword.jsx` (frontend), `backend /register`, `backend /reset-password`
- Placeholder text updated: "Min 8 chars, include a number or symbol"
- ResetPassword strength meter updated: `< 8 chars` = "Too short", no number/symbol = "Weak"

### EmailVerifyBanner in App.jsx
- Persistent amber banner between Navbar and content for unverified users
- Shows on all pages except: `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`
- Contains: email address, "Verify Now →" button (navigates to `/verify-email`), inline resend button with 60s cooldown
- Only renders when `user.emailVerified === false` (explicit check — won't show for users without the field)

### Resend Sandbox Limitation (Important)
- Resend free tier with `onboarding@resend.dev` can ONLY send to the email registered on your Resend account
- To send to any email → add a domain at resend.com/domains (takes ~5 min)
- Production: set `EMAIL_FROM="BhavX <noreply@bhavx.com>"` after domain verification at resend.com

### Files Modified (Session 11)
- `frontend/src/pages/VerifyEmail.jsx` — StrictMode guard (`verifiedRef`), refreshUser try/catch, `resendError` fix, cooldown timer, removed Skip button
- `frontend/src/App.jsx` — `EmailVerifyBanner` component added to AppShell, `emailVerified !== false` guard
- `frontend/src/pages/Login.jsx` — redirect to `/verify-email` when `emailVerified === false`
- `frontend/src/pages/Signup.jsx` — password complexity validation (8 chars + number/symbol)
- `frontend/src/pages/ResetPassword.jsx` — password complexity validation + strength meter update
- `backend/src/routes/auth.js` — `emailVerified` moved inside `user` object on login response; resend endpoint wraps email send in own try/catch with helpful error; password complexity on `/register` and `/reset-password`; 60-second resend rate limit

---

## Session 9 Changes (2026-03-22) — Full Detail

### OTP Phone Normalization Fix
- **Problem**: OTP "Failed to send" error — phone regex `^\+?[6-9]\d{9}$` too strict for `+91 98765 43210` format
- **Solution**: Added `normalizePhone()` helper function in `auth.js`:
  ```js
  function normalizePhone(raw) {
    if (!raw) return null;
    let p = raw.replace(/[\s\-()]/g, '');
    if (p.startsWith('+91')) p = p.slice(3);
    else if (p.startsWith('91') && p.length === 12) p = p.slice(2);
    return /^[6-9]\d{9}$/.test(p) ? p : null;
  }
  ```
- Applied across all 4 auth endpoints: `request-otp`, `verify-otp`, `register`, `profile`
- Frontend also normalizes phone before sending OTP

### Trader Type Multi-Select
- **Problem**: "Buyer & Seller" option was redundant; user couldn't select multiple roles
- **Solution**: Removed "Buyer & Seller" from options. Changed to 3-option multi-select with checkmarks:
  - Buyer / Seller / Just Checking
  - Users can select any combination (e.g., Buyer ✓ + Seller ✓)
  - On submit: `BUYER+SELLER` maps to `BOTH` enum for DB compatibility
- Updated across **Signup.jsx**, **Login.jsx** (OTP flow), **Profile.jsx**
- State changed from `traderType` (string) to `traderTypes` (array)

### Make Offer — Quantity Read-Only
- **Problem**: Buyer could edit quantity in Make Offer modal, but qty should come from listing
- **Solution**: Removed qty input from OfferModal. Shows "Quantity: 2,000 kg (as listed by seller)" as read-only text. Only price is editable by buyer.
- Counter-offer still allows qty editing (seller can adjust terms during negotiation)

### Browse Tab Login Prompt
- **Problem**: Logged-out users saw "No listings found" on Browse tab
- **Solution**: Shows styled "Browse Scrap Metal Listings" prompt with "Sign Up Free" + "Login" buttons when not authenticated

### File Upload for Photos/Videos (multer)
- **Problem**: Users had to paste image URLs from Imgur/Google Drive — bad UX for traders
- **Solution**: Direct file upload via `multer` to `backend/uploads/` folder
- **Backend**: `POST /api/marketplace/upload` — accepts up to 5 files (5MB each)
  - Allowed formats: jpg, jpeg, png, gif, webp, mp4, mov, webm
  - Files saved with unique names: `{timestamp}-{randomhex}.{ext}`
  - Returns array of `/uploads/{filename}` paths
  - Files served via `express.static('/uploads', ...)`
- **Frontend PostForm**: Replaced URL paste input with drag-and-drop file picker
  - Camera icon + "Add Photos" label
  - Preview thumbnails with remove button
  - Video file support (shows `<video>` tag)
  - Upload progress indicator
- **Listing cards**: Image URLs prefixed with backend URL for `/uploads/` paths
- **Schema unchanged**: `images` field still stores JSON array of paths in `@db.Text`

### Admin User with Full Access
- Created `admin@metalxpress.in` / `admin1234` with:
  - `phoneVerified: true`, `kycVerified: true`, `traderType: BOTH`
  - Added to `PRO_EMAILS` env var for full pro subscription access
- Added to `seed.js` for future re-seeds
- `PRO_EMAILS="test@metalxpress.in,admin@metalxpress.in"` in `.env`

### Dependencies Added
- `multer` — file upload middleware for Express

### Files Modified
- `backend/src/routes/auth.js` — `normalizePhone()` helper, applied to all endpoints
- `backend/src/routes/marketplace.js` — multer upload endpoint, file filter
- `backend/src/index.js` — `express.static('/uploads')`, `path` import
- `backend/src/prisma/seed.js` — admin user, phoneVerified flags
- `backend/package.json` — multer dependency
- `frontend/src/pages/Signup.jsx` — multi-select trader type, phone normalization
- `frontend/src/pages/Login.jsx` — multi-select trader type in OTP flow
- `frontend/src/pages/Profile.jsx` — multi-select trader type, BOTH↔array mapping
- `frontend/src/pages/Marketplace.jsx` — file upload PostForm, read-only qty, browse login prompt
- `frontend/src/utils/api.js` — `uploadMedia()` function

## Session 7 Changes (2026-03-21) — Full Detail

### Negotiation-First Deal Flow (Marketplace Redesign)
- **Problem**: Paying 0.1% commission just for a phone number has no moat — phone numbers are freely available in this industry
- **Solution**: Negotiation happens BEFORE payment. Commission is only charged after both parties agree on price+qty
- **Deal status flow**: `negotiating → agreed → paid → connected → completed` (also: `cancelled`, `expired`)
- **Commission calculation**: 0.1% of agreed deal value (`agreedPrice × agreedQty × 0.001`), NOT listing price
- **Lazy deal expiry**: Deals with no activity for 7 days auto-expire, checked on access (no cron needed)

### Prisma Schema Changes
- **New `Offer` model**: `id, dealId, fromUserId, pricePerKg, qty, message, status, createdAt`
- **Modified `Deal` model**: Added `sellerId`, `agreedPrice`, `agreedQty`, `lastOfferAt`, `expiresAt`; `dealAmount`/`commission` changed to `Float?` (nullable, set only on agreement); status default changed to `"negotiating"`
- **User relations**: Split from single `deals Deal[]` to `buyerDeals @relation("BuyerDeals")` + `sellerDeals @relation("SellerDeals")` + `offers Offer[]`

### Backend — marketplace.js New Endpoints
- **POST `/deals`**: Buyer makes initial offer (creates Deal + first Offer, checks no existing active negotiation)
- **POST `/deals/:id/counter`**: Counter-offer (validates it's other party's turn, marks previous as "countered")
- **POST `/deals/:id/accept`**: Accept last offer (calculates commission, sets deal to "agreed")
- **POST `/deals/:id/reject`**: Cancel negotiation
- **POST `/deals/:id/pay`**: Pay commission (status must be "agreed" — dev mode: instant)
- **PATCH `/deals/:id/complete`**: Either party can mark deal as completed
- **GET `/deals/:id`**: Full deal detail with offers; strips contacts unless `connected`/`completed`
- **GET `/my-deals`**: All deals as buyer OR seller, with role flag and unread indicator
- **GET `/notifications`**: Lightweight poll for pending offers count
- **GET `/pending`**: Admin endpoint — fetch listings pending verification
- **Helper**: `expireStaleDeals()` lazy-expires deals with no activity for 7 days

### Frontend — Marketplace.jsx (Complete Rewrite, 815 lines)
- **4 tabs**: Browse, Sell Scrap, My Listings, My Deals (last two: logged-in only)
- **OfferModal**: Listing summary, price/qty inputs (pre-filled from listing), message field, commission preview with "only charged after both agree" note
- **DealDetailPanel**: Full-screen overlay with chat-style offer history (buyer right, seller left), status badge, action bar adapts per state:
  - Negotiating: Accept / Counter / Reject buttons
  - Agreed: Pay Commission button with amount breakdown
  - Connected: Contact info revealed + Mark Complete
- **MyDealsTab**: Deal cards with status badges, "NEW" indicator for unread offers, auto-refresh every 30s
- **MyListingsTab**: Delete button per listing with confirmation, status badges (Pending/Verified/Rejected)
- **Polling**: My Deals tab polls every 30s, Deal Detail auto-refreshes every 15s

### Profile Page (New — `/profile`)
- Subscription status card (Pro Plan green / Free Plan gold)
- Personal info form: name, email, phone, city
- Trader type selector: 2×2 grid (Buyer / Seller / Buyer & Seller / Just Checking Rates)
- Save Changes → PATCH `/api/auth/profile`
- Sign Out button
- Auth loading check prevents redirect race condition

### Admin Marketplace Panel
- Admin.jsx now has tabbed layout: "Rate Management" (existing parser) + "Marketplace" (new)
- MarketplaceAdmin component: fetches pending listings, shows verify/reject buttons per listing
- Each pending listing shows: metal, grade, qty, location, price, description, seller name + phone

### Auth Linking (Point 4)
- Backend PATCH `/api/auth/profile` already handles phone+email linking with uniqueness validation
- Profile page allows users to add/update phone or email to their existing account
- No backend changes needed — existing logic sufficient

### Navbar Update
- Username now links to `/profile` page

## Session 8 Changes (2026-03-21) — Full Detail

### Auth Unification — Email + Phone Required at Signup
- **Problem**: Users could create duplicate accounts via email-only and phone-only signup
- **Solution**: Signup now requires BOTH email AND phone, with mandatory OTP verification
- **Two-step flow**: Step 1 (details: name, email, phone, password, trader type) → Step 2 (OTP verification)
- **Backend `/register`**: Now requires `otp` field — verifies OTP before creating account, returns error if missing
- **Signup.jsx rewrite**: Two-step form with step indicator, edit button to go back, resend OTP timer
- **Login unchanged**: Still supports email+password OR phone OTP for returning users

### Deal Dispute/Cancellation Protection
- **Problem**: After paying commission and getting contacts, parties could do the deal outside the app and claim "deal cancelled"
- **Solution**: Escrow-style dispute mechanism with admin resolution
- **New deal status**: `disputed` — commission held in escrow until admin resolves
- **Schema fields**: `disputeReason String? @db.Text`, `disputedAt DateTime?` on Deal model
- **Backend endpoints**:
  - `POST /deals/:id/dispute` — either party can raise dispute on connected/completed deals (requires 10+ char reason)
  - `GET /marketplace/disputes` — admin endpoint, lists all disputed deals with full party details
  - `PATCH /deals/:id/resolve-dispute` — admin resolves: `refund` (cancel + refund commission), `completed` (force complete), `cancelled`
- **Frontend**: "Report Issue / Raise Dispute" button on connected deals, textarea for reason, escrow messaging
- **Disputed state display**: Red banner showing dispute reason and "reviewing within 48 hours" message

### Image Support for Listings
- **Schema**: `images String? @db.Text` — JSON array of image URLs (max 5)
- **Backend**: POST `/listings` accepts `images` array, validates max 5, stores as JSON string
- **Browse response**: `imageUrls` field parsed from JSON and returned alongside listing data
- **Listing cards**: Show up to 3 thumbnail images (72x72) with "+N" overflow indicator
- **PostForm**: Image URL input with Add button, enter-to-add, preview thumbnails, remove buttons
- **Note**: Uses URL-based images (paste from Google Drive/Imgur) — file upload to S3 is Phase 3

### Admin Detailed Listing Verification
- **Problem**: Basic approve/reject buttons with minimal info — admin couldn't make informed decisions
- **Solution**: Expandable card with full listing details, seller profile, photos, and verification checklist
- **Expandable cards**: Click to expand detailed view, chevron rotation animation
- **Sections in expanded view**:
  1. **Photos**: Scrollable image gallery with click-to-open-in-new-tab
  2. **Listing Details**: Key-value pairs (metal, grade, qty, price, total value, location, contact, posted date, description)
  3. **Seller Profile**: Name, phone, email, city, trader type, phone verified, KYC verified status
  4. **Verification Checklist**: 6 checks with ✓/○ indicators (phone verified, KYC, photos, description, price set, account age)
- **Pending endpoint enhanced**: Now returns full user profile (`kycVerified`, `phoneVerified`, `city`, `traderType`, `createdAt`)

### Admin Disputes Tab
- **New tab**: "Disputes" in admin navigation alongside "Rate Management" and "Listings"
- **Dispute cards**: Show deal metal/grade, agreed terms, buyer+seller contact details, financials (deal amount, commission, paid date)
- **Dispute reason**: Highlighted red box with quoted text and filing date
- **Resolution buttons**: "Refund & Cancel", "Mark Completed", "Cancel" — admin picks appropriate resolution

### Alerts Dropdown Fix
- **Problem**: Browser `<option>` elements don't inherit dark theme — showed white text on white/system background
- **Fix**: Added explicit `style={{ background: '#0D1420', color: '#fff' }}` to all `<select>` and `<option>` elements in Alerts.jsx

### Listing Deletion Cross-Tab Refresh
- **Problem**: Deleting listing from "My Listings" tab didn't update Browse tab listing cache
- **Fix**: `MyListingsTab` now accepts `onBrowseRefresh` callback prop, calls it after successful deletion

### Counter-Offer UX Improvements
- Added labels ("Price (₹/kg) *" and "Quantity (kg)") to counter-offer form inputs
- Pre-filled placeholders from last offer values
- Live deal value + commission preview below inputs
- Instructional text: "Edit both price and quantity to counter-offer"

## Session 10 Changes (2026-03-22) — Full Detail

### Lightbox Gallery for Listing Images/Videos
- **New `Lightbox` component** in `Marketplace.jsx`: full-screen dark overlay, ← → arrow navigation, keyboard support (ArrowLeft/Right/Escape), thumbnail strip at bottom (gold border on active, Play icon for video), counter "N / total" top-center
- **Video autoplay** with full browser controls in lightbox
- **ListingCard updated**: thumbnails now clickable (opens lightbox at clicked index), shows up to 4 thumbnails, "+N" on 4th if more
- Imported `ChevronLeft`, `ZoomIn`, `Play` from lucide-react

### Real Scrap Metal Photos & Videos — Local Serving
- **Problem**: Pexels CDN URLs blocked hotlinks in browser (Referer check)
- **Fix**: All seed images switched from `https://images.pexels.com/...` to local `/uploads/seed-*.jpg` paths
- **11 photos downloaded** to `backend/uploads/` (seed-scrap-yard-1/2/3, seed-metal-wire-1, seed-metal-ingot-1, seed-metal-pile-1, seed-metal-texture-1, seed-metal-scrap-2/3, seed-metal-recycle-1, seed-metal-factory-1)
- **2 videos downloaded** to `backend/uploads/`:
  - `seed-scrap-metal-recycle.webm` — 19.9MB scrap metal recycling footage (Wikimedia CC)
  - `seed-copper-pipe.webm` — 4.9MB copper conductivity demo (Wikimedia CC)
- **Seed.js updated**: `IMG` object maps descriptive keys to `/uploads/seed-*.jpg`; `VID` object maps to `/uploads/seed-*.webm`; each listing has appropriate metal-matched photos
- **Cloud deployment note**: Copy `backend/uploads/` to server, OR migrate to Cloudinary (change multer config only — paths in DB stay same format)

### Minimum 4 Media Required for Listings
- `PostForm` in Marketplace.jsx: requires at least 4 photos/videos before submitting
- Shows `{imageUrls.length}/4 minimum` counter (amber < 4, green ≥ 4)
- Submit button disabled with message "Add at least 4 photos/videos" until met
- Instructional text: "Upload at least 4 clear photos or a video to help buyers verify quality"

### "Just Checking" Trader Type Gate on Marketplace
- `JustCheckingGate` component: lock icon + explanation + "Update My Profile" button → `/profile`
- Shows on Browse tab if `user.traderType === 'CHECKING_RATES'`
- Shows on Sell Scrap tab if `user.traderType === 'CHECKING_RATES'`
- Logged-out users see existing `LoginPrompt` (unchanged)

### Explicit T&C Acceptance on Offer + Listing
- **OfferModal**: `termsChecked` state + checkbox with links to Terms, commission policy, refund policy. Submit disabled until checked.
- **PostForm**: `termsChecked` state + checkbox with links to Terms and dispute policy. Submit disabled until checked AND ≥4 media.
- Both use inline links to specific anchor sections (`/terms#commission`, `/terms#refund-policy`, `/terms#dispute`)

### KYC System — Full Implementation
**Schema changes** (schema.prisma):
- Added `businessName String?` to User model
- Added `tradeCategory String?` to User model
- DB pushed: `npx prisma db push` ✓

**3-step Signup flow for Buyer/Seller**:
- Step 1: Details (email, password, name, phone, trader type, T&C checkbox)
- Step 2: Verify Phone (OTP)
- Step 3 (BUYER/SELLER only): Trade Profile (KYC)
  - Trade category required (dropdown: Scrap Collector/Kabadiwala, Dealer/Merchant, Factory, Recycler, Individual, Broker, Other)
  - Business/trade name optional
  - Privacy promise box prominently displayed (non-scary)
  - "Skip for now" button → logs in without kycVerified
  - Submitting → sets `kycVerified: true` via PATCH /profile `kycComplete: true`
- `CHECKING_RATES` users skip KYC step entirely

**Privacy promise** (shown on KYC step and Profile page):
> MetalXpress does NOT report any transaction data to GST, Income Tax, or any government body. This step only confirms you're a real trader — to protect the community from fraud. Your deal amounts remain strictly between you and your counterparty.

**Self-declared KYC**: No government verification. Selecting trade category + agreeing to terms = `kycVerified: true`. Admin can still revoke for fraud.

**Backend changes** (auth.js):
- GET /me: now returns `businessName`, `tradeCategory`, `termsAcceptedAt`
- PATCH /profile: accepts `businessName`, `tradeCategory`, `kycComplete` (sets `kycVerified: true`)
- POST /register: accepts `businessName`, `tradeCategory`; if `tradeCategory` provided, sets `kycVerified: true`

### Profile Page — Complete Rewrite
**Bugs fixed**:
- Save changes now calls `refreshUser()` (new AuthContext method) → UI immediately reflects updated name/email/city/etc.
- Phone change requires OTP verification: detect if phone changed → "Send OTP" button appears → verify before saving → backend validates OTP on PATCH /profile

**New AuthContext method**: `refreshUser()` — re-fetches `/api/auth/me` and updates `user` state + localStorage. Exported in context value.

**Profile page new sections**:
- KYC status banner: green "Identity Verified ✓" or amber "Verification Required" with Verify button
- KYC inline form (shown for unverified BUYER/SELLER): trade category dropdown, business name, privacy promise
- Phone change OTP flow: "Send OTP" button appears when phone edited, OTP input shown after send, validated before save
- Trade category and business name fields in personal info section

### TRADE_CATEGORIES constant
Used in both Signup.jsx and Profile.jsx:
```js
['Scrap Collector / Kabadiwala', 'Scrap Dealer / Merchant', 'Factory / Manufacturer',
 'Recycler / Smelter', 'Individual Trader', 'Broker / Agent', 'Other']
```

### Files Modified (session 10)
- `frontend/src/pages/Marketplace.jsx` — Lightbox, min 4 media, JustCheckingGate, T&C checkboxes
- `frontend/src/pages/Profile.jsx` — Complete rewrite: refreshUser, phone OTP, KYC, all fields editable
- `frontend/src/pages/Signup.jsx` — 3-step flow with KYC, TRADE_CATEGORIES, step indicator
- `frontend/src/context/AuthContext.jsx` — Added `refreshUser()` method
- `backend/src/routes/auth.js` — /me returns new fields, PATCH /profile handles kycComplete + phone OTP, POST /register handles businessName/tradeCategory
- `backend/prisma/schema.prisma` — Added `businessName String?`, `tradeCategory String?` to User
- `backend/uploads/` — 11 real scrap metal photos + 2 industrial videos (local serving)
- `backend/src/prisma/seed.js` — Updated to use local `/uploads/` paths (not CDN), proper metal-matched images per listing

## Current Status (as of 2026-04-24, session 18)
- **Auth**: Unified signup (email+phone+OTP mandatory), email+password login, phone OTP login (Firebase, real SMS), Google OAuth. Login phone flow pre-checks phone registration before spending Firebase OTP quota. `loginOnly: true` flag prevents account creation from login page.
- **ngrok**: `https://dandy-headrest-depravity.ngrok-free.dev` → localhost:5173. Required for Firebase Phone Auth in local dev. Vite config has `allowedHosts` + `/uploads` proxy.
- **Subscription**: Pro test user `test@bhavx.com` / `admin1234`, Admin user `admin@bhavx.com` / `admin1234` — pro plan via PRO_EMAILS env var. All test traders (amit, rajesh, suresh, vikram @test.com) also in PRO_EMAILS.
- **Landing**: Hero section for non-logged-in users with feature cards and CTAs
- **Paywall**: Local rates blurred/gated for non-subscribers with "Sign Up" or "Upgrade to Pro" overlay
- **Marketplace**: Negotiation-first deal flow, 0.1% commission on agreed value, chat-style offer thread, direct file upload for photos/videos (multer → local disk), dispute/escrow mechanism, 4-tab UI. **KYC gate blocks entire marketplace** (browse/post/deals) for unverified users. Minimum 4 media required to post. Explicit T&C acceptance on both offer-making and listing. Lightbox gallery (click thumbnail → full-screen with nav arrows + thumbnail strip + video autoplay — renders outside hover div to prevent flicker). Seed listings use local `/uploads/` photos+videos served via Vite proxy (works on ngrok). "Make Offer" duplicate-deal bug fixed. Browse tab hides user's own listings. My Listings shows deal status pill badges.
- **Disputes**: Full dispute lifecycle — raise dispute → admin reviews → refund/complete/cancel resolution
- **Profile**: Save refreshes AuthContext via `refreshUser()`, phone change requires OTP verification, KYC status banner, inline PAN-based KYC form (always visible when needed, no toggle button). Dedicated `handleVerify` for KYC. Save Changes button disabled when form is clean (dirty-state tracking via `origValues`).
- **KYC**: PAN-based identity verification. Collects: PAN Card Number (required, format validated), Legal Name as on PAN (required), Trade Category (required), Business Name (optional), GSTIN (optional, format validated). Gates entire marketplace access. 3-step signup for Buyer/Seller (Details → OTP → KYC). Privacy messaging: "bank-grade encryption, solely for trader verification, never shared with external parties" — NO mention of government/tax/GST/Income Tax. Can skip during signup and verify later from Profile page.
- **Admin**: 3-tab admin (Rate Management / Listings / Disputes), detailed listing verification with seller profile + KYC checklist, dispute resolution panel
- **Accordion**: All metals default-open, per-metal collapse, Expand/Collapse All button
- **Footer**: Company + Legal links on all consumer pages
- **Static pages**: About, Terms, Privacy, Contact — all styled in dark navy glass theme
- Live data: Yahoo Finance + Stooq + DB fallback (Lead, Tin)
- LME admin paste cutoff: 15 minutes
- Admin: Single unified smart parser — auto-detects message type
- metals-api.com: plug-and-play (set METALS_API_KEY in .env to activate)
- Google OAuth: plug-and-play (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)
- File uploads: multer → `backend/uploads/` folder, served via express.static
- **Analytics**: Pro-tier analytics dashboard at `/analytics` with recharts — LME/MCX price trend charts (area + line), metal selector pills, period filters (7d/30d/90d), stat cards (GMV, deals, users, close rate), listings-by-metal pie chart, all-time high/low table, live price snapshot. Backend API: `/api/analytics/overview`, `/api/analytics/price-history`, `/api/analytics/local-history`.
- **Email verification**: Fully working — verification link survives repeat clicks (token kept in DB), amber banner on all pages for unverified users, 60-second resend cooldown, mandatory (no skip), login redirects to `/verify-email` if unverified.
- **Legacy cleanup**: Removed unused components (CitySelector, MetalCard, RateTable, LMERatesPanel) and `ioredis` dependency.
- **Mobile responsive**: Fixed grid layouts (Marketplace listings, trader type selectors, PostForm, filters) to collapse properly on 320px screens.

## Live Data Sources
### Metals (backend/src/services/livePriceFetcher.js)
| Metal     | Source        | Symbol  | Unit → conversion                                    |
|-----------|---------------|---------|------------------------------------------------------|
| Copper    | Yahoo Finance | HG=F    | USD/lb × 2204.62                                     |
| Aluminium | Yahoo Finance | ALI=F   | USD/MT direct                                        |
| Zinc      | Yahoo Finance | ZNC=F   | USD/MT direct                                        |
| Nickel    | Stooq         | NI.F    | ¢/lb × 22.0462 (case-sensitive — must be UPPERCASE)  |
| Lead      | DB fallback   | —       | LMERate table, last admin-pasted value ≤7 days old   |
| Tin       | DB fallback   | —       | LMERate table, last admin-pasted value ≤7 days old   |

**Note**: Lead `PB.F` and Tin `SN.F` return N/D on Stooq — no free live source exists.
They are served from the last admin WhatsApp-pasted LME value in the `LMERate` DB table (7-day window).
When `METALS_API_KEY` is set, metals-api.com takes priority and covers all 6 metals.

### Data Priority in /api/rates/live
1. **metals-api.com** (if `METALS_API_KEY` set) — all 6 metals, hourly cache
2. **Admin-pasted LME** (from DB, ≤15m old) — overrides Yahoo for LME
3. **Yahoo Finance / Stooq** — live fallback for Copper, Aluminium, Zinc, Nickel
4. **DB fallback** — Lead, Tin from last admin paste (≤7d)

Admin-pasted MCX and Forex override Yahoo when ≤10 minutes old.

### metals-api.com (optional upgrade)
Set `METALS_API_KEY` in `backend/.env`. Symbols: XCU, ALU, XNI, XPB, XZN, XSN
Returns price per troy oz in USD. 1 MT = 32150.75 troy oz.
API cost: Free (50 req/month), $15/month Starter (500 req), $99/month Business.

### Forex & Indices (Yahoo Finance)
USD/INR: USDINR=X | EUR/USD: EURUSD=X | Nifty: ^NSEI | Sensex: ^BSESN | Crude WTI: CL=F

## Return Shape of /api/rates/live
```js
{
  metals:  [{ metal, priceUsd, priceMcx, change, source }],
  // change is PERCENTAGE (%), not absolute. Always use absToChangePct() before returning.
  forex:   { usdInr, eurUsd, usdInrChange, eurUsdChange },
  indices: { nifty, sensex, niftyChange, sensexChange },
  crude:   { price, change },
  usdInr,          // root-level alias for MCX conversion convenience
  fetchedAt,       // ISO timestamp
  lmeUpdatedAt,    // ISO — when LME data was last updated (Yahoo fetch or admin paste)
  forexUpdatedAt,  // ISO — when forex was last updated (admin paste only, else null)
}
```

**Breaking change from old shape**: `d.rates` is now `d.metals` in all frontend code.

## Return Shape of /api/rates/local
```js
{
  hub: { id, name, slug, city: { id, name } },
  metals: [
    {
      metal: { id, name, emoji, colorHex },
      rates: [
        {
          grade: { id, name, hasVariants, variantLabel },
          buyPrice, sellPrice, variantPrice, variantLabel,
          updatedAt,
        }
      ]
    }
  ],
  lastUpdated,          // ISO — DB save time (server time)
  messageTimestampStr,  // string — "20 Mar, 01:45 PM" from WhatsApp rawMessage (null if unavailable)
}
```

## MCX Conversion
MCX (₹/kg) = LME_USD_per_MT × usdInr / 1000

## WhatsApp Unicode Bold Decoding — Critical Gotcha
WhatsApp broadcast messages use Mathematical Bold Unicode (codepoint range 0x1D400+). When decoded to plain text:
- `𝐂𝐂𝐑` decodes as `C C R` (space between each letter because each bold codepoint is a separate character)
- `𝐒𝐮𝐩𝐞𝐫 𝐃` decodes as `S u p e r  D`

**Fix applied**: `normGrade(s)` strips ALL non-alphanumeric chars before comparing:
```js
function normGrade(s) {
  return s.replace(/[^a-z0-9]/gi, '').toLowerCase();
}
// "C C Rod" → "ccrod" matches DB grade "CC Rod" → "ccrod" ✓
// "C C R"   → "ccr"   matches DB grade "CCR"    → "ccr"   ✓
```

## Timestamp Handling — IST Awareness
WhatsApp messages contain timestamps in IST (UTC+5:30). Two values extracted:
1. **`display`**: Raw string from message: "20 Mar, 01:45 PM" — shown directly on UI. No `Date` parsing, no timezone conversion.
2. **`iso`**: UTC-adjusted for DB storage: `Date.UTC(y,m,d,h,min,s) - (5.5 * 3600 * 1000)`.

The ⏰ emoji (U+23F0) can appear between date and time in messages. Fix: use `[^\d]+` instead of `\s+` in timestamp regex — matches any non-digit including emoji.

**Never pass `messageTimestampStr` through `new Date()` or `date-fns format()` on the frontend** — it's already a pre-formatted display string.

## File Structure
```
frontend/src/
  App.jsx                          ← AppShell (Navbar + Footer) — Admin gets no Navbar/Footer
  pages/
    Home.jsx                       ← HeroSection (non-auth) + LME/MCX table + Forex grid + city pills
                                      + LocalRatesGate (paywall) + metal accordion (closedMetals Set)
    Login.jsx                      ← Email+Password primary, Google OAuth, Phone OTP secondary
    Signup.jsx                     ← Email+password registration + Google + Phone OTP + trader type
    Marketplace.jsx                ← 4-tab UI (Browse/Sell/My Listings/My Deals), OfferModal,
                                      DealDetailPanel (chat-style negotiation), MyDealsTab, MyListingsTab
    Alerts.jsx                     ← Price alerts (basic, old style — not updated yet)
    Analytics.jsx                  ← Pro-tier analytics dashboard: LME/MCX charts, stats grid, pie chart, price extremes
    Admin.jsx                      ← Standalone layout, unified smart parser + Marketplace admin (verify/reject)
    Profile.jsx                    ← Subscription status, personal info form, trader type, save/sign-out
    About.jsx                      ← Company info, What We Do, Data Sources, Mission
    Terms.jsx                      ← Terms of Service (placeholder legal text)
    Privacy.jsx                    ← Privacy Policy (placeholder legal text)
    Contact.jsx                    ← Contact cards (Email, WhatsApp, Phone, Office) + FAQ
    ForgotPassword.jsx             ← Request password reset email
    ResetPassword.jsx              ← Token-based password reset with complexity rules
    VerifyEmail.jsx                ← Email verification flow (pending/success/error states, resend cooldown)
  components/
    Navbar.jsx                     ← Sticky glass header + LMEStrip + mobile bottom nav (5 items: Rates/Market/Analytics/Alerts/Admin)
    Footer.jsx                     ← Site-wide footer (Company + Legal links) — rendered in AppShell
    HeroSection.jsx                ← Landing hero for unauthenticated users (gold gradient + feature cards)
    LocalRatesGate.jsx             ← Blur overlay + paywall CTA for non-subscribers
    LMEStrip.jsx                   ← Marquee ticker fetching /api/rates/live (uses d.metals)
    PaywallModal.jsx               ← Free/Pro/Business plan gate, Razorpay stub
  utils/
    api.js                         ← Axios instance + all endpoints incl. registerEmail, loginEmail, checkSubscription,
                                      fetchDealDetail, counterOffer, acceptOffer, rejectDeal, fetchMyDeals,
                                      fetchDealNotifications, fetchPendingListings, verifyListing, deleteListing,
                                      uploadMedia (multer file upload)
  context/
    AuthContext.jsx                ← Email/Phone/Google auth, JWT in localStorage, subscription state

backend/src/
  index.js                         ← Express app, CORS, rate limit, cron alerts
  routes/
    rates.js                       ← GET /api/rates/live (15m LME cutoff), /local (with messageTimestampStr), POST save-parsed
                                      absToChangePct(), fxChangePct(), normGrade(), extractDisplayTs() helpers
    auth.js                        ← POST /register + /login (email+pw) + OTP + /me + PATCH /profile
                                      + GET /subscription + Google OAuth (with email dedup)
    cities.js                      ← GET /api/cities (returns plain array [{id,name,hubs:[]}])
    metals.js, alerts.js, admin.js
    analytics.js                   ← GET /api/analytics/overview, /price-history, /local-history (Pro-tier data)
    marketplace.js                 ← Full deal flow: POST /deals, /counter, /accept, /reject, /pay, /complete
                                      GET /my-deals, /notifications, /pending (admin). Lazy deal expiry.
                                      Listings: GET/POST/DELETE, PATCH verify (admin), metal name filter
  services/
    livePriceFetcher.js            ← Yahoo+Stooq+metals-api, returns {metals,forex,indices,crude,usdInr,lmeUpdatedAt,forexUpdatedAt}
    rateParser.js                  ← parseRateMessage, cleanText (exported), detectMessageType, extractMessageTimestamp
    lmeService.js, alertService.js
  middleware/
    auth.js
  prisma/
    schema.prisma                  ← User (email+passwordHash, phone), Deal (negotiation flow, sellerId,
                                      agreedPrice, commission), Offer (price, qty, message, status)
    seed.js                        ← Seeds cities, hubs, metals, grades, sample listings
                                      Grade names match actual WhatsApp messages exactly
  .env.example                     ← Full documented env var reference
```

## Key Code Patterns

### Cities API parsing
```js
// GET /api/cities returns a plain array, not {cities:[]}
const list = Array.isArray(d) ? d : (d.cities || []);
```

### Home.jsx — live data access
```js
// /api/rates/live now returns {metals, forex, indices, crude, usdInr}
// Use d.metals, NOT d.rates
const d = await (await fetch('/api/rates/live')).json();
setLiveData(d);
// Access: liveData.metals, liveData.forex.usdInr, liveData.indices.nifty, etc.
```

### Home.jsx — local rates timestamp display
```jsx
{(localRates?.messageTimestampStr || localUpdatedAt) && (
  <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
    <Clock size={10} />
    {localRates?.messageTimestampStr || format(localUpdatedAt, 'dd MMM, hh:mm a')}
  </span>
)}
// DO NOT format messageTimestampStr through date-fns — it's already a display string
```

### Home.jsx — grade price + variant display
```jsx
<div style={{ textAlign: 'right' }}>
  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
    ₹{fmt(primary)}
    {secondary && <span style={{ color: '#CFB53B' }}> / ₹{fmt(secondary)}</span>}
  </span>
  {rate.variantPrice && (
    <p style={{ fontSize: 10, fontFamily: 'monospace', margin: '2px 0 0', color: 'rgba(207,181,59,0.6)', whiteSpace: 'nowrap' }}>
      {rate.variantLabel || 'Variant'}: ₹{fmt(rate.variantPrice)}
    </p>
  )}
</div>
```

### City selection in Home.jsx
```js
// selectedCity is the full city object {id, name, hubs:[{id,slug,name}]}
// Hub slug for local rates fetch:
const hubSlug = selectedCity?.hubs?.[0]?.slug;
```

### Admin — unified smart parser save routing
```js
const type = preview?.messageType;
const canSave = preview && (
  (type === 'local-rates' && localGrades > 0 && resolvedHub) ||
  (type === 'lme-mcx'    && (lmeCount + mcxCount + fxCount) > 0) ||
  (type === 'mixed'      && (localGrades > 0 || lmeCount > 0))
);
// Save: local → POST /api/rates/save-parsed with { hubSlug, parsed }
//       lme   → POST /api/rates/save-parsed with { parsed } (no hubSlug)
//       mixed → both saves
```

### Google OAuth flow
1. User clicks "Continue with Google" → `<a href="/api/auth/google">`
2. Backend redirects to Google consent
3. Google redirects to `/api/auth/google/callback`
4. Backend exchanges code, upserts user, issues JWT
5. Redirects to `${FRONTEND_URL}/?token=<jwt>`
6. Login.jsx detects `?token=` param on mount → calls `login(token, {})` → navigate('/')

### Email+Password auth
```js
// Register
const res = await registerEmail({ email, password, name, traderType });
login(res.data.token, res.data.user);

// Login
const res = await loginEmail({ email, password });
login(res.data.token, res.data.user);
```

### OTP verification
```js
const res = await verifyOTP({ phone, otp, name, traderType, city });
const { token, user } = res.data;
login(token, user);
```

### Subscription gating (Home.jsx)
```jsx
// AuthContext provides subscription state
const { user, subscription } = useAuth();
// LocalRatesGate checks: subscription?.plan === 'pro' || 'business'
// Non-subscribers see blurred content + CTA overlay
<LocalRatesGate>{/* metal accordion */}</LocalRatesGate>
```

### Marketplace deal flow (Marketplace.jsx)
```js
// Deal status flow: negotiating → agreed → paid → connected → completed
// Commission = agreedPrice × agreedQty × 0.001 (calculated on accept)
// Buyer makes offer → seller accepts/counters/rejects
// On accept: deal status = "agreed", commission calculated
// On pay: deal status = "connected", contacts revealed
// Either party can mark "completed"

// API calls:
await createDeal({ listingId, pricePerKg, qty, message });     // initial offer
await counterOffer(dealId, { pricePerKg, qty, message });       // counter
await acceptOffer(dealId);                                       // accept last offer
await rejectDeal(dealId);                                        // cancel
await payDeal(dealId);                                           // pay commission
await completeDeal(dealId);                                      // mark done
```

### Profile page (Profile.jsx)
```js
// Uses useAuth() for user, subscription, loading state
const { user, logout, subscription, loading: authLoading } = useAuth();
// Save: PATCH /api/auth/profile with { name, email, phone, city, traderType }
await updateProfile({ name, email, phone, city, traderType });
```

### Accordion state (Home.jsx)
```js
// closedMetals is a Set — empty means all open (default)
const [closedMetals, setClosedMetals] = useState(new Set());
const isOpen = !closedMetals.has(metalName);
// Toggle: add/remove from set
```

## Monetization Model
- **Free tier**: LME/MCX live rates, Forex & Indices, Marketplace browsing
- **Pro ₹299/month**: Local spot rates for all cities, analytics, 10 contact reveals/month, unlimited alerts
- **Business ₹999/month**: Everything Pro + unlimited contacts + bulk listing + priority support
- **Marketplace commission**: 0.1% on agreed deal value (agreedPrice × agreedQty × 0.001). Negotiation happens FIRST (offer/counter-offer in-app), commission charged ONLY after both parties agree. Contact details revealed after payment. Value prop: verified counterparties, price discovery, deal history, dispute support.
- **Listing verification**: Admin verifies listings via PATCH `/api/marketplace/listings/:id/verify`. Verified listings get green badge.
- **PaywallModal**: Currently a stub — Razorpay integration pending
- **Pro test access**: Set `PRO_EMAILS=email1,email2` in backend `.env` or use default `test@metalxpress.in` / `test1234`

## API Roadmap (with costs)
| API | Purpose | Cost | Sign-up |
|-----|---------|------|---------|
| metals-api.com | Real LME spot prices | Free 50/mo, $15 Starter | https://metals-api.com |
| Yahoo Finance | Forex, Indices, fallback metals | Free (no key) | — |
| Stooq | Nickel futures | Free (no key) | — |
| MSG91 | Production SMS OTP | Pay per SMS | https://msg91.com |
| Twilio | Production SMS OTP (alt) | Pay per SMS | https://twilio.com |
| Razorpay | Payments | 2% per transaction | https://razorpay.com |
| Google Cloud | OAuth login | Free tier sufficient | https://console.cloud.google.com |

## Deployment Plan
**Option A (Recommended): Railway**
- Railway project: 1 service for backend (Node + Prisma) + PostgreSQL plugin
- Frontend: Vercel (free) with `VITE_API_URL=https://your-backend.railway.app/api`
- Or serve frontend as static from Express `app.use(express.static('dist'))`

**Option B: Single Railway service**
- Backend serves frontend build from `frontend/dist/`
- Add to `backend/src/index.js`: `app.use(express.static(path.join(__dirname, '../../frontend/dist')))`

## Feature Roadmap — Comprehensive

### Phase 1 — MVP Complete ✅ (current state)
- [x] LME/MCX/Forex live rates (Yahoo Finance + Stooq + DB fallback)
- [x] Admin WhatsApp unified smart parser (auto-detect local vs LME)
- [x] Email+password login + Phone OTP login + Google OAuth (plug-and-play)
- [x] Unified signup: email + phone + OTP verification mandatory
- [x] Marketplace: post listings, browse, negotiate (offer/counter/accept/reject)
- [x] Deal flow: negotiation → agreement → commission payment → contact reveal
- [x] Dispute/escrow mechanism for deal protection
- [x] Photo/video upload on listings (multer → local disk)
- [x] Admin: rate management + listing verification (detailed) + disputes
- [x] Price alerts (basic CRUD — no trigger mechanism yet)
- [x] Pro subscription gating (local rates, via PRO_EMAILS env var)
- [x] Profile page with multi-select trader type
- [x] KYC verification: PAN-based identity check, gates entire marketplace, integrated in signup + profile
- [x] Lightbox gallery for listing photos/videos (full-screen, keyboard nav, thumbnails)
- [x] T&C enforcement: explicit acceptance on offers, listings, and signup
- [x] Landing page with hero section + feature cards
- [x] Footer + static pages (About, Terms, Privacy, Contact)

### Phase 2 — Production Readiness (next)
**Priority: HIGH — needed before go-live**
- [ ] **Forgot Password**: Reset token generation → email with reset link → reset page. No email service configured yet.
- [ ] **Email Verification**: Send confirmation email on signup. Currently any email accepted without verification.
- [ ] **SMS OTP (production)**: Wire MSG91 or Twilio to `auth.js` request-otp endpoint. Currently hardcoded `1234` in dev. Env vars already in `.env.example` (MSG91_API_KEY, TWILIO_ACCOUNT_SID, etc.) but not integrated.
- [ ] **Contact page real numbers**: Replace placeholder "XXXXX XXXXX" in Contact.jsx with actual phone/WhatsApp numbers.
- [ ] **LMEStrip fix**: Update `d.rates` fallback to `d.metals` in Navbar's LMEStrip component.
- [ ] **Remove unused dependencies**: `ioredis` (installed but never used), legacy components (CitySelector, MetalCard, RateTable, LMERatesPanel).
- [ ] **Production deployment**: Railway backend + Vercel frontend (or single Railway service serving frontend build). PostgreSQL production DB.
- [ ] **Seed production DB**: Run seed.js, then admin pastes real WhatsApp rates per hub.
- [ ] **Environment security**: Generate unique JWT_SECRET, ADMIN_PASSWORD for production. Remove hardcoded dev OTP.

### Phase 3 — Monetization
**Priority: HIGH — revenue features**
- [ ] **Razorpay subscription integration**: Wire PaywallModal to Razorpay Checkout for Pro (₹299/mo) and Business (₹999/mo) tiers. Env vars defined (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET) but not integrated.
- [ ] **Razorpay deal commission**: Replace dev-mode instant payment in `/deals/:id/pay` with actual Razorpay payment flow. Commission amount already calculated correctly.
- [ ] **Subscription DB table**: Replace env-var PRO_EMAILS lookup with proper Subscription model + Razorpay webhook for payment confirmation.
- [ ] **PaywallModal full wiring**: Currently shows "Coming soon" alert. Wire to Razorpay Checkout flow.

### Phase 4 — Enhanced Features
**Priority: MEDIUM — post-launch improvements**
- [ ] **Price alert triggers**: Cron job (node-cron already installed) to periodically check alert thresholds + send SMS/push notifications. `alertService.js` has Twilio stub.
- [ ] **KYC enhancement**: PAN-based data entry KYC is done. Future: PAN card photo upload for extra verification, automated PAN validation via NSDL API, admin KYC review panel.
- [ ] **metals-api.com**: Set METALS_API_KEY → auto-update all 6 LME metals hourly. Currently plug-and-play in `livePriceFetcher.js`.
- [ ] **Google OAuth**: Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET → instant activation. Currently shows greyed "Soon".
- [ ] **Analytics layer**: Price charts, market analysis, trend graphs. Pro-tier feature. Not started.
- [ ] **Hindi / i18n**: Language toggle for Hindi-speaking traders. Not started.
- [ ] **Image storage upgrade**: Migrate from local `uploads/` folder to S3/Cloudinary with CDN for production at scale. Local disk works fine for MVP.

### Phase 5 — Scale & Automation
**Priority: LOW — future growth**
- [ ] **Real-time notifications**: Replace polling (30s/15s) with WebSocket or SSE for instant deal updates.
- [ ] **Dispute SLA automation**: Auto-notify admin when dispute filed. Escalation timer.
- [ ] **Separate admin app**: Decouple admin from consumer app for security.
- [ ] **Auto-rate refresh**: Background worker to auto-fetch Yahoo/Stooq rates without admin paste.
- [ ] **Multi-city expansion**: Automated hub onboarding, admin per city.
- [ ] **Mobile app**: React Native wrapper or PWA for app store presence.

## Tracked Roadmap — Capital & Launch Checklist
> Last updated: 2026-04-09. Update status as tasks complete: [ ] pending → [x] done

### 🚀 Phase 1 — Before First Real Users (Deploy + Go Live)
- [ ] **Deploy backend → Railway** (Node + PostgreSQL plugin, set DATABASE_URL)
- [ ] **Deploy frontend → Vercel** (free tier, set VITE_API_URL to Railway backend)
- [ ] **Production env vars** — unique JWT_SECRET, ADMIN_PASSWORD, DATABASE_URL
- [ ] **Run seed on prod DB** + admin pastes first real WhatsApp rate broadcast
- [ ] **SMS OTP (MSG91)** — sign up at msg91.com, wire MSG91_API_KEY into auth.js (10 lines), remove dev OTP `1234`
- [ ] **LMEStrip fix** — update `d.rates` → `d.metals` in Navbar's LMEStrip component
- [ ] **Contact page real numbers** — replace placeholder XXXXX XXXXX in Contact.jsx
- [ ] **Cloudinary image storage** — migrate from local `backend/uploads/` (local disk wiped on Railway redeploy)
- [x] **Forgot password flow** — Resend.com + reset token + reset page (done session 11)

### 💰 Phase 2 — Before First Paying Users (Revenue)
- [ ] **Razorpay Pro subscription** — wire PaywallModal (₹299/mo) to Razorpay Checkout
- [ ] **Razorpay deal commission** — replace dev-mode instant pay in `/deals/:id/pay` with real Razorpay flow
- [ ] **Subscription DB model** — replace PRO_EMAILS env var hack with proper Subscription table + Razorpay webhook
- [ ] **Price alert triggers** — cron job (node-cron installed) checks thresholds every 15min, sends SMS via MSG91
- [x] **Email verification on signup** — Resend.com, send confirm email, amber banner, mandatory (done session 11)

### 📈 Phase 3 — Growth Features (Post-Launch)
- [x] **Analytics dashboard (Pro)** — price trend charts, marketplace GMV, volume by metal (done session 12)
- [ ] **Google OAuth** — just needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env (fully coded)
- [ ] **metals-api.com real LME prices** — just needs METALS_API_KEY in .env (fully coded, auto-activates)
- [ ] **Hindi language toggle** — major unlock for tier-2/3 city traders (real TAM)
- [ ] **WebSocket/SSE** — replace 30s polling with real-time deal notifications
- [ ] **KYC document upload** — PAN card photo upload for extra verification layer
- [ ] **Dispute SLA automation** — auto-notify admin on dispute filed, escalation timer

### 🧹 Phase 4 — Cleanup (Before Hiring Engineers)
- [ ] **TypeScript migration** — add TS to frontend for team scalability
- [x] **Remove unused deps** — `ioredis` removed (session 12)
- [x] **Remove legacy components** — CitySelector, MetalCard, RateTable, LMERatesPanel deleted (session 12)
- [ ] **Separate admin app** — decouple admin from consumer app for security

### ✅ Completed
- [x] Live LME/MCX/Forex rates (Yahoo + Stooq, no paid API needed)
- [x] WhatsApp broadcast → instant web update (unified smart parser)
- [x] Full B2B marketplace — negotiation + commission + dispute/escrow
- [x] PAN-based KYC verification gates entire marketplace
- [x] Photo/video upload (multer → local disk), Lightbox gallery
- [x] Pro subscription paywall gate (local rates blur)
- [x] Auth — email+password, phone OTP, Google OAuth stub
- [x] Unified signup (email + phone + OTP mandatory)
- [x] Deal flow — offer → counter → accept → pay → connect → complete
- [x] Admin panel — rate management + listing verification + disputes
- [x] T&C enforcement on offers, listings, signup
- [x] Profile page — editable, phone OTP change, KYC inline
- [x] Footer + static pages (About, Terms, Privacy, Contact)
- [x] Mobile-first dark navy glass design

---

## Analytics Feature List (Phase 3 — Pro Tier)

### Price Analytics
- **Price trend chart** — 7d/30d/90d line chart per metal (Copper, Brass, Aluminium etc.)
- **LME vs MCX spread** — shows import parity gap, useful for traders deciding buy/sell timing
- **Local vs LME basis** — how much Delhi Mandoli trades above/below LME benchmark
- **Price velocity** — rate of change (is copper rising fast or slow this week?)
- **All-time high/low** — since MetalXpress started tracking

### Marketplace Analytics
- **GMV tracker** — total value of deals closed on platform (₹ crore)
- **Volume by metal** — which metals are most traded (pie/bar chart)
- **Active listings count** — live supply/demand indicator
- **Average deal size** — per metal, per city
- **Deal close rate** — % of offers that convert to completed deals

### Market Intelligence (Business tier)
- **City price comparison** — Delhi vs Mumbai vs Chennai for same metal
- **Seasonal patterns** — historical price patterns by month
- **Buyer/Seller ratio** — demand signal per metal
- **Top traded grades** — e.g. CC Rod vs CCR vs Armature Bhatti

---

## Comprehensive TODO List — All Pending Items

### Critical (before go-live)
1. Forgot password flow (reset email + token + page)
2. Email verification on signup
3. SMS OTP production integration (MSG91/Twilio)
4. Real contact numbers on Contact page
5. LMEStrip `d.rates` → `d.metals` fix
6. Production env vars (JWT_SECRET, ADMIN_PASSWORD, etc.)
7. Deploy to Railway/Vercel

### Important (before first paying users)
8. Razorpay subscription payments (Pro/Business tiers)
9. Razorpay deal commission payments
10. Subscription DB model (replace PRO_EMAILS env var)
11. PaywallModal wired to Razorpay Checkout

### Nice-to-have (post-launch)
12. Price alert cron trigger + SMS notifications
13. KYC document upload + admin verification
14. Google OAuth activation (just needs env vars)
15. metals-api.com activation (just needs env var)
16. Analytics/charts for Pro users
17. Hindi language toggle
18. S3/Cloudinary image migration
19. WebSocket/SSE real-time notifications
20. Remove ioredis + legacy components
21. Dispute SLA automation + admin notifications

### Env Vars Reference (all optional integrations)
| Env Var | Integration | Status | Cost |
|---------|------------|--------|------|
| `METALS_API_KEY` | metals-api.com LME prices | Plug-and-play | Free 50/mo, $15/mo Starter |
| `GOOGLE_CLIENT_ID` + `SECRET` | Google OAuth login | Plug-and-play | Free |
| `MSG91_API_KEY` + `TEMPLATE_ID` | SMS OTP | NOT wired | Pay per SMS |
| `TWILIO_ACCOUNT_SID` + `TOKEN` + `PHONE` | SMS OTP + alerts | NOT wired | Pay per SMS |
| `RAZORPAY_KEY_ID` + `SECRET` + `WEBHOOK` | Payments | NOT wired | 2% per txn |
| `PRO_EMAILS` | Pro subscription override | Working | Free (dev shortcut) |

## WhatsApp Message Format (standard admin input)

### LME/MCX Broadcast
```
𝗠𝗘𝗧𝗔𝗟 𝗦𝗧𝗘𝗘𝗟 𝗫𝗣𝗥𝗘𝗦𝗦 𝟮.𝟬🔥
16-03-26 ⏰ 03:29:51 PM
━━━━━━━━━━━━━━━━━━
🌐 𝐋𝐌𝐄 𝐑𝐀𝐓𝐄𝐒 ($/𝐌𝐓)
━━━━━━━━━━━━━━━━━━
🥇 Copper: 12746.5 (−100)
🥈 Aluminium: 3414.5 (+41)
⚡ Nickel: 17245 (−196)
⚫ Lead: 1886.5 (−46)
🔵 Zinc: 3270 (−33)
⚡ Tin: 47770 (+30)
━━━━━━━━━━━━━━━━━━
🇮🇳 𝐌𝐂𝐗 𝐑𝐀𝐓𝐄𝐒 (₹/𝐊𝐠)
━━━━━━━━━━━━━━━━━━
🥇 Copper: 1172.65 (−14.75)
...
💱 𝐅𝐎𝐑𝐄𝐗 & 📊 𝐈𝐍𝐃𝐈𝐂𝐄𝐒
━━━━━━━━━━━━━━━━━━
💱 USD/INR: 92.409 (−0.101)
...
```

### Local Spot Rates (city hub)
```
𝗠𝗘𝗧𝗔𝗟 𝗦𝗧𝗘𝗘𝗟 𝗫𝗣𝗥𝗘𝗦𝗦 𝟮.𝟬🔥
20-03-26 ⏰ 01:45:34 PM
━━━━━━━━━━━━━━━━━━
📍 𝐃𝐄𝐋𝐇𝐈 - 𝐌𝐀𝐍𝐃𝐎𝐋𝐈
━━━━━━━━━━━━━━━━━━
🥇 𝐂𝐎𝐏𝐏𝐄𝐑
𝐀𝐫𝐦𝐚𝐭𝐮𝐫𝐞 𝐁𝐡𝐚𝐭𝐭𝐢: 1140 / 1230
𝐂𝐂 𝐑𝐨𝐝: 1240 / 1335
𝐂𝐂𝐑: 1223 / 1302 | 1.6MM: 1312
𝐒𝐮𝐩𝐞𝐫 𝐃: 1280 | 1.6MM: 1294
...
```

## Seed Data — Grade Names
All grade names in `seed.js` match the actual WhatsApp message format so fuzzy matching works:
| Metal | Grade | Notes |
|-------|-------|-------|
| Copper | Armature Bhatti, Armature Plant, Super D, CC Rod, CCR, Kaliya | Super D/CCR/Kaliya have variants |
| Brass | Purja, Honey, Chadri | |
| Aluminium | Rod, Ingot, Purja, Bartan, Wire Scrap | |
| Lead | Lead, Lead Hard, Battery | |
| Zinc | Slab, Dross, PMI, Kuskut, Tukdi | |
| Other | Tin, Nickel, Gun Metal | (was "Gun Metal Local" — fixed) |
| MS | Mandi Scrap, Mandi Ingot | (was "Mandi MS Scrap/Ingot" — fixed) |

## Dev Commands
```bash
# From repo root:
npm run dev:frontend   # Vite on port 5173
npm run dev:backend    # Nodemon on port 3001

# Database:
cd backend && npx prisma db push    # sync schema
cd backend && npm run seed          # seed cities/hubs/metals/grades

# Push to main:
git push origin claude/great-goldwasser:main
```

## GitHub
- Repo: `https://github.com/mridul0412/MetalXpress`
- Working branch: `claude/great-goldwasser`
- Push to main: `git push origin claude/great-goldwasser:main`

## Known Issues / Gotchas
- `@apply bg-gold` in CSS fails → use direct CSS property values (`background-color: #CFB53B`)
- `spawn npm ENOENT` on Windows → use `cmd /c npm run dev` in launch.json
- `GET /api/cities` returns plain `[]`, not `{ cities: [] }` — always use `Array.isArray(d)` check
- `PB-USD` on Yahoo Finance is Petrobras stock (Brazil oil), NOT Lead metal — confirmed no free Lead source
- Stooq returns CSV with header row starting with "Symbol" — skip those lines in parser
- metals-api.com returns rates as `1 USD = N units of metal (troy oz)` → invert to get USD/troy oz
- `ioredis` / Redis installed but unused — remove before production (`npm uninstall ioredis`)
- Admin page is standalone: NEVER render inside AppShell (no consumer Navbar)
- Home.jsx uses `d.metals` (not `d.rates`) from `/api/rates/live` — breaking change from old shape
- LMEStrip in Navbar: Fixed (session 12) — uses `d.metals` only
- WhatsApp bold Unicode: `𝐂𝐂𝐑` decodes with spaces → use `normGrade()` (strips all non-alphanumeric) for matching
- ⏰ emoji between date/time in timestamps → use `[^\d]+` not `\s+` in timestamp regex
- Admin-pasted LME change values are absolute (e.g., −100 USD/MT), NOT percentage → always use `absToChangePct()` before returning from `/live`
- `messageTimestampStr` is a pre-formatted display string (e.g., "20 Mar, 01:45 PM") — do NOT pass through `new Date()` or `date-fns` on frontend
- Shell testing Unicode on Windows: use Node.js test scripts with `\uXXXX` escapes instead of curl (curl mangles Unicode on Windows shells)
- Debug files `ali.json`, `hg.json`, `znc.json`, `backend-log.txt` in worktree root — add to `.gitignore`, do not commit
- Phone number normalization: Always use `normalizePhone()` in auth.js — handles `+91`, spaces, dashes, parentheses. Bare 10-digit `[6-9]\d{9}` stored in DB.
- Trader type enum: DB uses `TraderType` enum (BUYER/SELLER/BOTH/CHECKING_RATES). Frontend multi-select maps BUYER+SELLER → BOTH on submit. Profile page maps BOTH back to [BUYER,SELLER] array.
- Dev OTP is hardcoded `1234` — MUST replace with real SMS provider before production
- Admin password `admin123` is default — MUST change before production
- Uploaded files stored in `backend/uploads/` — this folder should be in `.gitignore` and backed up separately
- `multer` file size limit: 5MB per file, max 5 files per upload
- Image URLs in DB: `/uploads/filename.jpg` (relative). Frontend prefixes with backend URL for display.
- KYC privacy messaging: NEVER mention "government", "GST", "Income Tax", or tax authorities. Owner explicitly flagged this as making the business seem "illegitimate and fraudulent". Use: "bank-grade encryption", "solely for trader verification", "never shared with external parties".
- KYC gates entire marketplace — user must be `kycVerified: true` to browse, post, or negotiate. Old `JustCheckingGate` component removed.
- Pexels CDN images don't work as `<img src>` in browsers (hotlink blocked via Referer check). Always serve images from local `backend/uploads/` or use S3/Cloudinary.
- Seed images/videos are in `backend/uploads/seed-*` — these are local files, not URLs. If uploads folder is cleared, re-run seed script to regenerate.
- **BACKEND_URL in Marketplace.jsx**: Falls back to `''` (empty string), NOT `'http://localhost:3001'`. Empty string forces `/uploads/...` through the Vite proxy, making images work on both localhost and ngrok. If you change this to a hardcoded URL, images will break on ngrok.
- **ngrok**: Required for Firebase Phone Auth in local dev. Run `ngrok http 5173`, use the `https://dandy-headrest-depravity.ngrok-free.dev` URL. Vite already configured with `allowedHosts`. Firebase domain already authorized. Without ngrok, phone OTP will fail with "auth/unauthorized-domain".
- **Seed source field**: LME/MCX rates in seed.js use `source: 'seed'`. This prevents them from triggering the 15-minute admin-override window. If you reseed and rates stop updating from Yahoo Finance, check that seed rates use `source: 'seed'` not `'admin'`.
- PAN format validation: `/^[A-Z]{5}[0-9]{4}[A-Z]$/` (e.g. ABCDE1234F). GSTIN format: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/` (15 chars).

## Test Accounts (updated session 18)
| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `admin@bhavx.com` | `admin1234` | Admin + Pro | emailVerified + kycVerified |
| `test@bhavx.com` | `test1234` | Pro tester | emailVerified + kycVerified |
| `rajesh@test.com` | `test1234` | Seller (Delhi) | emailVerified + kycVerified, copper listings, Pro |
| `amit@test.com` | `test1234` | Buyer (Mumbai) | emailVerified + kycVerified, Pro |
| `suresh@test.com` | `test1234` | Seller (Ahmedabad) | emailVerified + kycVerified, Pro |
| `vikram@test.com` | `test1234` | Seller (Ludhiana) | emailVerified + kycVerified, Pro |
| Admin panel | `admin123` | Admin panel | x-admin-password header |
