# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for a Venezuelan exchange rate tracking system. Scrapes official BCV (Banco Central de Venezuela) and Binance P2P rates for USD/EUR → VES, stores them in PostgreSQL, and displays them in a mobile app.

## Commands

```bash
# From root — all commands use Bun workspaces
bun install                  # Install all workspace dependencies
bun run api:dev              # Start API with nodemon + ts-node
bun run api:build            # Compile API TypeScript → dist/
bun run api:start            # Run compiled API (node dist/server.js)
bun run mobile:start         # Start Expo dev server
bun run mobile:android       # Run on Android
bun run mobile:ios           # Run on iOS
bun run mobile:prebuild      # Expo prebuild (generate native projects)

# From within apps/api/
bun run type-check           # tsc --noEmit

# From within apps/mobile/
bun start                    # Expo dev server
```

No linter or test runner is configured yet.

## Architecture

### Monorepo Structure

- **`apps/api`** (`@bcv-exchange/api`) — Express v5 REST API, TypeScript, PostgreSQL
- **`apps/mobile`** (`@bcv-exchange/mobile`) — React Native / Expo SDK 54, NativeWind (Tailwind)
- **`packages/`** — Empty, reserved for shared packages (types, utils)

### API (`apps/api/src/`)

Layered architecture: **Routes → Services → Models → Database**

- **`server.ts`** — Entry point: creates DB tables, starts scheduler, listens on PORT
- **`app.ts`** — Express app with middleware stack (helmet, cors, rate limiter, error handler)
- **`routes/`** — `rates.ts` (BCV endpoints), `binance.ts` (P2P endpoints), `index.ts` (health check)
- **`services/`** — Business logic, orchestrates providers and models
- **`providers/`** — Data source scrapers extending `BaseProvider`: `BCVProvider` (Cheerio HTML scraping), `BinanceProvider` (Binance P2P API)
- **`models/Rate.ts`** — PostgreSQL queries (CRUD with UPSERT)
- **`jobs/scheduler.ts`** — node-cron jobs in Caracas timezone (BCV: 9:01/13:01, Binance: 9:00/13:00/18:00)
- **`config/database.ts`** — pg Pool + table creation; **`config/enviroment.ts`** — env loader (note: filename typo is intentional, don't rename)
- **`types/index.ts`** — Shared TypeScript interfaces

Key API endpoints: `GET /api/rates/latest`, `GET /api/rates/history`, `GET /api/binance/live`, `POST /api/rates/update`

### Mobile (`apps/mobile/`)

- **`App.tsx`** — Root component with bottom tab navigation (Home, Charts, History)
- **`src/services/api.ts`** — API client using fetch, points to Render deployment
- **`src/constants/index.ts`** — Colors, currency definitions
- **`src/types/index.ts`** — TypeScript interfaces (ExchangeRate, BinanceLiveRate, ApiResponse)
- Path alias: `@/*` maps to `src/*`
- Styling: NativeWind with `globals.css` for Tailwind directives

The mobile app is in prototype stage — screens have placeholder data, `src/components/`, `src/hooks/`, `src/screens/`, and `src/utils/` directories exist but are empty.

## Key Details

- **Runtime:** API uses CommonJS (`"type": "commonjs"`), mobile uses Expo's module system
- **Database:** Single `exchange_rates` table with JSONB metadata column, unique constraint on (provider, currency_from, currency_to, date, update_type)
- **API is deployed** on Render at the URL in `apps/mobile/src/constants/index.ts`
- **Environment:** API requires `.env` with `DATABASE_URL`, `PORT`, etc. — see `.env.example`
- API tsconfig extends root tsconfig; mobile tsconfig extends `expo/tsconfig.base` (does NOT extend root)
