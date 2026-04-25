# BhavX — Master Roadmap & Daily Progress Tracker
> Update status as tasks complete: [ ] pending → [x] done
> Check this at the start of every session. No complacency.

---

## 🔴 CRITICAL — Before Go-Live

- [x] **Email domain on Resend** — bhavx.com verified, `EMAIL_FROM="BhavX <noreply@bhavx.com>"` set, sending to any inbox ✅ (done 2026-04-21)
- [x] **SMS OTP real integration** — Firebase Phone Auth live; real 6-digit SMS; no DLT needed; MSG91 parked ✅ (done 2026-04-21)
- [x] **Phone login UX fixes** — pre-check blocks unregistered numbers before OTP send; removed name/trader-type from login OTP screen; `loginOnly:true` prevents silent account creation ✅ (done 2026-04-24)
- [ ] **Deploy backend → Railway** — Node + PostgreSQL plugin, set DATABASE_URL
- [ ] **Deploy frontend → Vercel** — free tier, set `VITE_API_URL` to Railway backend URL
- [ ] **Production env vars** — new JWT_SECRET, ADMIN_PASSWORD, DATABASE_URL (never use dev values in prod)
- [ ] **Cloudinary image storage** — local `backend/uploads/` wiped on Railway redeploy; migrate before deploy
- [ ] **Contact page real numbers** — replace placeholder `XXXXX XXXXX` in Contact.jsx
- [ ] **Run seed on prod DB** — then admin pastes first real WhatsApp rate broadcast to go live

---

## 🟡 REVENUE — Before First Paying Users

- [ ] **Razorpay Pro subscription** — wire PaywallModal (₹299/mo) to Razorpay Checkout
- [ ] **Razorpay deal commission** — replace dev-mode instant pay in `/deals/:id/pay` with real Razorpay flow
- [ ] **Subscription DB model** — replace PRO_EMAILS env var with proper Subscription table + Razorpay webhook
- [ ] **Price alert triggers** — cron job (node-cron installed) checks thresholds every 15min, fires SMS via MSG91

---

## 🟢 GROWTH — Post-Launch

- [ ] **Google OAuth** — set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` in .env (fully coded, plug-and-play)
- [ ] **metals-api.com real LME prices** — set `METALS_API_KEY` in .env (fully coded, plug-and-play)
- [ ] **WhatsApp Business API** — webhook endpoint to auto-receive broadcast → parse → save (zero manual paste). Use Twilio sandbox for dev, Meta Cloud API for prod.
- [ ] **Hindi language toggle** — huge TAM unlock for tier-2/3 city traders
- [ ] **WebSocket/SSE** — replace 30s polling with real-time deal notifications
- [ ] **KYC document upload** — PAN card photo upload for extra verification layer
- [ ] **Dispute SLA automation** — auto-notify admin when dispute filed, escalation timer
- [ ] **Premium UI/UX upgrade** — high-polish dropdowns, modals, animations across entire app; glassmorphism upgrade, micro-interactions, better mobile touch targets
- [ ] **Deal completion visibility** — completed deals should mark listing as "Sold"; remove/archive from active Browse tab
- [ ] **Offer/counter notifications** — email or in-app alert when buyer/seller receives a new offer or counter-offer
- [ ] **Profile view mode** — profile shows view-only by default; "Edit" button unlocks fields; phone/email change triggers re-verification

---

## 🔵 CAPITAL & SCALE

- [ ] **Pitch deck** — product screenshots, TAM (India metal trade ~$150B/yr), revenue model, traction metrics
- [ ] **TypeScript migration** — frontend TS before hiring engineers
- [ ] **Separate admin app** — decouple admin from consumer app for security
- [ ] **PWA / Mobile app** — app store presence for traders
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
