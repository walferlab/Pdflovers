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

1. Frontend foundation and UI flows
2. Supabase schema and server data layer
3. Full-text search integration with ranking
4. Cache strategy (React Query + Vercel)
5. Image pipeline with Supabase Storage CDN
6. Download redirect API + tracking analytics

## Current Progress

- Next.js App Router project scaffolded from scratch.
- Responsive frontend routes:
  - `/` landing page
  - `/library` search and browse page
  - `/pdf/[id]` PDF detail page (random public ID route)
- Shared component structure:
  - site header/footer
  - hero/search block
  - category strip
  - reusable PDF card grid
- Google Ads UX-safe container component with reserved ad space and non-intrusive styling.
- Book share action (Web Share API with clipboard fallback).
- Cover-image fallback: deterministic random gradient from a curated palette when a book has no cover.
- Conditional metadata rendering: author/downloads/metrics boxes only render when values exist.
- Supabase-ready repository layer with fallback data:
  - `src/lib/pdfs/repository.js`
  - `src/lib/supabase/server.js`
- Postgres full text search path using `search_document` vector.
- Vercel cache layer using `unstable_cache` in repository functions.
- React Query actively used on library results:
  - `src/components/library/library-results.js`
- Redirect download API + tracking:
  - `/api/download/[id]?stage=smart|direct`
  - tracks `download_events` and updates `download_count` on direct clicks.
- Request/contact APIs connected for backend persistence:
  - `/api/request-pdf`
  - `/api/contact-us`
- Supabase schema reference added:
  - `supabase/schema.sql`
- PDF card list descriptions hidden as requested.

## Project Structure

```text
src/
  app/
    api/
    layout.js
    page.js
    library/page.js
    pdf/[id]/page.js
  components/
    ads/
    home/
    library/
    layout/
    pdf/
    seo/
    ui/
  lib/
    covers.js
    pdfs/repository.js
    pdf-data.js
    format.js
    seo.js
    supabase/server.js
  providers/
    query-provider.js
supabase/
  schema.sql
```

## Environment Variables

Copy `.env.example` to `.env.local` and set real values:

```bash
NEXT_PUBLIC_SITE_URL=https://pdflovers.app
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-verification-code
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=
NEXT_PUBLIC_GOOGLE_AD_SLOT_HOME=
NEXT_PUBLIC_GOOGLE_AD_SLOT_LIBRARY=
NEXT_PUBLIC_GOOGLE_AD_SLOT_DETAIL=
NEXT_PUBLIC_SMARTLINK_URL=
NEXT_PUBLIC_DIRECT_DOWNLOAD_URL=
```

## Supabase Setup

1. Run migrations from `supabase/migrations/` (or use `npx supabase db push`).
2. Insert PDF rows in `public.pdfs` (include `smart_link` and `download_url`).
3. `public_id` is auto-generated as a UUID and used in app URLs.

If Supabase env vars are missing, the app automatically falls back to local mock data.

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
