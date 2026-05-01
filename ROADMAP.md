# BhavX — Master Roadmap & Daily Progress Tracker
> Update status as tasks complete: [ ] pending → [x] done
> Check this at the start of every session. No complacency.

---

## 🔴 CRITICAL — Before Go-Live

- [x] **Email domain on Resend** — bhavx.com verified, `EMAIL_FROM="BhavX <noreply@bhavx.com>"` set, sending to any inbox ✅ (done 2026-04-21)
- [x] **SMS OTP real integration** — Firebase Phone Auth live; real 6-digit SMS; no DLT needed; MSG91 parked ✅ (done 2026-04-21)
- [x] **Phone login UX fixes** — pre-check blocks unregistered numbers before OTP send; removed name/trader-type from login OTP screen; `loginOnly:true` prevents silent account creation ✅ (done 2026-04-24)
- [x] **Deploy backend → Railway** — Node + PostgreSQL plugin, env vars set, multi-origin CORS, prisma db push on each deploy ✅ (done 2026-04-29)
- [x] **Deploy frontend → Vercel** — `metal-xpress-three.vercel.app`, branch `main`, root dir `frontend`, all env vars baked in ✅ (done 2026-04-30)
- [x] **Production env vars** — strong JWT_SECRET (64 hex), ADMIN_PASSWORD (20 chars+symbols), SESSION_SECRET generated; `backend/.env.production` template ready to paste into Railway ✅ (done 2026-04-27)
- [x] **Cloudinary image storage** — multer migrated to Cloudinary; 13 seed files uploaded; seed.js uses Cloudinary URLs; disk fallback kept for local dev ✅ (done 2026-04-27)
- [x] **Contact page real numbers** — +91 87077 18146 (call), +91 94736 36333 (WhatsApp), support@bhavx.com (email) ✅ (done 2026-04-27)
- [x] **Run seed on prod DB** — temp start-script trick; 9 cities, all metals/grades, 27 Delhi Mandoli rates, 9 listings, 7 test users ✅ (done 2026-04-29)
- [x] **DNS cutover to bhavx.com** — A records on Hostinger, Vercel domains valid (bhavx.com + bhavx.in + www variants), 307 redirects to canonical www.bhavx.com ✅ (done 2026-04-30)
- [x] **Firebase Authorized Domains** — bhavx.com, www.bhavx.com, bhavx.in, www.bhavx.in, metal-xpress-three.vercel.app added ✅ (done 2026-04-30)
- [x] **Frontend API URL bugs** — 5 hardcoded `fetch('/api/...')` paths fixed (LMEStrip, Home×3, Admin); api.js axios baseURL now appends `/api` ✅ (done 2026-04-30)
- [x] **Footer sticky-to-bottom** — flex-column AppShell with min-height: 100vh ✅ (done 2026-04-30)
- [x] **DB fallback for ALL metals** — when Yahoo fails, fall back to most recent DB row for any of the 6 metals (was Lead/Tin only) ✅ (done 2026-04-30)
- [x] **Synthetic price data wiped** — charts now populate honestly from real 15-min cron snapshots only; deleted seedPriceHistory.js + backfillHistorical.js ✅ (done 2026-04-30)
- [x] **Forgot password email** — works in prod via Resend (domain verified) ✅ (validated 2026-04-30)

---

## 🟠 PRE-BETA — Before Onboarding 20 Traders (Week 1, BLOCKERS)

**Sequence**: Smoke test (Day 1) → PWA + Razorpay-free UX (Day 2) → WhatsApp scraper (Day 3-4) → FCM (Day 5) → PAN verification (Day 6) → Verified badge UI (Day 7)

### Day 1 — Smoke Test (Mridul, manual, ~90 min)
- [ ] **Full E2E smoke test on bhavx.com** — signup, email verify, phone OTP, KYC, listing post (Cloudinary), offer/counter/accept, pay flow, dispute, forgot password. Test on Chrome desktop + mobile Safari + mobile Chrome.

### Day 2 — PWA + Free Pro UX
- [ ] **PWA setup** — `vite-plugin-pwa` + `manifest.json` + service worker + install prompt component. Files: `frontend/public/manifest.json`, `frontend/public/icon-192.png`, `frontend/public/icon-512.png`, `frontend/vite.config.js` plugin entry, `frontend/src/components/PWAInstallPrompt.jsx`. Result: bhavx.com installable on Android home screen, looks identical to native app.
- [ ] **Razorpay-free "Subscribe" UX** — `frontend/src/components/PaywallModal.jsx` "Subscribe ₹299/mo" button → calls new `POST /api/auth/grant-pro` endpoint that sets user.plan = 'pro' for free → toast "Welcome to Pro 🎉". Backend: `backend/src/routes/auth.js` adds `/grant-pro` endpoint (later replaced by Razorpay webhook in Month 2).

