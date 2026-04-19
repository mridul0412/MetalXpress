# ⚡ BhavX

India's Scrap Metal Rate Platform — replacing WhatsApp-based rate broadcasts with a clean, fast, mobile-first web app.

## Features

- **Live Rate Cards** — Copper, Brass, Aluminium, Lead, Zinc, MS and more with buy/sell prices
- **LME/MCX Strip** — Marquee-style live LME and MCX rates at the top
- **City Selector** — Delhi (Mandoli), Mumbai (Kurla/Dharavi), Ahmedabad, Chennai, Kolkata, Ludhiana, Jaipur, Kanpur, Hyderabad
- **WhatsApp Parser** — Paste raw WhatsApp messages → auto-parsed → saved to DB
- **Admin Panel** — Manage rates, contributors, view history
- **Marketplace** — Post and browse scrap lots by city and metal
- **Price Alerts** — Set buy/sell threshold alerts for any grade
- **Phone OTP Auth** — Login with Indian mobile number (dev OTP: 1234)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (optional) |
| Auth | Phone OTP → JWT |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

### 1. Clone and install

```bash
git clone <repo>
cd BhavX
npm run install:all
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bhavx"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-this-in-production"
ADMIN_PASSWORD="admin123"
LME_API_KEY="your-metals-api-key"  # Get from metals-api.com
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

Frontend env (optional):

```bash
# frontend/.env
VITE_API_URL=http://localhost:3001/api
```

### 3. Database setup

```bash
# Create the database
createdb bhavx

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed with reference data (Delhi Mandoli rates from WhatsApp message)
npm run seed
```

### 4. Run

```bash
# From root — runs both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Admin: http://localhost:5173/admin (password: `admin123`)

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis URL for caching | No |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `ADMIN_PASSWORD` | Admin panel password | Yes |
| `LME_API_KEY` | metals-api.com API key | No (uses DB cache) |
| `LME_API_URL` | Metals API endpoint | No |
| `PORT` | Backend port (default: 3001) | No |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes |

## API Reference

### Rates

```
GET  /api/rates/local?hub=mandoli-delhi    → local scrap rates for a hub
GET  /api/rates/lme                        → latest LME rates
GET  /api/rates/mcx                        → latest MCX rates
GET  /api/rates/forex                      → forex + indices
POST /api/rates/parse                      → parse raw WhatsApp message
POST /api/rates/manual                     → admin: save manual rates
POST /api/rates/save-parsed               → admin: save parsed rates
```

### Other

```
GET  /api/cities                           → all cities and hubs
GET  /api/metals                           → all metals and grades
POST /api/auth/request-otp                → request OTP
POST /api/auth/verify-otp                 → verify OTP, get JWT
GET  /api/marketplace/listings            → browse listings
POST /api/marketplace/listings            → create listing
POST /api/alerts                          → create price alert
GET  /api/alerts                          → user's alerts
GET  /api/admin/dashboard                 → admin dashboard stats
POST /api/admin/parse-preview             → parse without saving
```

## WhatsApp Message Parser

The parser at `POST /api/rates/parse` handles the exact format used in Indian scrap trading groups:

```
🏙️ DELHI SPOT RATE (MANDOLI)
🥇 COPPER
Armature Bhatti: 1140 + / 1230
Super D: 1280 (1.6MM: 1294)
...
LME RATES ($/MT)
Copper: 13141.5 (−69)
...
```

**Supported formats:**
- `GradeName: BuyPrice + / SellPrice`
- `GradeName: Price (VariantLabel: VariantPrice)`
- `GradeName: Price+` (single price)
- `GradeName: P1 / P2 / P3` (triple price)
- LME: `Metal: Price (±Change)`
- MCX: Same format as LME

## Admin Panel

Visit `/admin` — password is `admin123` in dev.

**Features:**
- **Dashboard** — stats + per-city last-updated times
- **Paste Rates** — paste WhatsApp message → preview parsed output → confirm save
- **Rate History** — all rate updates with timestamps
- **Contributors** — manage rate contributors per city
- **LME/MCX Override** — manual entry when API is unavailable

## Database Schema

Key models: `City`, `Hub`, `Metal`, `Grade`, `Rate`, `RateUpdate`, `Contributor`, `User`, `Alert`, `Listing`, `LMERate`, `MCXRate`, `ForexRate`

Run `npm run db:studio` from root to open Prisma Studio and browse data.

## Seed Data

The seed includes exact rates from the reference Delhi Mandoli WhatsApp message:
- All 9 cities and their hubs
- All 7 metals with all grades (26 grades total)
- Complete Delhi Mandoli spot rates (Copper, Brass, Aluminium, Lead, Zinc, Other, MS)
- LME rates (9 metals)
- MCX rates (9 metals)
- Forex rates (USD/INR, EUR/USD, Nifty, Sensex)
- 3 sample marketplace listings
- 1 admin contributor for Delhi

## Production Notes

- Replace `ADMIN_PASSWORD` with a strong password
- Set `NODE_ENV=production`
- Use a proper `JWT_SECRET` (32+ random chars)
- Get a real `LME_API_KEY` from [metals-api.com](https://metals-api.com)
- For SMS OTP, integrate MSG91 or Twilio in `backend/src/routes/auth.js`
- For WhatsApp alerts, add Twilio in `backend/src/services/alertService.js`
