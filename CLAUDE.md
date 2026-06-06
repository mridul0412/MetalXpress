# BhavX — Project Context & Requirements

## 🎯 Current Business Focus (Month 2 — Public Launch / First Traders)
> **Source of truth**: [BUSINESS_ROADMAP.md](./BUSINESS_ROADMAP.md) — 6-month fundraise plan
> **Product roadmap**: [ROADMAP.md](./ROADMAP.md) · **Visual journey**: bhavx.com/roadmap.html
>
> **Status**: Production is LIVE (bhavx.com + api.bhavx.com). Brand shipped. Marketplace, KYC,
> deal flow all working. Railway now on **Hobby (paid $5/mo)** — trial expired & was revived
> 2026-06-06 with data intact.
>
> **THE WALL (do this before anything else)**: 🎯 **First 20 traders.** Everything waits behind it.
>
> **GTM reframe (post-broker-feedback, 2026-06-06)**: A major broker said the *marketplace* won't
> work — informal/cash trade, trust is relationship-based, "why trust people online." He's
> half-right (real trust cold-start) and half-defensive (incumbent protecting his turf). KEY
> INSIGHT: **lead with the RATES** (live LME/MCX/local — zero trust barrier, zero tax exposure,
> everyone wants them daily) → build mass daily habit → layer the marketplace LATER (Month 3+)
> for the willing subset. Brokers = potential verified intermediaries, not enemies. Capital =
> legitimacy in Indian B2B, so the angel round also de-risks the trust problem.
>
> **Pending tech (not blocking traders)**: PWA, WhatsApp scraper, FCM push, Surepass PAN verify,
> PostHog, Founding-Trader badge.
> **6-month goal**: ₹10-25 Cr seed (realistic) / ₹50 Cr (stretch) / ₹2-5 Cr angel (floor).
>
> **At every session**: glance at BUSINESS_ROADMAP.md for the current week. Tick what's done.

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

## Brand Identity (LOCKED — shipped 2026-05-09, see frontend/public/wordmark-preview.html)
- **Logo**: camera-iris, 8 gold parallelogram blades + radial **sun-core bindu** at center
  (white→gold→orange→red `#FFFEF0→#FFC942→#FF6B1A→#C73E0A`). Component: `BhavXLogo.jsx`.
- **Wordmark**: `Bhav │ ⟨X⟩` — **Marcellus** serif, gold gradient `#FFE9A8→#CFB53B→#8C6818`.
  Thin vertical gold bar separator (1.5px × 0.45em, solid gradient). X sits in a thin
  gold-border frame (the "exchange ticker chip"). Component: `BhavXWordmark.jsx` (sizes:
  hero/large/navbar/footer).
- **Tagline**: "India's Metal Exchange" — Cormorant SC small caps, 0.36em tracking, gold.
- **Chakra loader**: spinning iris (3s linear) + pulsing sun core — replaces ALL spinners.
  Component: `ChakraLoader.jsx`. Also the pre-React boot screen in index.html.
- **Color tokens**: exported from `frontend/src/config/brand.js` as `BRAND_COLORS` +
  `BRAND_GRADIENTS`. Gold gradient + sun-bindu radial reused across logo/wordmark/loader/email.
- **Fonts loaded** (index.html): JetBrains Mono (app), Marcellus (wordmark), Cormorant SC (tagline).
- Rolled out: Navbar, Footer, Landing hero, email templates (Resend), favicon, all loaders.

## Current Date
2026-06-07