### Day 3-4 — WhatsApp Scraper (REPLACES manual admin paste)
- [ ] **WhatsApp scraper service** using `whatsapp-web.js`:
  - New service: `backend/src/services/whatsappScraper.js` — long-running, runs alongside main backend on Railway
  - Loads `whatsapp-web.js` with `LocalAuth` strategy (persists session in `.wwebjs_auth/`)
  - On startup: prints QR to logs, Mridul scans with dedicated phone (₹150 SIM)
  - Filters incoming messages by group ID (only listens to metal-broadcast groups)
  - On message: runs through existing `rateParser.js` → POSTs to `/api/rates/save-parsed`
  - Auto-reconnects on disconnect
- [ ] **Risk mitigation**: dedicated number ≠ Mridul's personal number. If banned, buy another SIM and re-scan. Personal WhatsApp untouched.
- [ ] **Strategy note**: BhavX positions as "WhatsApp chaos → clean app". Scraper is internal plumbing. Traders never see it.

### Day 5 — Firebase Cloud Messaging (FCM) for Alerts
- [ ] **Frontend FCM integration**:
  - `frontend/src/config/firebase.js` — add `getMessaging`, `getToken`, `onMessage`
  - On login or post-auth: request notification permission, get FCM token
  - PATCH `/api/auth/profile` with `{ fcmToken }`
- [ ] **Backend FCM push**:
  - Prisma schema: add `fcmToken String?` to `User`
  - `backend/src/services/pushNotifier.js` — wrapper around `firebase-admin` `messaging().send()`
  - `backend/src/services/alertService.js` — cron every 5 min, query alerts, compare to current rates, fire push for matches
- [ ] **Cost**: ₹0. FCM is in Firebase always-free tier. No credit card, no usage caps for normal scale.
- [ ] **Test**: alerts page → set threshold → cross threshold → notification arrives on phone.

### Day 6 — Real KYC via Surepass PAN Verification
- [ ] **Surepass account** at surepass.io (₹3-5 per PAN check, dev-friendly NSDL wrapper)
- [ ] **Backend wiring** in `backend/src/routes/auth.js` PATCH `/profile`:
  - Before setting `kycVerified: true`, call Surepass `/pan/verify` with `panNumber + legalName`
  - On match: set `kycVerified: true`
  - On mismatch: return 422 with helpful error
- [ ] **Cost**: 100 users × ₹3 = ₹300 lifetime. Negligible.
- [ ] **Result**: "Verified Trader" badge actually means something.

### Day 7 — Verified Badge UI Throughout
- [ ] **Listing cards in Browse tab** — green ✓ badge next to seller name when `seller.kycVerified`
- [ ] **"Verified Only" filter toggle** in Browse tab
- [ ] **Profile page** — prominent "Verified ✓" with hover tooltip "PAN-verified via NSDL"
- [ ] **"Founding Trader" gold badge** — separate from KYC, shown for 20 alpha users (gold color, crown emoji 👑)
- [ ] **Schema**: add `User.isFoundingTrader Boolean @default(false)` — set manually in DB for the 20

### Founding 20 Setup
- [ ] Add 20 trader emails to `PRO_EMAILS` env var as they sign up (instant Pro access)
- [ ] PostHog analytics — frontend snippet, track signup → first listing → first offer funnel

---

## 🟡 REVENUE — Public Launch (Month 2 / Week 5+)

**Pricing decision: Month 1 = 100% free for 20 alpha users. Charge from Week 5 (public launch).**
*Reasoning: Friction kills feedback. VCs at angel stage care about engagement+retention, not ₹2K MRR. Don't put critical path on Razorpay/Pvt Ltd setup. Founding 20 keep lifetime free as a loyalty moat.*

- [ ] **Pvt Ltd "BhavX Technologies" incorporation** (PREREQUISITE for Razorpay)
  - Service: Vakilsearch / IndiaFilings (₹15-25K all-inclusive)
  - Documents: PAN, Aadhaar, 2 directors, registered office address
  - Output: CIN, Company PAN, TAN, MOA/AOA
  - Time: 7-15 days for ROC name approval
- [ ] **Open current account** — HDFC/Kotak in BhavX Technologies Pvt Ltd name (1 week after CIN)
- [ ] **GST registration** — optional below ₹20L turnover but apply anyway (looks better for VCs, enables input credit)
- [ ] **Razorpay Pro subscription** — wire PaywallModal (₹299/mo) to Razorpay Checkout. Requires Pvt Ltd CIN + current account.
- [ ] **Razorpay deal commission** — replace dev-mode instant pay in `/deals/:id/pay` with real Razorpay flow (0.1% of agreed value)
- [ ] **Subscription DB model** — replace `PRO_EMAILS` env var with `Subscription` table + Razorpay webhook for payment confirmation
- [ ] **TWA wrapper for Play Store** (2-3 days) — Trusted Web Activity wraps PWA in APK. Submit to Play Store. ₹2,500 one-time Play Console fee. Looks identical to native React Native.

