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

## Delivery ordering (Reef Court Estate residents)

Everything runs in the browser; there is no app.

1. `/book`: the resident picks items from the menu (prices come from
   `src/data/menu.ts`), then gives their name, phone, email, Reef Court street
   and house (dropdowns from Supabase), a delivery time from today's slots
   and optional notes.
2. `POST /api/checkout` re-prices the order from the menu, re-checks the
   address and time, saves it as `awaiting_payment` and starts a Paystack
   transaction. The browser is sent to Paystack's checkout page.
3. After paying, Paystack sends the resident to `/book/confirmation`, which
   asks Paystack whether the payment succeeded for the full amount and marks
   the order `confirmed`. Paystack also calls `/api/paystack/webhook`, so the
   order is confirmed even if the resident closes the tab.
4. Paid orders appear on `/admin/orders` in real time. Staff move them through
   preparing → ready → delivered. Unpaid checkouts never show there.

Delivery rules (fee, 30-minute notice, same day, opening hours, last delivery
30 minutes before closing) live in `src/lib/delivery.ts`. The delivery fee is
`DELIVERY_FEE_NAIRA` there (currently 0).

| Path | What |
| --- | --- |
| `reef-court-schema.sql` | Supabase schema: `estate_streets`, `reef_court_addresses`, `bookings`, RLS policies |
| `reef-court-seed.sql`, `reef-court-addresses.csv` | Estate streets and house numbers (transcribed from the estate map; low-confidence rows held back) |
| `src/app/api/validate-address/route.ts` | Street and house lists for the form (service role, read-only) |
| `src/app/api/checkout/route.ts` | Prices the order, saves it, starts the Paystack payment |
| `src/app/api/paystack/webhook/route.ts` | Paystack's server-to-server payment confirmation (signature checked) |
| `src/app/book/confirmation/page.tsx` | Where Paystack returns the customer; verifies the payment |
| `src/lib/paystack.ts` | Paystack calls and `confirmPaidBooking` (server-only) |
| `src/lib/order-menu.ts`, `src/lib/delivery.ts` | Orderable menu and delivery rules, shared by the form and the server |
| `src/components/BookingForm.tsx`, `src/app/book/page.tsx` | Customer order form |
| `src/components/StaffDashboard.tsx`, `src/app/admin/orders/page.tsx` | Realtime order dashboard, gated behind Supabase Auth |
| `src/lib/supabase-server.ts` | Service-role client — server-only, never import from a Client Component |
| `src/lib/supabase-browser.ts` | Anon-key client — used by the staff dashboard (auth + realtime) |

### Setup

1. Create a Supabase project, then run `reef-court-schema.sql` and then
   `reef-court-seed.sql` in the SQL editor.
2. In **Authentication > Users**, create one account per staff member who
   needs `/admin/orders`.
3. Set these environment variables (`.env.local` locally, Vercel project
   settings in production); see `.env.example`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project Settings > API) and
   `PAYSTACK_SECRET_KEY` (Paystack > Settings > API Keys & Webhooks; use the
   test key first). `SITE_URL` is optional; it defaults to the site's own URL.
4. In Paystack, set the webhook URL to `https://<site>/api/paystack/webhook/`
   (keep the trailing slash: the site has `trailingSlash: true`, and
   Paystack does not follow the redirect a slashless URL gets).
5. Test with Paystack's test cards before switching to the live key.

### Why RLS matters here

`estate_streets` and `reef_court_addresses` hold residents' names tied to their
house numbers. RLS is enabled with **no** anon/authenticated policies on those
two tables, so the public anon key (which is always visible in the browser
bundle) cannot read them directly — only the service role key, used
server-side in the API routes, can. `bookings` (customer name/phone/address
per order) is similarly locked down: only signed-in staff (`authenticated`
role) can select or update it. Don't add a broader `select`/`update` policy to
any of these tables without re-checking what it exposes.

## Notes on the build

- **Fidelity fixes applied** vs. the prototype: Visit-section buttons retinted for the
  dark ground; hours values use `--cream-100`, not `#fff`; a real mobile nav (hamburger
  under 640px) replaces the wrapping row; favicon + metadata + `CafeOrCoffeeShop` JSON-LD added.
- **Client JS** on the marketing page is only the `Header` mobile-nav toggle (plus the order form on `/book` and the staff dashboard). Everything else is a Server
  Component rendered to static HTML. Anchor navigation only; `scroll-behavior: smooth`,
  disabled under `prefers-reduced-motion`.
- **Images**: photos are pre-compressed to WebP (`≤130 KB` each) and served via
  `<img srcset>` from the `Photo` / `Logo` components, so Next's Image
  Optimization server stays off (`images: { unoptimized: true }`).
- **No max-width container** — full-width sections with fluid `clamp()` padding and
  `repeat(auto-fit, minmax())` grids, so everything reflows without media queries.
