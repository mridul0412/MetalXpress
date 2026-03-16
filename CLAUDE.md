# MetalXpress — Project Context & Requirements

## What This App Is
MetalXpress is a real-time scrap metal rate platform for Indian traders. It replaces WhatsApp broadcast messages with a clean, organized mobile-first web app. End consumers see live rates; admin pastes WhatsApp messages to update them.

## Owner Preferences (MUST FOLLOW)
- **Accent**: Gold (`#CFB53B`) + Black (`#0D0D0D`). Blue only for secondary actions.
- **Font**: JetBrains Mono / monospace throughout.
- **Style**: Clean, minimal, no clutter. Large readable rate numbers. Neat cards.
- **Mobile-first**: Most users are on mobile (traders on the go).

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (port 5173)
- **Backend**: Node/Express + Prisma + PostgreSQL (port 3001)
- **Auth**: Phone OTP (dev OTP: 1234), JWT tokens in localStorage as `mx_token`
- **Admin auth**: Password in localStorage as `mx_admin_pass`, sent as `x-admin-password` header

## Key Requirements (from owner, 2026-03-17)

### UI
- Proper banner/header on home page with MetalXpress branding
- Top section: prominent LME/MCX/Forex rates grid (like WhatsApp format)
- Below: city/hub filter, then local scrap metal rate cards
- Neat, clean — Replit-quality or better

### LME/MCX Rates
- Top panel on home: show LME ($/MT) + MCX (₹/Kg) + Forex side by side
- Format mirrors WhatsApp: Metal name, price, change (colored green/red)
- Real-time where possible; admin can also paste WhatsApp message to update
- Refresh button with "last updated" timestamp

### Admin (separate from end consumer app eventually)
- WhatsApp message parser: ONLY for local city hub rates (not LME/MCX - separate tab)
- Separate LME/MCX update from local rate update (two tabs or sections)
- Parser must work reliably with the standard WhatsApp format shown below

### WhatsApp Message Format (standard input)
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
🛢️ Crude: 99.18 (−0.12)
💎 Gold Oz: 4975.14 (−43.2877)
💎 Silver Oz: 77.81 (−2.7414)
━━━━━━━━━━━━━━━━━━
🇮🇳 𝐌𝐂𝐗 𝐑𝐀𝐓𝐄𝐒 (₹/𝐊𝐠)
━━━━━━━━━━━━━━━━━━
🥇 Copper: 1172.65 (−14.75)
🥈 Aluminium: 343.35 (−2.75)
⚡ Nickel: 1561 (−12.9)
⚫ Lead: 186.05 (−2.55)
🔵 Zinc: 321.8 (−2.65)
🛢️ Crude: 9181 (+131)
💎 Gold: 155246 (−3220)
💎 Silver: 249058 (−10377)
⚡ Natural Gas: 288.7 (−3.2)
━━━━━━━━━━━━━━━━━━
💱 𝐅𝐎𝐑𝐄𝐗 & 📊 𝐈𝐍𝐃𝐈𝐂𝐄𝐒
━━━━━━━━━━━━━━━━━━
💱 USD/INR: 92.409 (−0.101)
💱 EUR/USD: 1.1449 (+0.0033)
📊 Nifty: 23434.85 (+283.75)
📊 Sensex: 75610.43 (+1046.51)
━━━━━━━━━━━━━━━━━━
📞 7007789160
```

### Login
- Clean professional OTP login page
- Proper branding (gold + black)
- Trader type selection after OTP verification

### Marketplace
- Buy/sell scrap metal lots
- Requires login to post
- Show metal, grade, quantity, price/kg or "Best Offer"
- Contact via call or WhatsApp
- Listing verification / admin approval (future)

### Authentication & Verification
- Users verified via phone OTP
- Listings should eventually require verification
- Admin has separate auth (password-based)
- JWT tokens expire, handled via 401 interceptor in api.js

## File Structure
```
frontend/src/
  pages/       Home, Login, Marketplace, Alerts, Admin
  components/  Navbar, LMEStrip, LMERatesPanel, CitySelector, MetalCard, RateTable, MarketplaceListing
  utils/       api.js (axios instance with auth interceptors)
  context/     AuthContext.jsx

backend/src/
  routes/      rates, cities, metals, auth, marketplace, alerts, admin
  services/    lmeService, rateParser, alertService
  middleware/  auth
  prisma/      seed.js
```

## Dev Commands
```bash
# From repo root:
npm run dev:frontend   # starts Vite on port 5173
npm run dev:backend    # starts Nodemon on port 3001

# Database:
cd backend && npx prisma db push    # sync schema
cd backend && npm run seed          # seed data
```

## API Key Notes
- LME_API_KEY in backend/.env — currently "demo" (no real-time metal prices)
- LME/MCX rates updated via admin WhatsApp message paste
- Forex (USD/INR) can optionally be fetched from free APIs

## Future Plans
- Separate admin app from consumer app
- Real LME/MCX API integration (metals-api.com or twelvedata.com)
- SMS OTP via Twilio/MSG91
- Push notifications for price alerts
- User listing verification system
