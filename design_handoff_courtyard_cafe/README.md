# Handoff: The Courtyard Cafe — marketing site

## Overview

A single-page marketing site for **The Courtyard Cafe** (café & kitchen, Lekki, Lagos). The page's job, in priority order:

1. Let people read the **full food and drinks menu with prices**.
2. Let people **find and visit** the cafe (address, hours, phone, email).
3. Push people to **Instagram**.

There is no ordering, no reservations system, no auth, no CMS in scope. It is a static, content-first page with anchor navigation. All content is final except the contact details, which are placeholders (see *Placeholder data* below).

---

## About the design files

The files in `reference/` are **design references written in HTML** — a prototype that shows the intended look, copy, and behaviour. They are **not production code to copy verbatim.**

`reference/The Courtyard Cafe.dc.html` is authored in a proprietary streaming-component format (a `<x-dc>` template plus a `class Component` logic block with a `renderVals()` method). Treat it as a spec:

- The markup inside `<x-dc>…</x-dc>` is the DOM structure and the exact inline styling.
- `{{ item.n }}`-style holes are template interpolation; `<sc-for list="{{ foodGroups }}" as="item">` is a loop over the array of the same name.
- The `renderVals()` return object at the bottom of the file is the **content data** — food menu, drinks menu, opening hours. Copy those arrays verbatim; they are the real menu, transcribed from the cafe's printed menu boards.

**Your task:** recreate this design in the target codebase's environment (React/Next, Vue/Nuxt, Astro, plain HTML+CSS — whatever exists), using its established patterns, routing, and styling approach. If no codebase exists yet, **Astro or Next.js with static export** is the natural fit: the page is static, image-heavy, and SEO-relevant (a local business needs to rank for its name and for "cafe Lekki").

## Fidelity

**High fidelity.** Colors, type sizes, spacing, radii, breakpoints and copy below are final and should be matched precisely. The only intentionally-open items are the placeholder contact details and the real Instagram URL.

---

## Design tokens

The site was themed from the cafe's printed menu card: warm off-white paper, deep ink-green text, antique-gold accent.

### Color

| Token | Value | Used for |
| --- | --- | --- |
| `--bg` | `#f7f2ef` | Page ground (warm paper) |
| `--surface` | `#fffbf9` | Card fill (drinks cards) |
| `--ink` | `#1c2320` | Primary text, logo mark |
| `--ink-2` | `#4b524d` | Body copy, nav links, secondary values |
| `--ink-3` | `#6d746e` | Small captions / section sublines |
| `--ink-4` | `#8a908a` | Menu item descriptions, footer text |
| `--rule` | `#c9c2ba` | Dotted leaders in drinks list |
| `--band` | `#f2eae5` | Drinks-section gradient top |
| `--gold` | `#a8813f` | Accent base — borders, hovers |
| `--gold-deep` | `#8a6730` | Accent **text** (kickers, prices, links) — use this, not `--gold`, for anything at body size |
| `--gold-light` | `#e8d3ab` | Accent text on the dark band |
| `--gold-mid` | `#b8944f` | Reserved / hover |
| `--dark-band` | `#1c2320` | "Visit" section ground |
| `--cream-100` | `#fffdfc` | Text on the dark band (address) |
| `--cream-200` | `#f4ece7` | Body text on the dark band |
| `--divider` | `rgba(28,35,32,0.16)` | Section top borders, hairlines |
| `--divider-soft` | `rgba(28,35,32,0.08)` | Menu row separators |

Never use pure `#000` or `#fff` for surfaces or text; the one exception in the prototype is `#fff` on the hours values inside the dark band — replace it with `--cream-100` if you prefer strict adherence.

### Typography

- Family: **Inter** (400 / 500 / 600), loaded from Google Fonts. Headings and body share the family — hierarchy comes from size, letter-spacing and space, not weight.
- Heading weight: **500**. Never bolder.
- Heading line-height `1.12`, letter-spacing `-0.015em`. Body line-height `1.55` default; `1.7–1.75` for prose paragraphs.
- Base font size **15px**.

