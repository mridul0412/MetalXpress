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
2026-03-21

## Session Log
- **2026-03-19**: Initial UI overhaul (Replit-quality design, LME/MCX panel, hub selector, Login, Admin, Marketplace)
- **2026-03-20 (session 1)**: Fixed Navbar not rendering (missing from App.jsx), rewrote CLAUDE.md, fixed Lead symbol (PB-USD→Stooq), added Forex+Indices+Crude display, city pills selector, standalone Admin layout, Login redesign (Google OAuth stub + phone OTP + profile), PaywallModal, plug-and-play API stubs for metals-api/Google/Razorpay/MSG91
- **2026-03-20 (session 2)**: Corrected CLAUDE.md — owner is semi-technical; fixed Live Data Sources table (Lead/Tin are DB fallback, not Stooq); fixed Stooq symbol case ni.f → NI.F in docs
- **2026-03-20 (session 3)**: Major fixes and unified Admin parser — see full details below
- **2026-03-21 (session 4)**: Auth overhaul, landing page, paywall gate, footer/legal pages — see Session 4 details below
- **2026-03-21 (session 5)**: Auth integration, pro test user, alerts fix, initial marketplace filters
- **2026-03-21 (session 6)**: Complete marketplace overhaul — deal flow with 0.1% commission gate, sell-only listings, card redesign, dropdown fix, listing verification, contact reveal after payment

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

## Known Remaining Issues
- **Alerts**: Backend CRUD works, but no cron/background job to actually trigger alerts when rates cross thresholds. Needs: periodic check + notification mechanism (SMS or in-app).
- **PaywallModal**: Not wired to actual Razorpay yet — opens with plan cards, shows "Coming soon" alert
- **Local rates other cities**: Only Delhi Mandoli seeded. Admin must paste real WhatsApp messages per hub to populate other cities.
- **Nifty/Sensex**: ^NSEI and ^BSESN may occasionally return null (Yahoo rate limits); gracefully shows "—"
- **LMEStrip in Navbar**: Currently uses `d.rates` fallback — should be updated to `d.metals` to match new `/live` shape
- **Lead/Tin DB fallback**: Only served if admin-pasted LME message is ≤7 days old; otherwise shows "—"
- **Forgot password**: Not implemented yet — email+password flow has no password reset
- **Email verification**: Not implemented — users can register with any email without confirming it
- **Contact page**: Phone/WhatsApp numbers are placeholder "XXXXX XXXXX" — update with real numbers
- **Marketplace commission**: 0.1% commission flow working in dev mode (instant payment) — needs Razorpay integration for production
- **Analytics layer**: Charts, market analysis, Hindi toggle — Phase 2 feature, not yet built

## Current Status (as of 2026-03-21, session 6)
- **Auth**: Email+password + Phone OTP (linkable accounts) + Google OAuth (plug-and-play) — all three working
- **Subscription**: Pro test user `test@metalxpress.in` / `test1234` — pro plan via PRO_EMAILS env var
- **Landing**: Hero section for non-logged-in users with feature cards and CTAs
- **Paywall**: Local rates blurred/gated for non-subscribers with "Sign Up" or "Upgrade to Pro" overlay
- **Marketplace**: Sell-only listings, deal flow with 0.1% commission gate, contact reveal after payment, admin verification (pending→verified→rejected), proper card layout (metal badge, grade title, ₹/kg), dark-styled dropdowns, 3-tab UI (Browse/Sell Scrap/My Listings)
- **Accordion**: All metals default-open, per-metal collapse, Expand/Collapse All button
- **Footer**: Company + Legal links on all consumer pages
- **Static pages**: About, Terms, Privacy, Contact — all styled in dark navy glass theme
- Live data: Yahoo Finance + Stooq + DB fallback (Lead, Tin)
- LME admin paste cutoff: 15 minutes
- Admin: Single unified smart parser — auto-detects message type
- metals-api.com: plug-and-play (set METALS_API_KEY in .env to activate)
- Google OAuth: plug-and-play (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)

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
    Marketplace.jsx                ← Browse/Post tabs, listing cards
    Alerts.jsx                     ← Price alerts (basic, old style — not updated yet)
    Admin.jsx                      ← Standalone layout, unified smart parser, auto-detect message type
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
    api.js                         ← Axios instance + all endpoints incl. registerEmail, loginEmail, checkSubscription
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
    marketplace.js                     ← GET/POST/DELETE listings, PATCH verify (admin), accepts metal name filter
  services/
    livePriceFetcher.js            ← Yahoo+Stooq+metals-api, returns {metals,forex,indices,crude,usdInr,lmeUpdatedAt,forexUpdatedAt}
    rateParser.js                  ← parseRateMessage, cleanText (exported), detectMessageType, extractMessageTimestamp
    lmeService.js, alertService.js
  middleware/
    auth.js
  prisma/
    schema.prisma                  ← User model: email+passwordHash (nullable), phone (nullable)
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
- **Marketplace commission**: 0.1% on total transaction value, paid upfront by buyer before MetalXpress reveals contact details. If deal doesn't go through after commission paid → credit wallet (reusable on next deal).
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

## Feature Roadmap
### Phase 1 — Live (current)
- LME/MCX/Forex live rates (Yahoo + Stooq)
- Admin WhatsApp unified smart parser (auto-detect local vs LME)
- Login with phone OTP
- Marketplace listing (post/browse)
- Price alerts (basic)

### Phase 2 — Deployment
- Railway backend + Vercel frontend
- PostgreSQL production DB seeded
- Admin pastes real WhatsApp rates to populate hub data
- MSG91 / Twilio for real SMS OTP

### Phase 3 — Monetization Live
- Razorpay subscription (Pro + Business tiers)
- PaywallModal fully wired (not just stub)
- Contact reveal gated behind Pro
- Local rates gated behind Pro

### Phase 4 — Automation
- metals-api.com key set → auto-update LME rates hourly
- Cron job: auto-refresh rates, send price alert SMS/push
- Listing verification / admin approval
- Separate admin app from consumer app

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
- `ioredis` / Redis installed but unused — can remove before production
- Admin page is standalone: NEVER render inside AppShell (no consumer Navbar)
- Home.jsx uses `d.metals` (not `d.rates`) from `/api/rates/live` — breaking change from old shape
- LMEStrip in Navbar still uses `d.rates` fallback — update to `d.metals` in next session
- WhatsApp bold Unicode: `𝐂𝐂𝐑` decodes with spaces → use `normGrade()` (strips all non-alphanumeric) for matching
- ⏰ emoji between date/time in timestamps → use `[^\d]+` not `\s+` in timestamp regex
- Admin-pasted LME change values are absolute (e.g., −100 USD/MT), NOT percentage → always use `absToChangePct()` before returning from `/live`
- `messageTimestampStr` is a pre-formatted display string (e.g., "20 Mar, 01:45 PM") — do NOT pass through `new Date()` or `date-fns` on frontend
- Shell testing Unicode on Windows: use Node.js test scripts with `\uXXXX` escapes instead of curl (curl mangles Unicode on Windows shells)
- Debug files `ali.json`, `hg.json`, `znc.json`, `backend-log.txt` in worktree root — add to `.gitignore`, do not commit
