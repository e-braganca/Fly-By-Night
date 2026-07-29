# Landing page

The marketing front door, served at `/` (see `app/page.tsx`). Kept in this
folder as a self-contained unit so it can be re-themed, handed to a marketing
site, or lifted into its own deploy later without touching the product app.

## What's in here

| File | Role |
| --- | --- |
| `LandingPage.tsx` | The whole page composition (nav → hero → … → footer). Server component. |
| `content.ts` | All copy, links, and section data. **Edit marketing text here.** |
| `Button.tsx` | Landing-only button (`accent` / `outline` / `ghost`), driven by the `--l-*` vars. |
| `Icons.tsx` | Icon set exported from the Figma library; fills normalised to `currentColor`. |
| `landing.css` | The `--l-*` palette + smooth-scroll, scoped to `[data-landing-theme]`. |

Icons tint from the text colour: blue (`--l-accent`) in the service cards, gold
(`text-secondary`) in the trust bar, white inside the filled hero button. Keys in
`content.ts` (`gasStation`, `pin`, …) map to components via the lookup tables at
the top of `LandingPage.tsx`.

## Two separate entry points

The landing deliberately keeps signing in and requesting fuel as distinct
actions — both defined in `content.ts`:

- `REQUEST_URL` → `/login?next=schedule` — signs in, then drops the user
  straight into the request wizard (Service Agreement first).
- `SIGNIN_URL` → `/login` — plain sign in / register, lands on the dashboard.

"Sign In / Register" collapses out of the nav below the `sm` breakpoint, so the
footer carries it too — keep both if you rework the nav.

## Theming

Everything the landing renders reads from the `--l-*` semantic vars in
`landing.css`, which are themselves derived from the app's brand tokens
(`@theme` in `app/globals.css`). The vars are scoped to
`[data-landing-theme="light"]` — set on the root element in `LandingPage.tsx` —
so they can never leak into the app shell. To add a dark variant, add a
`[data-landing-theme="dark"]` block and switch the attribute.

## Dependencies on the host app

If you lift this folder out, these come with it:

- **Assets** — `public/landing/*` (segment photos + `coverage-map.png`) and
  `public/brand/*` (`logo-horizontal.svg`, `vertical.svg`).
- **Fonts** — `--font-display` (Oswald) and `--font-sans` (Inter), registered in
  `app/layout.tsx` and mapped in the `@theme` block of `app/globals.css`.
- **Tokens** — `--radius-card`, `--radius-btn` from `app/globals.css`.
- **CSS import** — `app/globals.css` imports `landing.css`.

Nothing else in the app imports from this folder, and this folder imports
nothing from the app besides `next/image` and `next/link`.

## Design source

Figma — *Fueling Around*, frame `Landing — Fly by Night Fuel` (node `18448:1469`).
