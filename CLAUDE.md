# MetalXpress — Project Context & Requirements

## What This App Is
MetalXpress is a real-time scrap metal rate platform for Indian traders. It replaces WhatsApp broadcast messages with a clean, organized mobile-first web app. End consumers see live rates; admin pastes WhatsApp messages to update them.

## Owner Preferences (MUST FOLLOW)
- **Accent**: Gold (`#CFB53B`) + Black (`#0D0D0D`). Blue only for secondary actions.
- **Font**: JetBrains Mono / monospace throughout.
- **Style**: Dark navy glass-panel aesthetic. Large readable rate numbers. Minimal clutter.
- **Mobile-first**: Most users are on mobile (traders on the go).

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
- **2026-03-20**: Fixed Navbar not rendering (missing from App.jsx), rewrote CLAUDE.md, fixed Lead symbol (PB-USD→Stooq), added Forex+Indices+Crude display, city pills selector, standalone Admin layout, Login redesign (Google OAuth stub + phone OTP + profile), PaywallModal, plug-and-play API stubs for metals-api/Google/Razorpay/MSG91

## Known Remaining Issues (to address next session)
- Lead/Tin change% shows absolute value (e.g. −46 USD) not percentage — parser stores absolute change from WhatsApp message, UI displays it as %
- Login page routing: navigating via `window.location.href = '/login'` while logged-in redirects to home — expected behavior but worth adding explicit "logged-in" guard
- Local rates still show "No rates available" for most hubs — admin needs to paste WhatsApp messages per city to populate; seeded data only has some hubs
- WhatsApp parser end-to-end not tested live — needs real message paste in admin panel to verify grades save correctly
- PaywallModal not wired to actual paywalls yet — just a component stub (connect when Razorpay key is ready)
- Alerts page not updated in latest overhaul — uses old style
- Nifty/Sensex symbols: ^NSEI and ^BSESN may occasionally return null (Yahoo rate limits); currently shows "—" gracefully

## Current Status (as of 2026-03-20)
- Live data: Yahoo Finance (Copper HG=F, Aluminium ALI=F, Zinc ZNC=F) + Stooq (Nickel ni.f, Lead pb.f, Tin sn.f)
- Forex/Indices: Yahoo (USDINR=X, EURUSD=X, ^NSEI, ^BSESN, CL=F)
- metals-api.com: plug-and-play (set METALS_API_KEY in .env to activate real LME spot)
- Google OAuth: plug-and-play stub (set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET to activate)
- Admin page: standalone layout (no consumer Navbar), hub selector dropdown, 3s success toast
- Login: 3-step flow (Welcome → Phone → OTP+Profile), Google button shown/grayed based on env
- Home: city selector pills (not hub names), Forex & Indices grid below LME table, 5-min auto-refresh local
- PaywallModal: Free/Pro/Business plan cards, Razorpay stub
- App.jsx: Admin gets no consumer Navbar (AppShell pattern)

## Live Data Sources
### Metals (backend/src/services/livePriceFetcher.js)
| Metal     | Source  | Symbol  | Unit → conversion     |
|-----------|---------|---------|----------------------|
| Copper    | Yahoo   | HG=F    | USD/lb × 2204.62     |
| Aluminium | Yahoo   | ALI=F   | USD/MT direct        |
| Zinc      | Yahoo   | ZNC=F   | USD/MT direct        |
| Nickel    | Stooq   | ni.f    | ¢/lb × 22.0462       |
| Lead      | Stooq   | pb.f    | ¢/lb × 22.0462 (NOT PB-USD — that's Petrobras stock) |
| Tin       | Stooq   | sn.f    | ¢/lb × 22.0462       |

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
  forex:   { usdInr, eurUsd, usdInrChange, eurUsdChange },
  indices: { nifty, sensex, niftyChange, sensexChange },
  crude:   { price, change },
  usdInr,        // root-level alias for MCX conversion convenience
  fetchedAt,     // ISO timestamp
}
```

**Breaking change from previous shape**: `d.rates` is now `d.metals` in frontend code.

## MCX Conversion
MCX (₹/kg) = LME_USD_per_MT × usdInr / 1000

## File Structure
```
frontend/src/
  App.jsx                          ← AppShell pattern — Admin gets no consumer Navbar
  pages/
    Home.jsx                       ← LME/MCX table + Forex grid + city pills + metal accordion + 5-min auto-refresh
    Login.jsx                      ← 3-step: Welcome (Google+Phone) → Phone → OTP+Profile
    Marketplace.jsx                ← Browse/Post tabs, listing cards
    Alerts.jsx                     ← Price alerts (basic)
    Admin.jsx                      ← Standalone layout, own top bar, hub selector dropdown, 3s success toast
  components/
    Navbar.jsx                     ← Sticky glass header + LMEStrip + mobile bottom nav
    LMEStrip.jsx                   ← Marquee ticker fetching /api/rates/live
    PaywallModal.jsx               ← (NEW) Free/Pro/Business plan gate, Razorpay stub
    CitySelector.jsx               ← (legacy)
    MetalCard.jsx                  ← (legacy)
    RateTable.jsx                  ← (legacy)
    LMERatesPanel.jsx              ← (legacy)
  utils/
    api.js                         ← Axios instance + all endpoints including googleAuthUrl, updateProfile, checkSubscription, fetchLivePricesDetailed
  context/
    AuthContext.jsx                ← phone/OTP auth, JWT in localStorage

