# Sentiment Dashboard (Next.js + Cloudflare Pages)

A small analytics app that visualizes market sentiment for Finnish large-cap companies. Data is fetched directly from Cloudflare R2 storage, with all processing and filtering done client-side for optimal performance.

## What it does

- Visualizes overall daily sentiment as a time series
- Shows sector-level averages as a heatmap
- Highlights top risers/fallers over a selectable window
- Lists top-scoring companies and most-rated companies
- Lets you browse to a company page for a focused view

## Tech stack

- Next.js 15, React 19, TypeScript, Tailwind
- Data fetched directly from Cloudflare R2 (bypasses Edge function limits)
- Zod for schema validation and safer parsing
- Deployed to Cloudflare Pages via `@cloudflare/next-on-pages`

## Live deployment

- Platform: Cloudflare Pages (Workers runtime)
- URL: https://inderes.pages.dev

## Architecture

This app leverages Cloudflare's infrastructure for optimal performance:

**Cloudflare Pages** hosts the static Next.js app:
- HTML, CSS, and JavaScript served from Cloudflare's global CDN
- Fast delivery from 300+ edge locations worldwide
- Built with `@cloudflare/next-on-pages` for Edge compatibility

**Cloudflare R2** provides data storage:
- Sentiment data stored as a JSON file in R2 (S3-compatible object storage)
- Fetched directly by the browser, bypassing Edge function CPU/memory limits
- Automatically cached by browsers and CDN for faster subsequent loads
- No API endpoints needed — simpler architecture, better performance

**Why direct R2 fetching?**
- Avoids Edge function timeout errors (503) with large datasets
- Reduces Cloudflare Workers invocations (cost savings)
- Leverages browser and CDN caching more effectively
- All data processing (filtering, aggregation) happens client-side in React

## Quick start (local development)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`

## Environment Variables

The app reads data from Cloudflare R2. Configure the data URL:

```bash
NEXT_PUBLIC_ANSWERS_DATA_URL=https://pub-aabfd900efaf4039995d56f686bb2c79.r2.dev/data.json.gz
```

This is set in `wrangler.toml` for production deployments. For local development, you can optionally create a `.env.local` file.

## Project scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — build the app
- `npm run start` — run the built app locally (port 8080)

## Deploying to Cloudflare Pages

Minimal flow using Next‑on‑Pages and Wrangler:

1. Build
   ```bash
   npx @cloudflare/next-on-pages
   ```
2. Deploy
   ```bash
   npx wrangler pages deploy
   ```