## Session Log
- **2026-06-07 (session 29)**: Return after 25-day gap. Diagnosed Railway **trial expired** → both services paused (data intact on postgres-volume); user upgraded to **Hobby ($5/mo)**, backend revived. Synced main folder (was 40 commits behind) → all folders + remote now on same commit. **Trimmed CLAUDE.md 175KB→38KB** (moved sessions 3-23 full-detail prose + superseded status/roadmap-dup sections to `CLAUDE_ARCHIVE.md`). Built **visual journey roadmap** at `frontend/public/roadmap.html` (bhavx.com/roadmap.html) — two winding "roads" (Product + Business) with a car at "you are here". **Cloud nudge agent**: `.github/workflows/daily-nudge.yml` + `.github/scripts/daily-nudge.js` — GitHub Actions cron fires 9AM IST daily regardless of laptop state (old Windows Task Scheduler only worked when laptop on → silent for 25 days). Strategic GTM reframe after broker feedback (lead with rates, marketplace later — see Focus block). Added Brand Identity section (above). Set up GitHub Codespace + `.devcontainer/` for travel (laptop-free dev fallback).
- **2026-05-08 (session 28)**: Marketplace polish round — 5 fixes per user list: (1) double scroll on deal panel collapsed to single outer scroll, (2) sibling buyers' deals auto-cancel with `cancellationReason: listing_sold_to_another_buyer` when listing sold + clear "Seller accepted another offer" message, (3) 48h dispute window post-completion with prominent yellow warning + Report Issue button stays visible, (4) image-first listing card UI overhaul (hero 168px with overlays for badges/price/image-count, clickable as a whole, hover lift, gold border on hover, removed redundant 4-thumbnail strip), (5) `ListingPreviewModal` for owners to see buyer-facing view via "👁 Preview" button on My Listings. Plus: trust banner moved from Marketplace to Landing page (new "Why BhavX vs WhatsApp" 5-card section between How It Works and What You Get with new "Best deals from all over India" point), subtle ✓ checkmark strip below Marketplace header on every tab. Backend KYC validation hardening (legal name length 2-100 + letters/spaces/dots only, no digits). Removed misleading NSDL "verify" link from KYC admin (no free public PAN+name API exists). Roadmap honesty pass — both BUSINESS_ROADMAP.md and ROADMAP.md updated with what's actually done vs pending. Fixed Windows Task Scheduler bug (was using `-Once` trigger that died after 13 hours; now uses `-Daily` so push nudges fire every day forever).
- **2026-05-07 (session 27)**: KYC admin polish — inline rejection form (textarea + char counter + Submit/Cancel) replaces browser `prompt()`. Show user's display name AND legal name side-by-side in admin card header. Admin DB-wipe endpoint `POST /admin-wipe-test-users` (FK-safe cascade order, NULL-email orphan handling) replaces fragile temp-start-script trick. Profile dropdown menu in Navbar — avatar circle (gold gradient + initials) + name + ChevronDown → menu with Profile / Change Password (→ /forgot-password for logged-in users) / Sign Out + Verified Trader badge if KYC done. Closes on outside click + route change.
- **2026-05-06 (session 26)**: Manual admin KYC approval flow shipped (interim until Surepass arrives). Schema: `User.kycSubmittedAt`, `kycApprovedAt`, `kycApprovedBy`, `kycRejectionReason`. Backend: PATCH `/profile` with `kycComplete: true` sets `kycSubmittedAt` instead of auto-flipping `kycVerified`. New admin endpoints `GET /kyc-pending` + `PATCH /kyc-approve/:userId` + `PATCH /kyc-reject/:userId`. Profile.jsx 4-state banner (verified / pending review / rejected / not-submitted). Admin "KYC Review" tab with PAN+name display + (later removed) NSDL deep-link. Free Pro UX shipped — `User.isPro + proGrantedAt` schema, `POST /grant-pro` endpoint, PaywallModal "Activate Free Pro" → "✓ You're Pro!" with auto-close. Strikethrough ₹299 + green FREE badge throughout (PaywallModal, Landing pricing card, Marketplace ProGate, Analytics ProGate). 0% commission everywhere too (was 0.1%). Pre-check email + phone before sending Firebase OTP — new `/check-email` endpoint mirrors `/check-phone`; signup runs both in parallel, fails fast on duplicates, saves SMS quota. Hidden Alerts page from Navbar (route still works at /alerts; re-enable when FCM wires). Removed Marketplace Activity vanity chart from Analytics. Surepass form submitted at surepass.io — B2B onboarding, awaiting their email with API token.
- **2026-05-03 (session 25)**: 🆘 **DNS hellfest day** — Railway `metalxpress-production.up.railway.app` started failing local DNS resolution (cache poisoning). Set up `api.bhavx.com` custom domain via Hostinger CNAME → `hpte7zx4.up.railway.app` + Vercel `VITE_API_URL` switched. Permanent fix for the DNS bug class. Frontend resilience added: LMEStrip retry with exponential backoff + 5-min refresh interval (was: fetch once, stuck-on-loading forever); Home.loadLme retries on initial fail with backoff; strict empty-content guard (`Array.isArray(d.metals) && d.metals.length > 0` instead of truthy `{}`); never overwrite good data with empty response. OM watermark rolled back to system-font version (Mangal/Devanagari Sangam MN per device) per user preference — Noto Sans Devanagari approach abandoned. Signup flow fixes: reCAPTCHA "already rendered" bug (replace container DOM element completely instead of just clearing innerHTML), OTP-wasted-on-fail (cache `verifiedFirebaseToken` after first successful Firebase confirm so registration retry doesn't need new OTP), legalName backend validation.
- **2026-05-01 (session 24)**: SessionStart hook activated (`.claude/scripts/session-brief.js` v3) — fires on every session matcher empty, injects current Month/Week briefing from BUSINESS_ROADMAP.md + ROADMAP.md. Push notifications via ntfy.sh topic `bhavx-mridul-alerts` (no account, free). Windows Task Scheduler hourly task `BhavX-Hourly-Nudge` for cloud-independent alerts (later fixed in session 28 — was using `-Once` trigger that died after 13 hours).
- **2026-04-30 (session 23)**: 🚀 **PRODUCTION DEPLOY COMPLETE** — Vercel frontend live at `bhavx.com` + `bhavx.in` (redirects to `.com`); 5 frontend bugs fixed (`fetch('/api/...')` hardcoded paths in LMEStrip/Home/Admin, `VITE_API_URL` build conventions, axios baseURL); footer sticks to bottom (flex layout); historical price data philosophy — wiped all synthetic data, charts now populate honestly from 15-min cron only; Firebase Authorized Domains updated; full DNS cutover with bhavx.in 307 → www.bhavx.com — see Session 23 details below
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
