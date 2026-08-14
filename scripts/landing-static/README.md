# Fly by Night Fuel — landing page (static)

A plain static website. There is no build step, no framework, and no
dependencies: upload the files and it works.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. |
| `styles.css` | All styles, including the `@font-face` rules. |
| `script.js` | The small amount of behaviour the page needs (see below). |
| `fonts/` | Inter and Geist Mono, self-hosted as `.woff2`. |
| `assets/` | Logo, photographs, coverage map, favicon. |

## Uploading

Copy all of it — `index.html`, `styles.css`, `script.js`, `fonts/`, `assets/` —
into the web root, keeping the folder structure exactly as it is. The paths in
the HTML and CSS are relative, so the site works in a subfolder too.

`index.html` is the entry point. Nothing needs to be configured on the server:
no redirects, no rewrites, no server-side language. Any static host works
(cPanel, Netlify, Vercel, S3, GitHub Pages, plain Apache or nginx).

**Serve it over HTTP, don't open the file directly.** Opening `index.html` from
the filesystem with a `file://` address makes some browsers refuse to load the
fonts. To check the site locally, run this in the folder and visit
<http://localhost:8000>:

```bash
python3 -m http.server 8000
```

## The one setting: where the web app lives

The landing page is marketing only. Signing in and placing an order happen in
the separate web application, so the **Sign In / Register** and **Order Fuel**
buttons point at it.

That address is on a single line near the top of `script.js`:

```js
var APP_ORIGIN = "__APP_ORIGIN__";
```

Change it if the app moves, with no trailing slash. The same address is also
written into the `href` of each of those links in `index.html` as a fallback for
visitors with JavaScript turned off — worth updating there too if you change it
(search for `__APP_ORIGIN__` in `index.html`).

## What `script.js` does

Only one thing: it sets the destination of the account and order buttons.

Everything else is HTML and CSS on purpose — the navigation links are ordinary
anchors, the FAQ items are native `<details>` elements, and the scrolling is CSS
`scroll-behavior`. The page renders and every link works with JavaScript
disabled.

`script.js` also supports a second ordering flow for demonstrations: loading the
page as `?v=2` points the order buttons at a version of the order form that
doesn't ask the visitor to create an account first. Ordinary visitors never see
it, and it can be removed once one flow is chosen.

## Editing content

Please don't hand-edit these files. They are generated from the application that
this landing page belongs to (`fuel-app`), so the next export will overwrite any
changes made here. Send copy and image changes back to the development team and
ask for a fresh export instead — that keeps the live app and this page saying the
same thing.

For the record, the export is produced by running, in the app:

```bash
npm run build && npm run export:landing
```

## Browser support

Current versions of Chrome, Edge, Safari, and Firefox. The layout uses CSS grid
and custom properties; the FAQ uses `<details>`. All are long-established
features. Internet Explorer is not supported.