| Role | Size | Other |
| --- | --- | --- |
| H1 (hero) | `clamp(40px, 5.6vw, 68px)` | line-height 1.05, `text-wrap: balance` |
| H2 (section) | `clamp(28px, 3.4vw, 40px)` | |
| Kicker (H6) | `13px` | uppercase, letter-spacing `0.08em`, color `--gold-deep` |
| Hero eyebrow | `12px` | uppercase, letter-spacing `0.28em`, color `--gold-deep` |
| Hero lede | `17px` | line-height 1.7, max-width `46ch`, color `--ink-2` |
| Body prose | `16px` | line-height 1.75, color `--ink-2` |
| Menu group heading | `15px` | uppercase, letter-spacing `0.18em`, color `--ink` |
| Menu item name | `16px` | color `--ink` |
| Menu item description | `13px` | line-height 1.5, color `--ink-4` |
| Menu price | `15px` | `font-variant-numeric: tabular-nums`, color `--gold-deep`, `white-space: nowrap` |
| Drinks card heading | `13px` | uppercase, letter-spacing `0.16em`, color `--gold-deep` |
| Drinks item / price | `15px` / `14px` | price tabular-nums, color `--ink-2` |
| Nav links | `13px` | letter-spacing `0.06em`, color `--ink-2` |
| Footer / meta | `12–13px` | color `--ink-4` |

### Spacing, radius, elevation

- Section padding: `clamp(48px, 7vw, 96px)` vertical, `clamp(20px, 5vw, 72px)` horizontal. The hero uses `clamp(48px,7vw,104px)` top and `clamp(40px,6vw,88px)` bottom.
- Radius: `4px` small, **`8px` default**, `14px` large (hero/about photos).
- Elevation: one step only — `box-shadow: 0 0 0 1px rgba(28,35,32,0.10)` on drinks cards. No stacked or heavy shadows anywhere.
- Grid gaps: menu groups `clamp(28px,3vw,44px)`, drinks cards `clamp(20px,2.4vw,32px)`, gallery `14px`, two-column sections `clamp(28px,5vw,72px)`.

---

## Layout & sections

The page is one column of full-width sections, each with its own horizontal padding. There is **no max-width container** — content spans the viewport with generous side padding. Everything is fluid; there are no fixed pixel widths. All multi-column areas use `repeat(auto-fit, minmax(Xpx, 1fr))` so they collapse naturally without media queries.

### 1. Header (sticky)

- `position: sticky; top: 0; z-index: 20`. Flex row, `space-between`, `gap: 24px`, padding `14px clamp(20px,5vw,72px)`.
- Background `color-mix(in srgb, #f7f2ef 90%, transparent)` + `backdrop-filter: blur(14px)`; bottom border `1px solid var(--divider)`.
- Left: logo mark `38×38` (`object-fit: contain`) + wordmark "THE COURTYARD" — 14px, uppercase, letter-spacing `0.22em`, color `--ink`.
- Right: anchor links **About · Menu · Drinks · Gallery**, `gap: 28px`, color `--ink-2`, hover `--gold-deep`; then a **Visit us** outlined button.
- Mobile: the prototype keeps the row and lets it wrap. If the codebase has a nav pattern, a hamburger below ~640px is acceptable — keep the wordmark and the Visit us button visible.

### 2. Hero (`#top`)

- Two-column grid, `repeat(auto-fit, minmax(320px, 1fr))`, `align-items: center`, gap `clamp(24px,5vw,64px)`.
- A decorative radial glow sits behind the text: absolutely positioned `inset: -20% 40% 30% -10%`, `radial-gradient(closest-side, rgba(168,129,63,0.16), transparent 70%)`, `pointer-events: none`.
- **Left column** (`max-width: 560px`), in order:
  - Logo mark, width `clamp(92px,10vw,124px)`, `opacity: 0.9`, `margin-bottom: 26px`.
  - Eyebrow: `Café & Kitchen · Lagos`
  - H1: `Where every moment blooms`
  - Lede: `Slow breakfasts, long lunches and something cold in a tall glass — served under the ferns from morning until late.`
  - Buttons: **See the menu** (primary, → `#menu`), **Find us** (ghost, → `#visit`). Flex, gap 12px, wraps.
  - Meta row above a `1px` top divider, `margin-top: 44px; padding-top: 26px`, gap 28px, 13px `--ink-3`: `Open daily · 8am – 11pm` and `12 Admiralty Way, Lekki`.
