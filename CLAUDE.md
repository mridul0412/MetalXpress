# MetalXpress — Project Context & Requirements

## What This App Is
MetalXpress is a real-time scrap metal rate platform for Indian traders. It replaces WhatsApp broadcast messages with a clean, organized mobile-first web app. End consumers see live rates; admin pastes WhatsApp messages to update them.

## Owner Preferences (MUST FOLLOW)
- **Accent**: Gold (`#CFB53B`) + Black (`#0D0D0D`). Blue only for secondary actions.
- **Font**: JetBrains Mono / monospace throughout.
- **Style**: Dark navy glass-panel aesthetic. Large readable rate numbers. Minimal clutter.
- **Mobile-first**: Most users are on mobile (traders on the go).
- **Technical level**: Semi-technical. Understands code concepts, can read/follow code, but doesn't write it day-to-day. Explain decisions briefly but don't over-explain basics.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (port 5173)
- **Backend**: Node/Express + Prisma + PostgreSQL (port 3001)
- **Auth**: Email+password (bcrypt), Phone OTP (dev OTP: 1234), Google OAuth — JWT tokens in localStorage as `mx_token`
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
2026-04-11

## Session Log
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
- **LMEStrip in Navbar**: Currently uses `d.rates` fallback — should be updated to `d.metals` to match new `/live` shape
- **Lead/Tin DB fallback**: Only served if admin-pasted LME message is ≤7 days old; otherwise shows "—"
- **Forgot password**: Implemented and working (session 11) — reset email sent via Resend, token-based reset page, password complexity enforced.
- **Email verification**: Fully implemented and working (session 11) — verification email on signup, mandatory verification, amber banner reminder, 60s resend cooldown, StrictMode-safe.
- **Contact page**: Phone/WhatsApp numbers are placeholder "XXXXX XXXXX" in `Contact.jsx` — update with real numbers before go-live.
- **Marketplace commission**: 0.1% negotiation-first flow working in dev mode (instant payment) — needs Razorpay integration for production.
- **Deal notifications**: Polling-based (30s/15s intervals) — consider WebSocket or SSE for real-time updates in production.
- **KYC verification**: PAN-based KYC implemented (session 10). Collects PAN number, legal name, trade category, optional GST. Gates entire marketplace. Admin can still see `kycVerified` status in listing verification panel. No document upload yet (just data entry) — could add PAN card photo upload for extra verification in future.
- **Image storage for production**: Currently files saved to local `backend/uploads/` folder via multer. For production at scale, migrate to S3/Cloudinary with CDN. Local disk works fine for MVP/early launch.
- **Dispute SLA**: 48-hour resolution promise is manual (admin reviews) — needs notification to admin when dispute filed.
- **Analytics layer**: Charts, market analysis, Hindi toggle — Phase 2 feature, not yet built.
- **Legacy components**: `CitySelector.jsx`, `MetalCard.jsx`, `RateTable.jsx`, `LMERatesPanel.jsx` — unused, can be removed.
- **Unused dependencies**: `ioredis` installed but never used — remove before production.
- **Google OAuth**: Plug-and-play but shows greyed "Soon" when `GOOGLE_CLIENT_ID` not set.
- **SMS OTP**: Dev mode uses hardcoded OTP `1234`. Production needs MSG91 or Twilio integration. Env vars defined in `.env.example` but not wired to auth.js.
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
- Production: set `EMAIL_FROM="MetalXpress <noreply@yourdomain.com>"` after domain verification

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

