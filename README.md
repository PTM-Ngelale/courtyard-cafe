# The Courtyard Cafe — marketing site + resident booking

Marketing site for **The Courtyard Cafe** (café & kitchen, Port Harcourt), plus a
resident-only same-day delivery booking flow for the Reef Court Estate.

Built with **Next.js (App Router)**. The marketing page (`/`) is still a plain
server-rendered page; `/book` and `/admin/orders` add a live backend (Supabase),
so the site is no longer a static export — see "Booking system" below.
Recreated from `design_handoff_courtyard_cafe/` at high fidelity — tokens, type
scale, spacing and copy match the handoff spec.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (deploy on Vercel or any Node host)
npm start           # serve the production build locally
```

`npm run images` regenerates the derived image assets:
- `scripts/optimize-images.mjs` → responsive WebP variants in `public/img/`
- `scripts/make-og-image.mjs` → `public/og-image.jpg` (1200×630)

Both run automatically before `dev` and `build` (npm `pre*` hooks) and are
idempotent, so they're cheap to leave in place.

## Project shape

| Path | What |
| --- | --- |
| `src/app/page.tsx` | The whole page — all eight sections |
| `src/app/layout.tsx` | `<head>`: metadata (OG/Twitter), favicon, Inter via `next/font`, `CafeOrCoffeeShop` JSON-LD |
| `src/app/globals.css` | Design tokens, reset, `.btn` / `.tag` primitives, and every section/component style |
| `src/components/` | `Header` (client — mobile nav), `Footer`, `Button`, `Tag`, `MenuGroup`, `DrinkCard`, `Photo`, `Logo` |
| `src/data/menu.ts` | Food (from the updated October 2026 printed menu) + drinks (from the earlier menu boards), transcribed verbatim |
| `src/data/site.ts` | Business + contact details, hours, and the JSON-LD hours spec |
| `src/assets/img/` | Original logo + photography (source for the optimize script) |
| `public/img/`, `public/og-image.jpg` | Generated, committed image assets |
| `public/favicon.svg` | Favicon |

## ⚠️ Before launch — remaining placeholder data

All in **`src/data/site.ts`**. Address, phone, opening hours and the Instagram
link are the real details; still outstanding:

| Field | Placeholder |
| --- | --- |
| `site.url` | `https://www.thecourtyard.ng` — set to the real domain (drives canonical + OG URLs) |

`contact.email` is intentionally blank — the Visit section drops the email
button and the JSON-LD omits `email` when it's empty. Set it in `site.ts` to
bring the button back.

`hoursSummary` in the same file holds the prose hours lines shown in the hero and
the menu / drinks sublines — keep them in sync if the hours ever change.
The `bar` line still assumes "Cocktails from noon" — confirm with the owner.

The logo (`src/assets/img/logo-*.png`) is an alpha mask reconstructed from a photo of
the cafe's sign. If the owner can supply a vector, drop it in and adjust `Logo.tsx` —
it's the single biggest quality win available.

## Booking system (Reef Court Estate residents)

Customer flow: `/book` → two-tier street/house dropdowns validate the address
against Supabase → form hands the validated data to Flutter via
`window.flutterCallback` → Flutter runs the payment → Flutter calls
`POST /api/create-booking` with the payment reference → the order appears on
`/admin/orders` in real time.

| Path | What |
| --- | --- |
| `reef-court-schema.sql` | Supabase schema: `estate_streets`, `reef_court_addresses`, `bookings`, RLS policies |
| `src/app/api/validate-address/route.ts` | Streets / houses / verify — service role, no auth needed (public, read-only lookups) |
| `src/app/api/create-booking/route.ts` | Creates a booking after Flutter confirms payment — service role |
| `src/components/BookingForm.tsx`, `src/app/book/page.tsx` | Customer booking form |
| `src/components/StaffDashboard.tsx`, `src/app/admin/orders/page.tsx` | Realtime order dashboard, gated behind Supabase Auth |
| `src/lib/supabase-server.ts` | Service-role client — server-only, never import from a Client Component |
| `src/lib/supabase-browser.ts` | Anon-key client — used by the staff dashboard (auth + realtime) |

### Setup

1. Create a Supabase project, then run `reef-court-schema.sql` in the SQL editor
   (or `supabase db push` if the project is linked).
2. Insert real streets/houses into `estate_streets` / `reef_court_addresses`.
3. In **Authentication > Users**, create one Supabase Auth account per staff
   member who needs `/admin/orders` access — that's what gates the dashboard.
4. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API) into `.env.local`.

### Why RLS matters here

`estate_streets` and `reef_court_addresses` hold residents' names tied to their
house numbers. RLS is enabled with **no** anon/authenticated policies on those
two tables, so the public anon key (which is always visible in the browser
bundle) cannot read them directly — only the service role key, used
server-side in the two API routes, can. `bookings` (customer name/phone/address
per order) is similarly locked down: only signed-in staff (`authenticated`
role) can select or update it. Don't add a broader `select`/`update` policy to
any of these tables without re-checking what it exposes.

## Notes on the build

- **Fidelity fixes applied** vs. the prototype: Visit-section buttons retinted for the
  dark ground; hours values use `--cream-100`, not `#fff`; a real mobile nav (hamburger
  under 640px) replaces the wrapping row; favicon + metadata + `CafeOrCoffeeShop` JSON-LD added.
- **Client JS** is only the `Header` mobile-nav toggle. Everything else is a Server
  Component rendered to static HTML. Anchor navigation only; `scroll-behavior: smooth`,
  disabled under `prefers-reduced-motion`.
- **Images**: photos are pre-compressed to WebP (`≤130 KB` each) and served via
  `<img srcset>` from the `Photo` / `Logo` components, so Next's Image
  Optimization server stays off (`images: { unoptimized: true }`).
- **No max-width container** — full-width sections with fluid `clamp()` padding and
  `repeat(auto-fit, minmax())` grids, so everything reflows without media queries.
