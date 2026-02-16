# PDF Lovers

A Next.js App Router platform for discovering and downloading curated PDFs.

## Target Architecture

- Frontend: Next.js App Router
- Backend DB: Supabase Postgres
- Search: Postgres Full Text Search
- Caching: React Query + Vercel Cache
- Images: Supabase Storage CDN
- Downloads: Redirect API + tracking

## Step-by-Step Build Plan

1. Frontend foundation and UI flows (current step)
2. Supabase schema and server data layer
3. Full-text search integration with ranking
4. Cache strategy (React Query + Vercel)
5. Image pipeline with Supabase Storage CDN
6. Download redirect API + tracking analytics

## Step 1 Delivered

- Next.js App Router project scaffolded from scratch.
- Responsive frontend routes:
  - `/` landing page
  - `/library` search and browse page
  - `/pdf/[slug]` PDF detail page shell
- Shared component structure:
  - site header/footer
  - hero/search block
  - category strip
  - reusable PDF card grid
- React Query provider wired at app root (for upcoming Supabase data fetching).
- Frontend-only mock data utilities for quick UI iteration.

## Project Structure

```text
src/
  app/
    layout.js
    page.js
    library/page.js
    pdf/[slug]/page.js
  components/
    home/
    layout/
    pdf/
    ui/
  lib/
    pdf-data.js
    format.js
  providers/
    query-provider.js
```

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```