backend/src/
  index.js                         ← Express app, CORS, rate limit, cron alerts
  routes/
    rates.js                       ← GET /api/rates/live (new shape), /local, /lme, POST manual/save-parsed
    auth.js                        ← OTP + /me + PATCH /profile + GET /subscription + Google OAuth routes
    cities.js                      ← GET /api/cities (returns plain array [{id,name,hubs:[]}])
    metals.js, marketplace.js, alerts.js, admin.js
  services/
    livePriceFetcher.js            ← Yahoo+Stooq+metals-api, returns {metals,forex,indices,crude,usdInr}
    lmeService.js, rateParser.js, alertService.js
  middleware/
    auth.js
  prisma/
    seed.js                        ← Seeds cities, hubs, metals, grades, sample listings
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

### City selection in Home.jsx
```js
// selectedCity is the full city object {id, name, hubs:[{id,slug,name}]}
// Hub slug for local rates fetch:
const hubSlug = selectedCity?.hubs?.[0]?.slug;
```

### Admin hub selector
```js
// Admin fetches cities to populate hub dropdown
// grouped as: <option>Delhi — Mandoli</option>
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
| Stooq | Nickel, Lead, Tin futures | Free (no key) | — |
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
- Admin WhatsApp parser (local city hub rates)
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
```
𝗠𝗘𝗧𝗔𝗟 𝗦𝗧𝗘𝗘𝗟 𝗫𝗣𝗥𝗘𝗦𝗦 𝟮.𝟬🔥
16-03-26 03:29:51 PM
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

## Dev Commands
```bash
# From repo root:
npm run dev:frontend   # Vite on port 5173
npm run dev:backend    # Nodemon on port 3001

# Database:
cd backend && npx prisma db push    # sync schema
cd backend && npm run seed          # seed cities/hubs/metals/grades
```

## GitHub
- Repo: `https://github.com/mridul0412/MetalXpress`
- Working branch: `claude/great-goldwasser`
- Push to main: `git push origin claude/great-goldwasser:main`

## Known Issues / Gotchas
- `@apply bg-gold` in CSS fails → use direct CSS property values
- `spawn npm ENOENT` on Windows → use `cmd /c npm run dev` in launch.json
- `GET /api/cities` returns plain `[]`, not `{ cities: [] }` — always use `Array.isArray(d)` check
- `PB-USD` on Yahoo Finance is Petrobras stock (Brazil oil), NOT Lead metal → use Stooq `pb.f`
- Stooq returns CSV with header row starting with "Symbol" — skip those lines in parser
- metals-api.com returns rates as `1 USD = N units of metal (troy oz)` → invert to get USD/troy oz
- `ioredis` / Redis installed but unused — can remove before production
- Admin page is standalone: never render inside AppShell (no consumer Navbar)
- Home.jsx uses `d.metals` (not `d.rates`) from `/api/rates/live` — breaking change from old shape
- LMEStrip in Navbar also calls `/api/rates/live` — it uses `d.rates` fallback, update if needed
