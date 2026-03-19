# MetalXpress — Project Context & Requirements

## What This App Is
MetalXpress is a real-time scrap metal rate platform for Indian traders. Replaces WhatsApp broadcast messages with a clean, organized mobile-first web app. End consumers see live rates; admin pastes WhatsApp messages to update them.

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

## Design System (current — dark navy glass)
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

## Live Data Source (free, no API key)
- **Yahoo Finance v8**: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=5d`
  - Copper: `HG=F` (USD/lb → ×2204.62 → USD/MT)
  - Aluminium: `ALI=F` (USD/MT direct)
  - Zinc: `ZNC=F` (USD/MT direct)
  - Lead: `PB-USD` (USD/lb → ×2204.62 → USD/MT)
  - USD/INR: `USDINR=X`
- **Stooq CSV**: `https://stooq.com/q/d/l/?s=ni.f&i=d` for Nickel (¢/lb → ×22.0462 → USD/MT)
- **MCX (₹/kg)** = `LME_USD_per_MT × USD_INR / 1000`
- Gold/Silver excluded (not scrap metals, unit conversions produce absurd values)
- Service: `backend/src/services/livePriceFetcher.js`
- Endpoint: `GET /api/rates/live` — fetches live every call, no DB write

## File Structure
```
frontend/src/
  App.jsx                          ← Router + AuthProvider + Navbar wrapper
  pages/
    Home.jsx                       ← LME/MCX table + hub selector + metal accordion cards
    Login.jsx                      ← Glass card OTP flow, gold branding
    Marketplace.jsx                ← Browse/Post tabs, listing cards
    Alerts.jsx                     ← Price alerts (basic)
    Admin.jsx                      ← LocalRatesPanel + WhatsAppParserPanel (red-accented)
  components/
    Navbar.jsx                     ← Sticky glass header + LMEStrip + mobile bottom nav
    LMEStrip.jsx                   ← Marquee ticker fetching /api/rates/live
    CitySelector.jsx               ← (legacy, hub select now inline in Home.jsx)
    MetalCard.jsx                  ← (legacy, accordion now inline in Home.jsx)
    RateTable.jsx                  ← (legacy)
    LMERatesPanel.jsx              ← (legacy, replaced by inline section in Home.jsx)
  utils/
    api.js                         ← Axios instance, baseURL = VITE_API_URL || '/api', JWT interceptor
  context/
    AuthContext.jsx                ← phone/OTP auth, JWT in localStorage

backend/src/
  index.js                         ← Express app, CORS, rate limit, cron alerts
  routes/
    rates.js                       ← GET /api/rates/live, /local, /lme, POST /lme (admin)
    cities.js                      ← GET /api/cities (returns plain array [{id,name,hubs:[]}])
    metals.js, auth.js, marketplace.js, alerts.js, admin.js
  services/
    livePriceFetcher.js            ← Yahoo Finance + Stooq fetcher (CommonJS)
    lmeService.js, rateParser.js, alertService.js
  middleware/
    auth.js
  prisma/
    seed.js                        ← Seeds cities, hubs, metals, grades, sample listings
```

## Key Code Patterns

### Cities API parsing (MUST use this pattern)
```js
// GET /api/cities returns a plain array, not {cities:[]}
const cities = Array.isArray(d) ? d : (d.cities || []);
const allHubs = cities.flatMap(c => c.hubs || []);
```

### OTP verification (MUST use this pattern)
```js
// verifyOTP takes a single object, returns axios response
const res = await verifyOTP({ phone, otp });
const token = res.data.token;
```

### API base URL
```js
// api.js uses VITE_API_URL env var or falls back to '/api' (for same-origin prod deploys)
const baseURL = import.meta.env.VITE_API_URL || '/api';
```

## WhatsApp Message Format (standard admin input)
```
𝗠𝗘𝗧𝗔𝗟 𝗦𝗧𝗘𝗘𝗟 𝗫𝗣𝗥𝗘𝗦𝗦 𝟮.𝟬🔥
16-03-26 03:29:51 PM
━━━━━━━━━━━━━━━━━━
🌐 𝐋𝐌𝐄 𝐑𝐀𝐓𝐄𝐒 ($/𝐌𝐓)
🥇 Copper: 12746.5 (−100)
...
🇮🇳 𝐌𝐂𝐗 𝐑𝐀𝐓𝐄𝐒 (₹/𝐊𝐠)
🥇 Copper: 1172.65 (−14.75)
...
💱 𝐅𝐎𝐑𝐄𝐗 & 📊 𝐈𝐍𝐃𝐈𝐂𝐄𝐒
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
- Auth: PAT stored in Windows Credential Manager (set up via git credential approve)

## Current Status (as of 2026-03-19)
- ✅ Navbar working (top bar + LME ticker strip + mobile bottom nav)
- ✅ LME/MCX table with live Yahoo Finance data (Copper, Aluminium, Zinc, Lead, Nickel)
- ✅ Hub selector (Naroda, Ambattur, Mandoli, etc.) — data from seeded DB
- ✅ Metal accordion cards with framer-motion animation (show when DB has rates)
- ✅ Login page — OTP flow, glass card, gold branding
- ✅ Marketplace — Browse/Post tabs, listing cards, filter by metal/city
- ✅ Admin — red-accented login, WhatsApp parser panel, local rates panel
- ⚠️  Local rates show "No rates available" — seeded DB lacks rates per hub; admin needs to paste WhatsApp message to populate
- ⚠️  OTP is hardcoded `1234` in dev (no real SMS)
- ❌ Not yet deployed (next step)

## Pending / Next Steps
1. **Deployment** — Railway (backend + PostgreSQL) + Vercel or serve frontend from Express
2. **Seed real rate data** — Admin to paste WhatsApp message for each hub
3. **SMS OTP** — Twilio/MSG91 integration
4. **Alerts page** — Not updated in latest overhaul
5. **Admin parser end-to-end** — Parse + save flow needs full test with live DB
6. **Redis** — Listed as dependency in package.json but not used; remove or stub

## Known Issues / Gotchas
- `@apply bg-gold` in CSS fails → use direct CSS property values
- `spawn npm ENOENT` on Windows → use `cmd /c npm run dev` in launch.json
- `GET /api/cities` returns plain `[]`, not `{ cities: [] }` — always use `Array.isArray(d)` check
- Redis in backend/package.json but never required in code — harmless but worth cleaning
- `ioredis` installed but unused — can be removed before production