---

## 🟢 GROWTH — Post-Launch (Month 2-3)

- [ ] **WhatsApp Business Cloud API (Meta)** — bhavx.com BECOMES the broadcaster
  - Requires: Meta Business Manager + Pvt Ltd verification (CIN, GST)
  - Free tier: 1,000 conversations/month
  - Webhook: `POST /api/whatsapp/inbound` runs through existing rateParser.js
  - Auto-reply bot: trader texts "RATES" → reply with bhavx.com snapshot
  - **Cannot intercept other people's broadcasts** (against ToS, bannable). Path is to OWN the broadcast.
- [ ] **Google OAuth** — set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in .env (fully coded, plug-and-play)
- [ ] **metals-api.com real LME prices** — set `METALS_API_KEY` in .env (fully coded, plug-and-play)
- [ ] **Hindi language toggle** — huge TAM unlock for tier-2/3 city traders
- [ ] **WebSocket/SSE** — replace 30s polling with real-time deal notifications
- [ ] **KYC document upload** — PAN card photo upload for extra verification layer
- [ ] **Dispute SLA automation** — auto-notify admin when dispute filed, escalation timer
- [ ] **Premium UI/UX upgrade** — high-polish dropdowns, modals, animations across entire app; glassmorphism upgrade, micro-interactions, better mobile touch targets
- [ ] **Deal completion visibility** — completed deals should mark listing as "Sold"; remove/archive from active Browse tab
- [ ] **Offer/counter notifications** — email or in-app alert when buyer/seller receives a new offer or counter-offer
- [ ] **Profile view mode** — profile shows view-only by default; "Edit" button unlocks fields; phone/email change triggers re-verification

---

## 🔵 CAPITAL & SCALE (Month 4+)

- [ ] **Native React Native mobile app** — only after ₹50K+ MRR justifies the 4-6 week build. PWA+TWA serves users perfectly until then. iOS App Store skip until Month 6+ (₹8K/yr Apple Developer fee wasted pre-PMF).
- [ ] **Pitch deck** — product screenshots, TAM (India metal trade ~$150B/yr), revenue model, traction metrics
- [ ] **TypeScript migration** — frontend TS before hiring engineers
- [ ] **Separate admin app** — decouple admin from consumer app for security
- [ ] **Multi-city expansion** — automated hub onboarding, local admin per city
- [ ] **GoDaddy → Cloudflare transfer** — do before April 2027 (saves ~₹720/yr on bhavx.com renewal)

---

## ✅ Completed

