# MetalXpress — Claude Context

## What This Project Is
India's scrap metal rate platform. Replaces WhatsApp-based rate broadcasts with a clean, mobile-first web app for scrap metal traders.

## Current Status
- Full-stack app is built and committed
- Branch: `claude/metalxpress-platform-CzcmZ`
- Working directory: `/home/user/MetalXpress` (or local Downloads/MetalXpress)

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS (port 5173)
- **Backend**: Node.js + Express (port 3001)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (optional)
- **Auth**: Phone OTP → JWT (dev OTP: `1234`)

## Key Commands
```bash
npm run dev          # run both frontend + backend
npm run install:all  # install all dependencies
npm run seed         # seed DB with reference data
npm run db:studio    # open Prisma Studio
```

## Folder Structure
```
MetalXpress/
├── frontend/        # React app
├── backend/         # Express API
│   ├── src/
│   │   ├── routes/  # API routes
│   │   ├── services/
│   │   └── prisma/  # DB schema + migrations
│   └── .env         # environment config (copy from .env.example)
├── package.json     # root — runs both frontend + backend
└── CLAUDE.md        # this file
```

## Environment Setup (backend/.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/metalxpress"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-this-in-production"
ADMIN_PASSWORD="admin123"
LME_API_KEY="your-metals-api-key"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

## Key Features Built
- Live rate cards (Copper, Brass, Aluminium, Lead, Zinc, MS, etc.)
- LME/MCX marquee strip
- City selector (9 cities: Delhi Mandoli, Mumbai Kurla/Dharavi, Ahmedabad, Chennai, Kolkata, Ludhiana, Jaipur, Kanpur, Hyderabad)
- WhatsApp message parser (paste raw message → auto-parsed → saved to DB)
- Admin panel at `/admin` (password: `admin123`)
- Marketplace — post/browse scrap lots
- Price alerts — threshold alerts per grade
- Phone OTP auth

## API Endpoints
```
GET  /api/rates/local?hub=mandoli-delhi
GET  /api/rates/lme
GET  /api/rates/mcx
GET  /api/rates/forex
POST /api/rates/parse
POST /api/rates/manual
GET  /api/cities
GET  /api/metals
POST /api/auth/request-otp
POST /api/auth/verify-otp
GET  /api/marketplace/listings
POST /api/marketplace/listings
POST /api/alerts
GET  /api/alerts
GET  /api/admin/dashboard
```

## Git Branch
Always develop on: `claude/metalxpress-platform-CzcmZ`
Push with: `git push -u origin claude/metalxpress-platform-CzcmZ`

## Owner Context
- User is non-technical, working via Claude Code desktop app
- Goal: get this running locally, then potentially deploy
- Next steps to discuss: local DB setup, running the app, any UI/feature changes
