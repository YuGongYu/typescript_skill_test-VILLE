# Sentiment Dashboard (Next.js + Cloudflare Pages)

A high-performance analytics app that visualizes market sentiment for Finnish large-cap companies. Built with **Static Site Generation (SSG)** - all pages pre-rendered at build time with data from Cloudflare R2.

## Features

- Daily sentiment time series with customizable smoothing
- Sector-level heatmap and top movers analysis
- Company detail pages with attribute breakdowns
- Interactive client-side filtering and date range selection

## Tech stack

- **Next.js 15** with Static Site Generation
- **React 19**, TypeScript, Tailwind CSS
- Deployed to **Cloudflare Pages** via `@cloudflare/next-on-pages`

## Architecture

**SSG Approach:**
- Data fetched once from Cloudflare R2 during build
- 7 pages pre-rendered (home + 6 company pages)
- All data embedded in HTML - no API calls at runtime
- Interactive filters run client-side

**Benefits:**
- ⚡ Instant page loads from global CDN
- 💰 Cost-effective (no compute per request)
- 🚀 Infinitely scalable (pure static files)

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Environment Variables

Set `NEXT_PUBLIC_ANSWERS_DATA_URL` to your R2 data source:

```bash
NEXT_PUBLIC_ANSWERS_DATA_URL=https://pub-aabfd900efaf4039995d56f686bb2c79.r2.dev/data.json.gz
```

For local dev, create `.env.local`. For production, set in `wrangler.toml` or Cloudflare dashboard.

## Scripts

**Development:**
- `npm run dev` - Next.js dev server
- `npm run build` - Build with SSG

**Cloudflare Pages:**
- `npm run pages:build` - Build for Cloudflare
- `npm run pages:deploy` - Build and deploy

## Deployment

### Via CLI:
```bash
npm run pages:deploy
```

### Cloudflare Dashboard:
- **Build command:** `npm run pages:build`
- **Output directory:** `.vercel/output/static`
- **Environment variable:** `NEXT_PUBLIC_ANSWERS_DATA_URL`

**Live URL:** https://inderes.pages.dev