- **Right column:** two photos side by side, `1fr 1fr`, gap 14px, `align-items: end`, each `aspect-ratio: 3/4`, `border-radius: 14px`, `object-fit: cover`. The second photo is offset upward: `transform: translateY(-32px)`.
  - Left photo: `breakfast.png` (alt "English breakfast"). Right: `milkshake.png` (alt "Strawberry milkshake").

### 3. About (`#about`)

- Two-column grid `repeat(auto-fit, minmax(300px,1fr))`, `align-items: center`, section top border.
- Left (`max-width: 52ch`): kicker `The cafe`; H2 `A green corner of the city, set for a long table`; two paragraphs (copy below); then a wrapping tag row, gap 10px, `margin-top: 26px`:
  - `All-day breakfast` (filled accent tag), then `Fresh pastries`, `Cocktails & mocktails`, `Free wifi` (outline tags).
- Right: `wings.png`, `aspect-ratio: 4/5`, `max-height: 560px`, radius 14px.

Copy, paragraph 1:
> The Courtyard began as a small kitchen with a handful of tables and a lot of ferns. It still feels that way: plates that take their time, coffee pulled properly, and a room that stays quiet enough to hear the person across from you.

Paragraph 2:
> Breakfast runs all morning. Lunch leans West African and comfortable — dirty jollof, asun fried rice, yamarita — beside the burgers and pastas people keep coming back for.

### 4. Food menu (`#menu`)

- Section header row: flex, `align-items: end`, `space-between`, wrapping. Left: kicker `Kitchen` + H2 `Food menu`. Right: 13px `--ink-3`, max-width `34ch`: `Prices in naira. Breakfast served all day; kitchen closes 10:30pm.`
- Groups grid: `grid-template-columns: repeat(auto-fit, minmax(340px, 1fr))`, gap `clamp(28px,3vw,44px)`. Each group is `break-inside: avoid`.
- **Group header:** uppercase title + a hairline that fades out to the right — `flex: 1; height: 1px; background: linear-gradient(to right, var(--divider), transparent)`. (Fading rules are a signature of this look — do not use a flat rule.)
- **Menu row:** flex, `align-items: baseline`, `gap: 16px`, `padding: 9px 0`, `border-bottom: 1px solid rgba(28,35,32,0.08)`. Left column flexes (`flex:1; min-width:0`) with name over description; price is right-aligned, tabular, `--gold-deep`, no wrap.
- **Group note** (optional): 12px `--ink-4`, `margin-top: 12px`, letter-spacing `0.04em`. Render nothing if the note is empty.
- Group order and content: see *Content data* below.

### 5. Drinks (`#drinks`)

- Ground: `linear-gradient(180deg, #f2eae5, #f7f2ef)` — a subtle warm band, no top border.
- Header row like the menu; right subline: `Coffee from 8am. Cocktails from noon.`
- Cards grid `repeat(auto-fit, minmax(260px,1fr))`, gap `clamp(20px,2.4vw,32px)`.
- **Card:** background `--surface`, radius 8px, padding `22px 22px 18px`, shadow `0 0 0 1px rgba(28,35,32,0.10)`.
- **Card row:** name (15px `--ink`), a **dotted leader** (`flex: 1; border-bottom: 1px dotted var(--rule); transform: translateY(-3px)`), price (14px, tabular, `--ink-2`). Padding `6px 0`.

### 6. Gallery (`#gallery`)

- Header: kicker `On the pass`, H2 `From the courtyard`; right-side link `@thecourtyardcafe →` (14px, letter-spacing `0.06em`).
- Grid `repeat(auto-fit, minmax(220px,1fr))`, gap 14px. Five photos, each `aspect-ratio: 4/5`, radius 8px, `object-fit: cover`, in order: `pasta.png`, `springrolls.png`, `wings.png`, `breakfast.png`, `milkshake.png`.
- Alt text: "Asun pasta", "Spring rolls and samosa with pepper dip", "Honey glazed wings", "English breakfast", "Strawberry milkshake".

### 7. Visit (`#visit`) — the one dark band

