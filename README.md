# Trade Journal

> [فارسی](README.fa.md)

Trading journal on Cloudflare Workers + D1 + React SPA.

## 🔗 نصب خودکار / One-Click Install

**[👉 نصب‌کننده خودکار](https://mram-dev.github.io/trade-journal/)**

## Setup

```bash
# 1. Install
npm install
cd client && npm install && cd ..

# 2. Create D1 database
npx wrangler d1 create trade-journal-db
# → copy the database_id to wrangler.toml

# 3. Set password
echo "ADMIN_PASSWORD=your-password" > .dev.vars

# 4. Build & deploy
cd client && npm run build && cd ..
node scripts/gen-assets.mjs
CLOUDFLARE_API_TOKEN=<your-token> npx wrangler deploy
```

## Dev

```bash
npx wrangler dev          # Worker + D1 (local)
cd client && npm run dev   # React dev server (port 5173, proxies /api to worker)
```

## Project structure

```
wrangler.toml          # Worker config + D1 binding
src/index.js           # Hono API (auth, trades, accounts, strategies, journal, stats)
src/db.js              # D1 schema + CRUD helpers
src/static-assets.js   # Generated — inline SPA (HTML/CSS/JS) for Workers
scripts/gen-assets.mjs # Builds static-assets.js from client/dist
client/                # React + Vite + Tailwind SPA
MT5-EA/                # MetaTrader 5 Expert Advisor for auto-sync
```

## MT5 sync

Copy `MT5-EA/TradeJournalSync.mq5` to your MT5 `Experts/` folder, attach to a chart. It syncs open positions every 30s and closed deals on trade events.

## Import

Supports: MT4/MT5 HTML report, CSV, XLSX. From the Trades page → Import → select file.

The importer auto-detects:
- **Positions** table (MT5 Trade History Report — recommended, includes entry+exit+profit)
- **Deals** table (paired by Order#)
- **MT4** format (Ticket/Item headers)

## Environment

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Login password (set via `.dev.vars` or Worker env) |
| `CLOUDFLARE_API_TOKEN` | For `wrangler deploy` |
