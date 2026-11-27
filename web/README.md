# Luxury Pawnshop — 3D showroom website

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style components · Framer Motion · Three.js / React Three Fiber / Drei · Supabase (optional).

## Run

```bash
cd web
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
```

Admin: `/admin` (dev password `admin` when `ADMIN_PASSWORD` is not set; **set it in production**).

## What's inside

| Area | Where |
|---|---|
| Hero 3D carousel (drag / swipe / wheel / keys / arrows / dots, autoplay with hover pause, snap, zoom pulse, click-to-open) | `components/hero/hero.tsx`, `components/three/carousel-scene.tsx` |
| Procedural photoreal products (gold set, watch with live hands, phone, laptop, tablet, camera + console) and studio lighting — no model downloads | `components/three/models.tsx`, `materials.ts`, `studio.tsx` |
| Category pages with turntable viewer + matching valuation tool | `app/categories/[id]` |
| Gold calculator (price/gram, troy ounce, purity, weight, pledge/buyout) | `components/sections/gold-calculator.tsx` |
| Device valuation (brand, model, specs, condition, battery, accessories, photo upload, range) | `components/sections/device-valuation.tsx`, catalog in `lib/devices.ts` |
| How it works, offers, branches (map, hours, phone, WhatsApp, directions) | `components/sections/*` |
| Admin dashboard: requests (status, notes, photos), prices & rates, branches CRUD, offers CRUD | `app/admin`, `components/admin/dashboard.tsx` |
| Data layer: Supabase when configured, else `./.data/db.json` | `lib/db/*`, schema in `supabase/migrations/0001_init.sql` |

## Brand / logo

No logo file was supplied yet. Replace `public/brand/logo.svg` with the company logo and edit `lib/site.ts`
(name, phone, WhatsApp). Palette tokens live in `app/globals.css` (`@theme`).

## Supabase

1. Run `supabase/migrations/0001_init.sql` in the SQL editor (creates tables, RLS, private `valuation-photos` bucket, demo branches).
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only) in the environment.

## Fallback images

`public/fallback/*.png` are rendered from the real 3D models and used when WebGL is unavailable,
while the scene boots, and in cards. After changing a model: run the dev server, then `npm run fallbacks`.

## Performance & accessibility

Lazy-loaded 3D (client-only dynamic import), lower DPR/effects on mobile and weak devices, rendering pauses
when the hero is off-screen, `prefers-reduced-motion` disables autoplay/float/camera moves, keyboard-operable carousel.
