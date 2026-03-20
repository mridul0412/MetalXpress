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
- **Auth**: Phone OTP (dev OTP: 1234), JWT tokens in localStorage as `mx_token`
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
2026-03-20

## Session Log
- **2026-03-19**: Initial UI overhaul (Replit-quality design, LME/MCX panel, hub selector, Login, Admin, Marketplace)
- **2026-03-20 (session 1)**: Fixed Navbar not rendering (missing from App.jsx), rewrote CLAUDE.md, fixed Lead symbol (PB-USD→Stooq), added Forex+Indices+Crude display, city pills selector, standalone Admin layout, Login redesign (Google OAuth stub + phone OTP + profile), PaywallModal, plug-and-play API stubs for metals-api/Google/Razorpay/MSG91
- **2026-03-20 (session 2)**: Corrected CLAUDE.md — owner is semi-technical; fixed Live Data Sources table (Lead/Tin are DB fallback, not Stooq); fixed Stooq symbol case ni.f → NI.F in docs
- **2026-03-20 (session 3)**: Major fixes and unified Admin parser — see full details below

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

6. **Data priority in `/live`**: Admin paste (12h for LME, 10m for MCX/Forex) overrides Yahoo/Stooq. Yahoo is fallback.

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

## Known Remaining Issues
- **Alerts page**: Not updated in latest overhaul — still uses old style
- **PaywallModal**: Not wired to actual Razorpay yet — just a component stub
- **Login guard**: navigating via `window.location.href = '/login'` while logged-in redirects to home — expected behavior; consider adding explicit "logged-in" guard on Login page
- **Local rates other cities**: Only Delhi Mandoli seeded. Admin must paste real WhatsApp messages per hub to populate other cities.
- **Nifty/Sensex**: ^NSEI and ^BSESN may occasionally return null (Yahoo rate limits); gracefully shows "—"
- **LMEStrip in Navbar**: Currently uses `d.rates` fallback — should be updated to `d.metals` to match new `/live` shape
- **Lead/Tin DB fallback**: Only served if admin-pasted LME message is ≤7 days old; otherwise shows "—"

## Current Status (as of 2026-03-20, session 3)
- Live data: Yahoo Finance (Copper HG=F, Aluminium ALI=F, Zinc ZNC=F) + Stooq (Nickel NI.F) + DB fallback (Lead, Tin)
- Forex/Indices: Yahoo (USDINR=X, EURUSD=X, ^NSEI, ^BSESN, CL=F)
- Admin: Single unified smart parser — auto-detects message type, routes save correctly
- Local rates: Grade fuzzy-matching fixed (WhatsApp bold Unicode spaces handled)
- % change: All metals and forex show correct percentage (not raw absolute USD)
- Timestamps: WhatsApp message timestamp shown directly (IST-aware, no browser timezone issues)
- metals-api.com: plug-and-play (set METALS_API_KEY in .env to activate)
- Google OAuth: plug-and-play stub (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET)

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
2. **Admin-pasted LME** (from DB, ≤12h old) — overrides Yahoo for LME
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
  App.jsx                          ← AppShell pattern — Admin gets no consumer Navbar
  pages/
    Home.jsx                       ← LME/MCX table + Forex grid + city pills + metal accordion + 5-min auto-refresh
                                      Inline prices (₹buy / ₹sell), variant line, messageTimestampStr display
    Login.jsx                      ← 3-step: Welcome (Google+Phone) → Phone → OTP+Profile
    Marketplace.jsx                ← Browse/Post tabs, listing cards
    Alerts.jsx                     ← Price alerts (basic, old style — not updated yet)
    Admin.jsx                      ← Standalone layout, unified smart parser, auto-detect message type
  components/
    Navbar.jsx                     ← Sticky glass header + LMEStrip + mobile bottom nav
    LMEStrip.jsx                   ← Marquee ticker fetching /api/rates/live (uses d.rates fallback — update to d.metals)
    PaywallModal.jsx               ← Free/Pro/Business plan gate, Razorpay stub
    CitySelector.jsx               ← (legacy)
    MetalCard.jsx                  ← (legacy)
    RateTable.jsx                  ← (legacy)
    LMERatesPanel.jsx              ← (legacy)
  utils/
    api.js                         ← Axios instance + all endpoints incl. googleAuthUrl, updateProfile, checkSubscription
  context/
    AuthContext.jsx                ← phone/OTP auth, JWT in localStorage

backend/src/
  index.js                         ← Express app, CORS, rate limit, cron alerts
  routes/
    rates.js                       ← GET /api/rates/live (new shape), /local (with messageTimestampStr), POST save-parsed
                                      absToChangePct(), fxChangePct(), normGrade(), extractDisplayTs() helpers
    auth.js                        ← OTP + /me + PATCH /profile + GET /subscription + Google OAuth routes
    cities.js                      ← GET /api/cities (returns plain array [{id,name,hubs:[]}])
    metals.js, marketplace.js, alerts.js, admin.js
  services/
    livePriceFetcher.js            ← Yahoo+Stooq+metals-api, returns {metals,forex,indices,crude,usdInr,lmeUpdatedAt,forexUpdatedAt}
    rateParser.js                  ← parseRateMessage, cleanText (exported), detectMessageType, extractMessageTimestamp
    lmeService.js, alertService.js
  middleware/
    auth.js
  prisma/
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

### OTP verification
```js
const res = await verifyOTP({ phone, otp, name, traderType, city });
const { token, user } = res.data;
login(token, user);
```

## Monetization Model
- **Free tier**: LME/MCX live rates, Forex & Indices, Marketplace browsing
- **Pro ₹299/month**: Local spot rates for all cities, 10 contact reveals/month, unlimited alerts
- **Business ₹999/month**: Everything Pro + unlimited contacts + bulk listing + priority support
- **Commission**: Future — fee on verified deals closed via platform
- **PaywallModal**: Currently a stub — Razorpay integration pending

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
