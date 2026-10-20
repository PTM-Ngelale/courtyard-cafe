# The Courtyard Cafe — marketing site

Single-page, static marketing site for **The Courtyard Cafe** (café & kitchen, Port Harcourt).
Its job, in order: (1) show the full food & drinks menu with prices, (2) help people
find and visit, (3) push to Instagram. No ordering, reservations, auth or CMS.

Built with **Next.js (App Router)**, exported to a static site (`output: 'export'`).
Recreated from `design_handoff_courtyard_cafe/` at high fidelity — tokens, type
scale, spacing and copy match the handoff spec.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site → out/
npx serve out      # serve the export locally
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

## Notes on the build

- **Fidelity fixes applied** vs. the prototype: Visit-section buttons retinted for the
  dark ground; hours values use `--cream-100`, not `#fff`; a real mobile nav (hamburger
  under 640px) replaces the wrapping row; favicon + metadata + `CafeOrCoffeeShop` JSON-LD added.
- **Client JS** is only the `Header` mobile-nav toggle. Everything else is a Server
  Component rendered to static HTML. Anchor navigation only; `scroll-behavior: smooth`,
  disabled under `prefers-reduced-motion`.
- **Images**: static export can't use the Next image optimiser, so photos are
  pre-compressed to WebP (`≤130 KB` each) and served via `<img srcset>` from the
  `Photo` / `Logo` components.
- **No max-width container** — full-width sections with fluid `clamp()` padding and
  `repeat(auto-fit, minmax())` grids, so everything reflows without media queries.