- [x] Live LME/MCX/Forex rates (Yahoo + Stooq, no paid API)
- [x] WhatsApp broadcast → unified smart parser → instant web update (admin paste)
- [x] Full B2B marketplace — negotiate → agree → pay commission → contact reveal
- [x] Dispute/escrow mechanism with admin resolution
- [x] PAN-based KYC gates entire marketplace
- [x] Photo/video upload (multer → local disk) + Lightbox gallery
- [x] Pro paywall gate (local rates blur)
- [x] Auth — email+password, phone OTP, Google OAuth stub
- [x] Unified signup (email + phone + OTP mandatory)
- [x] Email verification (Resend, mandatory, 60s cooldown, StrictMode-safe)
- [x] Forgot password flow (Resend, token-based reset page)
- [x] Analytics dashboard — ApexCharts candlestick+line, per-metal colors, period H/L, cron price feed
- [x] Landing page — marketing page, FAQ x11, 2-tier pricing (Free + Pro ₹299)
- [x] BhavX rebrand — all 30+ files, central brand config at `frontend/src/config/brand.js`
- [x] BhavX hexagon logo mark — SVG, gold gradient, Navbar + Footer + favicon
- [x] Mobile-first dark navy glass design throughout
- [x] Admin panel — rate management + listing verification + disputes
- [x] T&C enforcement on offers, listings, signup
- [x] Footer + static pages (About, Terms, Privacy, Contact)
- [x] Domains purchased — bhavx.com + bhavx.in (GoDaddy, April 2026)
- [x] SMS OTP — Firebase Phone Auth, real SMS, no DLT registration needed, 10k OTPs/month free
- [x] ngrok setup — Firebase Phone Auth works in local dev via ngrok tunnel
- [x] Phone login UX — pre-check + clean OTP screen + loginOnly flag
- [x] Seed improvements — emailVerified users, source:'seed' on LME/MCX rates, bhavx.com admin emails
- [x] Marketplace bug fixes (session 18) — images on ngrok, Lightbox flicker, dispute scroll, own-listing filter, deal badges, KYC two-button, dirty-state Save
- [x] Navbar username → gold clickable link to /profile
- [x] Precious Metals section — Gold + Silver via Yahoo `GC=F`/`SI=F`, MCX conversion (₹/10g for Gold, ₹/kg for Silver) ✅ (done 2026-04-26)
- [x] Bug fixes (session 19) — Lead/Tin missing from LME (DB fallback `source` filter), sold listings still in Browse (relational filter + `isActive` on pay), Submit Dispute UX (inline error + canSubmit guard)
- [x] Cloudinary image storage — multer migrated, 13 seed files uploaded, disk fallback for local dev ✅ (done 2026-04-27)
- [x] KYC re-verification bug fixed — `publicUserFields()` helper ensures kycVerified always returned on login ✅ (done 2026-04-27)
- [x] Completed deal listing state bug fixed — "Verified & Live" suppressed, "Sold" badge shown, OR query keeps sold listings in My Listings ✅ (done 2026-04-27)
- [x] Contact page — real phone numbers (+91 87077 18146, +91 94736 36333), support@bhavx.com email card ✅ (done 2026-04-27)
- [x] Email forwarding — support@bhavx.com live via ImprovMX → forwards to Gmail; catch-all `*@bhavx.com` also active ✅ (done 2026-04-27)
- [x] Production env vars — strong secrets generated, `backend/.env.production` template ready for Railway ✅ (done 2026-04-27)
- [x] **🚀 PRODUCTION DEPLOY COMPLETE** — bhavx.com live, Railway backend, Vercel frontend, DNS cutover, SSL valid, Firebase domains, all 6 metals + Gold/Silver, CRON saving real data every 15 min ✅ (done 2026-04-30)
- [x] Frontend API URL convention canonicalized — `VITE_API_URL` is base URL without `/api`; files append `/api/...` themselves ✅ (done 2026-04-30)
- [x] Yahoo Finance historical data philosophy — accepted that real historical from cloud IPs is unreliable; charts populate from real cron going forward (honest approach) ✅ (done 2026-04-30)

---

## 📅 Session Log

| Date | Session | What was done |
|------|---------|---------------|
| 2026-03-19 | 1 | Initial UI overhaul |
| 2026-03-20 | 2-3 | Navbar fix, unified admin parser, WhatsApp timestamp fix |
| 2026-03-21 | 4-8 | Auth overhaul, marketplace deal flow, dispute, KYC, profile |
| 2026-03-22 | 9-10 | OTP fix, file uploads, Lightbox, PAN KYC, T&C enforcement |
| 2026-04-11 | 11 | Email verification fully working (StrictMode-safe) |
| 2026-04-12 | 12 | Bug fixes, Analytics dashboard, mobile responsiveness |
| 2026-04-13 | 13 | Analytics redesign (ApexCharts), landing page, PRO gates, cron feed |
| 2026-04-14 | 14 | Landing copy overhaul, 2-tier pricing, About rewrite, font standardization |
| 2026-04-20 | 15 | BhavX rebrand, brand config, domains purchased |
| 2026-04-21 | 16 | BhavX hexagon logo (SVG), ROADMAP.md created, Resend domain verified ✅, email live to any inbox, hero CTA button → outline+hover |
| 2026-04-21 | 17 | Firebase Phone Auth end-to-end — real SMS OTP replaces hardcoded `1234`, MSG91 parked, Login.jsx + Signup.jsx updated |
| 2026-04-24 | 18 | ngrok setup, phone login UX fixes, seed improvements, 7 marketplace/profile bug fixes, navbar profile link |
| 2026-04-26 | 19 | 3 bug fixes (Lead/Tin LME, sold listings, dispute UX); Gold + Silver Precious Metals section; strategy session — TAM analysis, $1B path requires embedded financing pivot |
| 2026-04-27 | 20 | Cloudinary migration (images/videos); KYC re-verification bug; completed deal listing state bug; Contact page real numbers; support@bhavx.com email forwarding (ImprovMX); prod env vars generated |
| 2026-04-28 | 21 | Camera iris SVG logo redesign; Railway backend deploy started (postinstall + start hooks, multi-origin CORS); vercel.json SPA rewrite |
| 2026-04-29 | 22 | Railway backend FULLY LIVE — Postgres linked, schema pushed, seed ran, CRON saving prices every 15 min, Cloudinary active |
| 2026-04-30 | 23 | 🚀 **PRODUCTION DEPLOY COMPLETE** — Vercel frontend live at bhavx.com + bhavx.in (redirects); 5 frontend bugs fixed; footer sticky; synthetic price data wiped; Firebase domains; DNS cutover; SSL valid |