## Current Status (as of 2026-03-22, session 10)
- **Auth**: Unified signup (email+phone+OTP mandatory), email+password login, phone OTP login, Google OAuth — prevents duplicate accounts. Phone normalization handles +91 prefix, spaces, dashes.
- **Subscription**: Pro test user `test@metalxpress.in` / `test1234`, Admin user `admin@metalxpress.in` / `admin1234` — pro plan via PRO_EMAILS env var
- **Landing**: Hero section for non-logged-in users with feature cards and CTAs
- **Paywall**: Local rates blurred/gated for non-subscribers with "Sign Up" or "Upgrade to Pro" overlay
- **Marketplace**: Negotiation-first deal flow, 0.1% commission on agreed value, chat-style offer thread, direct file upload for photos/videos (multer → local disk), dispute/escrow mechanism, 4-tab UI. **KYC gate blocks entire marketplace** (browse/post/deals) for unverified users. Minimum 4 media required to post. Explicit T&C acceptance on both offer-making and listing. Lightbox gallery (click thumbnail → full-screen with nav arrows + thumbnail strip + video autoplay). Seed listings use local `/uploads/` photos+videos (real scrap metal content). "Make Offer" duplicate-deal bug fixed (navigates to existing deal).
- **Disputes**: Full dispute lifecycle — raise dispute → admin reviews → refund/complete/cancel resolution
- **Profile**: Complete rewrite — save now refreshes AuthContext immediately via `refreshUser()` (no stale data), phone change requires OTP verification, KYC status banner, inline PAN-based KYC form for unverified traders, all fields editable
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
    Admin.jsx                      ← Standalone layout, unified smart parser + Marketplace admin (verify/reject)
    Profile.jsx                    ← Subscription status, personal info form, trader type, save/sign-out
    About.jsx                      ← Company info, What We Do, Data Sources, Mission
    Terms.jsx                      ← Terms of Service (placeholder legal text)
    Privacy.jsx                    ← Privacy Policy (placeholder legal text)
    Contact.jsx                    ← Contact cards (Email, WhatsApp, Phone, Office) + FAQ
  components/
    Navbar.jsx                     ← Sticky glass header + LMEStrip + mobile bottom nav
    Footer.jsx                     ← Site-wide footer (Company + Legal links) — rendered in AppShell
    HeroSection.jsx                ← Landing hero for unauthenticated users (gold gradient + feature cards)
    LocalRatesGate.jsx             ← Blur overlay + paywall CTA for non-subscribers
    LMEStrip.jsx                   ← Marquee ticker fetching /api/rates/live (uses d.rates fallback — update to d.metals)
    PaywallModal.jsx               ← Free/Pro/Business plan gate, Razorpay stub
    CitySelector.jsx               ← (legacy)
    MetalCard.jsx                  ← (legacy)
    RateTable.jsx                  ← (legacy)
    LMERatesPanel.jsx              ← (legacy)
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
- [ ] **Analytics dashboard (Pro)** — price trend charts, marketplace GMV, volume by metal (see Analytics Feature List below)
- [ ] **Google OAuth** — just needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env (fully coded)
- [ ] **metals-api.com real LME prices** — just needs METALS_API_KEY in .env (fully coded, auto-activates)
- [ ] **Hindi language toggle** — major unlock for tier-2/3 city traders (real TAM)
- [ ] **WebSocket/SSE** — replace 30s polling with real-time deal notifications
- [ ] **KYC document upload** — PAN card photo upload for extra verification layer
- [ ] **Dispute SLA automation** — auto-notify admin on dispute filed, escalation timer

### 🧹 Phase 4 — Cleanup (Before Hiring Engineers)
- [ ] **TypeScript migration** — add TS to frontend for team scalability
- [ ] **Remove unused deps** — `ioredis` never used, remove before production
- [ ] **Remove legacy components** — CitySelector.jsx, MetalCard.jsx, RateTable.jsx, LMERatesPanel.jsx
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
- LMEStrip in Navbar still uses `d.rates` fallback — **TODO: update to `d.metals`**
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
- PAN format validation: `/^[A-Z]{5}[0-9]{4}[A-Z]$/` (e.g. ABCDE1234F). GSTIN format: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/` (15 chars).

## Test Accounts
| Email | Password | Role | Subscription |
|-------|----------|------|-------------|
| `admin@metalxpress.in` | `admin1234` | Admin + Trader | Pro (via PRO_EMAILS) |
| `test@metalxpress.in` | `test1234` | Pro Tester | Pro (via PRO_EMAILS) |
| `rajesh@test.com` | `test1234` | Seller (Delhi) | Free |
| Admin panel | password: `admin123` | Admin | N/A (header auth) |
