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

"Access Account" collapses out of the nav below the `sm` breakpoint, so the
footer carries it too — keep both if you rework the nav.

## Two request flows, picked by `?v=`

The landing's own query string decides where its Request Delivery CTAs point, so
both flows can be demoed from one deploy by sending a different link:

| Link | Request Delivery goes to | Flow |
| --- | --- | --- |
| `/` | `/login?next=schedule` | Sign in first, then the wizard |
| `/?v=2` | `/customer-schedule?v=2` | Guest: straight into the wizard, no account |

`RequestCta.tsx` reads the param and resolves it through `requestUrlFor()` in
`content.ts`. Both CTAs sit under a Suspense boundary whose fallback is the
default flow, which keeps this page statically prerendered.

The guest flow itself lives in `ScheduleWizard` as `variant="guest"`: the
agreement step also collects name + email, nothing below it unlocks until those
are confirmed (pricing included), and Place Order asks the visitor to create an
account before the delivery is booked.

## Theming

Everything the landing renders reads from the `--l-*` semantic vars in
`landing.css`, which are themselves derived from the app's brand tokens
(`@theme` in `app/globals.css`). The vars are scoped to
`[data-landing-theme="light"]` — set on the root element in `LandingPage.tsx` —
so they can never leak into the app shell. To add a dark variant, add a
`[data-landing-theme="dark"]` block and switch the attribute.

## Dependencies on the host app

If you lift this folder out, these come with it:

- **Assets** — `public/landing/*` (`hero-emblem.jpg`, the six `seg-*.jpg` service
  photos, `alex.jpg`, `coverage-map.png`) and `public/brand/logo-horizontal.svg`.
- **Fonts** — `--font-sans` (Inter) for everything, plus `--font-mono`
  (Geist Mono) for the pricing-promise and compliance titles. Both are
  registered in `app/layout.tsx` and mapped in the `@theme` block of
  `app/globals.css`. The landing no longer uses `--font-display` (Oswald) —
  headings are Inter Bold.
- **Tokens** — `--radius-card`, `--radius-btn` from `app/globals.css`.
- **CSS import** — `app/globals.css` imports `landing.css`.

Nothing else in the app imports from this folder, and this folder imports
nothing from the app besides `next/image` and `next/link`.

## Handing the landing to a static host

The client may want the landing hosted on its own, away from the app. Rather than
maintaining a second copy, export one:

```bash
npm run build && npm run export:landing
```

`scripts/export-landing.mjs` turns the prerendered `/` into a plain
`index.html` + `styles.css` + `script.js` + `fonts/` + `assets/` package with no
framework and no build step, written to `../../fly-by-night-landing-static`. It
strips the React runtime, replaces `next/image` with plain `<img>` tags, rehomes
the self-hosted fonts, and points the account links at `APP_ORIGIN` (set at the
top of the script — update it if the app moves).

Because the export is generated from the build, this folder stays the single
source of truth: change the landing here and re-export. `scripts/landing-static/`
holds the `script.js` and `README.md` that ship inside the package.

## Known deviation from the mock

The service-card descriptions are specified in **Author** (a commercial face the
app doesn't ship). They render in Inter, which is wider, so each description
takes one extra line and the cards come out ~495px tall against the mock's 440px.
All six stay equal height. Closing the gap means licensing Author or dropping
that copy to ~15px — deliberately left at the spec'd 16px.

## Design source

Figma — *Fueling Around*, frame `Landing — Fly by Night Fuel` (node `18577:95364`).