- Ground `#1c2320` plus `radial-gradient(120% 80% at 15% 0%, rgba(168,129,63,0.22), transparent 70%)`. This is the only inverted section on the page; it exists to make "come visit" the visual climax. Do not add a second one.
- Two-column grid `repeat(auto-fit, minmax(280px,1fr))`, gap `clamp(28px,5vw,72px)`.
- Left: kicker `Visit` in `--gold-light`; H2 `Come sit under the ferns`; paragraph in `--cream-200`, max-width `42ch`:
  > Walk-ins welcome. For tables of six or more, or to hold the courtyard for an evening, give us a call.
  - Then two buttons: phone (`tel:` link, primary/outlined) and email (`mailto:`, ghost).
- Right: stacked blocks, gap 24px, `align-content: start`.
  - **Hours** — label 12px uppercase letter-spacing `0.18em` in `--gold-light`; then rows: flex `space-between`, `padding: 7px 0`, `border-bottom: 1px solid rgba(233,233,237,0.14)`, 15px. Day in `--cream-200`, time tabular in `--cream-100`.
  - **Address** — same label style; three lines at 16px / 1.7 in `--cream-100`.
- Button variants must be re-tinted for the dark ground: the outlined button's border stays gold, its label goes `--gold-light`, hover fill `rgba(168,129,63,0.14)`; the ghost button's label goes `--cream-200`, hover fill `rgba(255,255,255,0.07)`. (The prototype inherits the light-ground button styles here — fix this in the build.)

### 8. Footer

- Flex row, `space-between`, wrapping, gap 20px, padding `34px clamp(20px,5vw,72px)`, top border `--divider`.
- Left: logo mark 34px at `opacity: 0.75` + `WHERE EVERY MOMENT BLOOMS` (12px, uppercase, letter-spacing `0.16em`, `--ink-4`).
- Right: `Instagram`, `Menu`, `Contact`, `© 2026 The Courtyard Cafe` — 13px, gap 24px.

---

## Components

Three reusable pieces are worth extracting; everything else is layout.

**Button** — outlined, never filled.
- Base: `display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border-radius:8px; border:1px solid transparent; background:transparent; font:inherit; font-size:14px; line-height:1.2; cursor:pointer; text-decoration:none; transition:background 120ms ease, color 120ms ease, border-color 120ms ease`.
- `primary`: `border-color: var(--gold); color: var(--gold-deep)`. Hover `background: rgba(168,129,63,0.10)`. Active `background: rgba(168,129,63,0.18)`.
- `ghost`: no border, `color: var(--ink-2)`. Hover `background: rgba(28,35,32,0.05)`.
- Focus (all interactive elements, page-wide): `:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }`. Never leave the browser default.

**Tag** — `display:inline-flex; padding:3px 10px; border-radius:999px; font-size:12px; border:1px solid transparent`.
- `accent`: background `rgba(168,129,63,0.14)`, color `--gold-deep`, border `rgba(168,129,63,0.35)`.
- `outline`: transparent background, border `rgba(28,35,32,0.22)`, color `--ink-2`.

**MenuGroup / DrinkCard** — driven entirely by the data arrays; props are `{ title, note?, items: [{ n, d?, p }] }`.

---

## Interactions & behaviour

- **Anchor navigation only.** `html { scroll-behavior: smooth; }`. Header links jump to `#about`, `#menu`, `#drinks`, `#gallery`, `#visit`.
- **Hover states:** nav links `--ink-2` → `--gold-deep`; text links `--gold-deep` → `--gold`; buttons and tags as above. Transitions 120ms ease.
- **No JS state.** No modals, tabs, carousels, filters, or loading/error states. If the codebase renders the menu from a CMS later, the shape is already the data arrays below.
- **Selection style:** `::selection { background: rgba(168,129,63,0.28); }`.
- **Reduced motion:** honour `prefers-reduced-motion: reduce` by disabling smooth scroll.
- **Responsive:** entirely fluid via `auto-fit` grids and `clamp()`. Expected reflow — hero stacks (text over photos) under ~700px; menu goes single-column under ~740px; drinks cards go 1-up under ~560px; gallery goes 2-up then 1-up. No fixed heights anywhere that holds text.

## State management

None required. If the site is built in a framework, all content should be static data (a `menu.ts` / `menu.json` module or CMS collection) imported at build time. No client-side data fetching is in scope.

---

## Content data

Copy these verbatim — transcribed from the cafe's printed menu boards. Prices are Nigerian naira, displayed without a currency symbol (the section subline states "Prices in naira").

### Food

**Breakfast** — note: `Egg choices — scrambled, omelette, sunny side, boiled`

| Item | Description | Price |
| --- | --- | --- |
| English Breakfast | Toast, eggs of choice, bacon, grilled tomatoes, mushroom, baked beans | 14,000 |
| Courtyard Special | French toast, eggs, mushroom, sausages, whipped cream and berries | 15,500 |
| African Breakfast | Akara, custard, toasted bread served with milk | 7,000 |
| Buttermilk Pancakes | With maple syrup | 6,000 |
| Blueberry Pancakes | Blueberry glaze and syrup | 7,500 |
| Buttermilk Waffles | With maple syrup | 7,000 |
| Avocado Toast | Toasted bread, avocado, sunny side up eggs | 7,500 |

**Lunch**

| Item | Description | Price |
| --- | --- | --- |
| Dirty Jollof | Nigerian-style jollof with diced chicken, beef, vegetables and fried plantain | 13,000 |
| Asun Fried Rice | Spicy fried rice with goat meat, vegetables and egg | 12,000 |
| Yamarita | Fried coated yam served with egg sauce | 9,000 |
| Beef Burger | Beef patty, tomatoes, caramelised onions, cheese, lettuce, fries | 10,500 |
| Citizens Burger | Beef patty, bacon, caramelised onions, cheese, sausage, egg, fries | 12,000 |
| Club Sandwich | Grilled chicken, tomatoes, egg, lettuce and cream | 7,000 |
| Tuna Sandwich | Tuna, tomatoes, lettuce, cream | 5,700 |
| Beef Penne Pasta | Rich beef bolognese with vegetables | 14,000 |
| Alfredo Penne Pasta | Creamy chicken alfredo sauce | 16,000 |
| Chicken Noodles | Stir fry with green pepper, onions, grilled chicken | 5,800 |
| Spicy Noodles | Stir fry with extra pepper and spicy beef | 6,200 |
| Special Noodles | Beef, chicken, vegetables and choice of egg | 7,000 |
| The Platter | Spring roll, samosa, gizzard, fries, wings (5 pcs) and chicken | 19,000 |
| Goat Meat Pepper Soup | — | 6,500 |
| Chicken Pepper Soup | — | 6,000 |

**Salads**

| Item | Description | Price |
| --- | --- | --- |
| Chicken Salad | Lettuce, sweet corn, cucumber, cherry tomatoes, grilled chicken | 10,500 |
| Caesar Salad | Lettuce, grilled chicken, croutons, caesar dressing, parmesan | 10,000 |
| Avocado Salad | Sweet corn, avocado, cucumber, cherry tomatoes, grilled prawns | 15,000 |

**Protein & wings** — note: `Wing flavours — original, BBQ, honey garlic`

| Item | Description | Price |
| --- | --- | --- |
| Chicken Wings | Regular pack, 5 pcs | 7,000 |
| Chicken Wings | Pro pack, 10 pcs | 12,000 |
| Peppered Drumsticks | — | 6,500 |
| Grilled Croaker | — | 9,500 |
| Gizzard with Potato Fries | — | 19,000 |

**Pastries** — Meat Pie 1,200 · Chicken Pie 1,000 · Blueberry Muffins 900 · Coco Muffins 900

**Sides** — French Fries 3,000 · Potato Fries 3,000 · Yam Fries 3,000 · White Rice 2,500

### Drinks

| Group | Items (name — price) |
| --- | --- |
| Cocktails | Long Island 8,500 · Margarita 8,500 · Chapman 7,500 · Screwdriver 8,500 · Mojito 8,500 · Tequila Sunrise 8,500 |
| Mocktails | Chapman 7,000 · Tropical Sunset 7,000 · Passion Delight 7,000 · Lemonade 6,500 |
| Hot drinks | Cappuccino 3,000 · Espresso 2,500 · Americano 3,000 · Latte 3,000 · Hot Chocolate 3,500 |
| Cold drinks | Caramel Frappuccino 7,000 · Iced Latte 6,000 · Iced Matcha Latte 6,500 |
| Milkshakes | Vanilla 6,800 · Strawberry 6,800 · Oreo 7,500 |
| Others | Soda 1,000 · Energy drinks 1,700 · Beer 2,000 · Water 1,000 · Four Cousins wine 18,000 |

### Hours

Monday – Thursday `8:00 – 22:00` · Friday `8:00 – 23:00` · Saturday `9:00 – 23:00` · Sunday `10:00 – 21:00`

### Placeholder data — MUST be replaced before launch

| Field | Placeholder in the prototype |
| --- | --- |
| Address | 12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria |
| Phone | +234 800 000 0000 (`tel:+2348000000000`) |
| Email | hello@thecourtyard.ng |
| Instagram | `https://instagram.com` — link text `@thecourtyardcafe` |
| Hours | The four rows above are invented |

The hero meta line (`Open daily · 8am – 11pm`) and the two menu sublines (`kitchen closes 10:30pm`, `Cocktails from noon`) also encode invented hours — keep them in sync with the real ones.

---

## Assets

All in `assets/img/`. All were derived from the owner's Instagram screenshots and the physical signage; the originals are not needed.

| File | What it is | Notes |
| --- | --- | --- |
| `logo-dark.png` | 482×482 PNG, transparent, ink `#161826` mark | **Used everywhere on the light ground** — header, hero, footer |
| `logo-light.png` | Same mark in `#e9e9ed` | For use on the dark band or any dark ground |
| `breakfast.png` | 1080×1630 | Hero right, gallery |
| `milkshake.png` | 1080×1610 | Hero right, gallery |
| `wings.png` | 1080×1738 | About, gallery |
| `pasta.png` | 1080×1230 | Gallery (asun pasta) |
| `springrolls.png` | 1074×1910 | Gallery |

Notes for the build:
- The logo was **extracted from a photograph of the cafe's circular sign** — the disc, paper texture and drop shadow were removed and the mark reconstructed as an alpha mask. It is the only logo artwork available; if the owner can supply a vector (SVG/AI/EPS), swap it in — that is the single biggest quality win available on this page.
- The photos were **cropped to remove Instagram captions, emoji and story chrome**. Do not re-crop from the originals; use these.
- Photos are large PNGs. Convert to WebP/AVIF and serve responsive `srcset` in the real build (`<Image>` in Next, `<Image>` in Astro). Target ≤120KB each at 2× the largest rendered size.
- Icons, if any are added: **Phosphor Icons**, inline SVG on `currentColor`.
- Fonts: Inter via Google Fonts, weights 400/500/600. Self-host if the codebase already self-hosts fonts.

---

## Files in this bundle

```
design_handoff_courtyard_cafe/
├── README.md                              ← this document (self-sufficient spec)
├── reference/
│   ├── The Courtyard Cafe.dc.html         ← the design prototype (structure + inline styles + content data)
│   └── nocturne-styles.css                ← the base design-system stylesheet the prototype links
└── assets/img/                            ← production-ready logo + photography
```

`nocturne-styles.css` is the **unthemed dark base**. The prototype overrides its `:root` tokens in a `<style>` block near the top of the HTML file to produce the cream/gold palette documented above. **The token table in this README is the source of truth for color** — take values from it, not from `nocturne-styles.css`, whose defaults are the dark theme. Keep from the base sheet only its structural conventions: 8px radius default, Inter at weight 500 for headings, one-step elevation, outlined buttons, `:focus-visible` accent ring, fading rules.

## Known issues in the prototype to fix during the build

1. The **Visit** section's buttons inherit light-ground styling on a dark ground — retint per the Components section.
2. The hours values use literal `#fff`; use `--cream-100`.
3. No mobile nav treatment — the header row simply wraps.
4. No favicon, no meta/OG tags, no `LocalBusiness` JSON-LD. All three should be added: a local cafe site needs structured data for name, address, phone, hours, and `sameAs` → Instagram.
