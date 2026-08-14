#!/usr/bin/env node
/*
  Exports the landing page as a plain static site — index.html + styles.css +
  script.js + assets — for handing to someone who will upload it to ordinary
  hosting. No Next.js runtime, no build step, no node_modules.

  Source of truth is the prerendered output of `next build`, so the export can
  never drift from the app: re-run `npm run build && npm run export:landing`
  after any landing change.

  Usage:  node scripts/export-landing.mjs [outDir]
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(APP_ROOT, process.argv[2] ?? "../../fly-by-night-landing-static");

/* The deployed web app the landing's Sign In / Order Fuel links point at.
   Mirrored in script.js so the deployer can repoint it without touching HTML. */
const APP_ORIGIN = "https://fly-by-night.vercel.app";

const read = (p) => fs.readFileSync(path.join(APP_ROOT, p), "utf8");
const say = (...a) => console.log(...a);

/* ------------------------------------------------------------------ *
 * 1. Locate the build output
 * ------------------------------------------------------------------ */

const PRERENDER = ".next/server/app/index.html";
if (!fs.existsSync(path.join(APP_ROOT, PRERENDER))) {
  console.error(`Missing ${PRERENDER} — run \`npm run build\` first.`);
  process.exit(1);
}

let html = read(PRERENDER);

const cssRel = html.match(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/)?.[1];
if (!cssRel) {
  console.error("Could not find the page stylesheet in the prerendered HTML.");
  process.exit(1);
}
let css = read(path.join(".next", cssRel.replace("/_next/", "")));

/* ------------------------------------------------------------------ *
 * 2. Strip the Next.js runtime
 * ------------------------------------------------------------------ */

html = html
  // Hydration payload + framework chunks.
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
  .replace(/<script\b[^>]*\/>/g, "")
  // Suspense boundary markers, which exist only for hydration.
  .replace(/<template\b[^>]*>[\s\S]*?<\/template>/g, "")
  .replace(/<template\b[^>]*\/>/g, "")
  // Suspense markers (`<!--$-->`, `<!--$?-->`, `<!--$!-->`, `<!--/$-->`) and the
  // `<!-- -->` separators React puts between adjacent text expressions.
  .replace(/<!--(?:\$[?!]?|\/\$|\/?\d+| )-->/g, "")
  // Empty portal container React reserves for client-side mounts.
  .replace(/<div hidden(?:="")?>\s*<\/div>/g, "")
  // Preloads pointing into /_next, and Next's font-metric meta.
  .replace(/<link\b[^>]*rel="preload"[^>]*as="(?:script|font)"[^>]*>/g, "")
  .replace(/<link\b[^>]*rel="preload"[^>]*imageSrcSet="[^"]*"[^>]*>/g, "")
  .replace(/<meta\b[^>]*name="next-size-adjust"[^>]*>/g, "")
  // Font-module classes on <html> — the vars get redefined on :root below.
  .replace(
    /<html([^>]*?)class="[^"]*?((?:min-)?h-full)"/,
    (_m, attrs, keep) => `<html${attrs}class="${keep}"`,
  )
  // React's attribute casing → valid HTML.
  .replace(/\scharSet=/g, " charset=")
  .replace(/\sfetchPriority=/g, " fetchpriority=");

/* ------------------------------------------------------------------ *
 * 3. Rewrite asset URLs to the local assets/ folder
 * ------------------------------------------------------------------ */

const wanted = new Set();

/** `/landing/alex.jpg` → `assets/landing/alex.jpg`, recording the file to copy. */
function localise(publicPath) {
  const clean = publicPath.split("?")[0];
  wanted.add(clean);
  return `assets${clean}`;
}

html = html
  // next/image: drop the optimiser and its responsive variants.
  .replace(/\s(?:srcSet|srcset|imageSrcSet)="[^"]*"/g, "")
  .replace(/\s(?:sizes|imageSizes)="[^"]*"/g, "")
  .replace(/\sdata-nimg="[^"]*"/g, "")
  .replace(/\sdecoding="[^"]*"/g, "")
  .replace(/\sstyle="color:transparent"/g, "")
  .replace(
    /src="\/_next\/image\?url=([^&"]+)[^"]*"/g,
    (_m, enc) => `src="${localise(decodeURIComponent(enc))}"`,
  )
  // Plain public/ references (logo, favicon).
  .replace(/(?:href|src)="(\/(?:brand|landing)\/[^"]+)"/g, (m, p) =>
    m.replace(p, localise(p)),
  )
  .replace(/href="\/favicon\.ico[^"]*"/g, () => `href="${localise("/favicon.ico")}"`);

/* Re-add a plain preload for the hero image, which the responsive one covered. */
html = html.replace(
  "<link rel=\"stylesheet\"",
  '<link rel="preload" as="image" href="assets/landing/hero-emblem.jpg"/><link rel="stylesheet"',
);

/* ------------------------------------------------------------------ *
 * 4. Point app-bound links at the deployed web app
 * ------------------------------------------------------------------ */

/* The landing is hosted on its own; /login has no meaning here. Absolute hrefs
   work with JS off, and `data-app-path` lets script.js repoint them. */
let appLinks = 0;
html = html.replace(/href="(\/login[^"]*)"/g, (_m, p) => {
  appLinks++;
  return `href="${APP_ORIGIN}${p}" data-app-path="${p}"`;
});

/* ------------------------------------------------------------------ *
 * 5. Swap in the standalone stylesheet + script
 * ------------------------------------------------------------------ */

html = html
  .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/, '<link rel="stylesheet" href="styles.css"/>')
  .replace("</body>", '<script src="script.js" defer></script></body>');

/* ------------------------------------------------------------------ *
 * 6. Format — break only between tags, never inside text
 * ------------------------------------------------------------------ */

const BLOCK = new Set([
  "html", "head", "body", "meta", "link", "title", "script", "style",
  "header", "nav", "main", "footer", "section", "article", "aside",
  "div", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody",
  "tr", "td", "th", "figure", "figcaption", "details", "summary",
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "form", "fieldset", "hr",
]);
const VOID = new Set(["meta", "link", "img", "br", "hr", "input", "source", "area", "base"]);
/* Blocks that get a break before them but never inside them. */
const NO_INNER_BREAK = new Set(["script", "style", "title"]);

/*
  Whitespace between inline elements is rendered, so a naive re-indent would
  change the text. Breaks are inserted only where the previous token was also a
  tag — text runs are copied through byte-for-byte.
*/
function format(src) {
  const tokens = src.split(/(<[^>]+>)/).filter((t) => t !== "");
  const out = [];
  let depth = 0;
  let prevWasTag = false;

  for (const tok of tokens) {
    if (!tok.startsWith("<")) {
      out.push(tok);
      prevWasTag = false;
      continue;
    }
    const name = tok.match(/^<\/?\s*([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase() ?? "";
    const closing = tok.startsWith("</");
    const selfClosing = tok.endsWith("/>") || VOID.has(name);
    const block = BLOCK.has(name);

    if (closing && block && !selfClosing) depth = Math.max(0, depth - 1);
    const breakHere = block && prevWasTag && out.length && !(closing && NO_INNER_BREAK.has(name));
    if (breakHere) out.push("\n" + "  ".repeat(depth));
    out.push(tok);
    if (!closing && block && !selfClosing) depth++;

    prevWasTag = true;
  }
  return out.join("").replace(/^\n+/, "");
}

html = format(html);
if (!html.startsWith("<!DOCTYPE html>")) html = "<!DOCTYPE html>\n" + html;

/* ------------------------------------------------------------------ *
 * 7. Stylesheet: self-hosted fonts, no /_next paths
 * ------------------------------------------------------------------ */

/* Oswald is registered by the app's layout but unused by the landing (verified:
   every element computes to Inter or Geist Mono), so its faces are dropped. */
css = css.replace(/@font-face\{font-family:Oswald(?: Fallback)?;[^}]*\}/g, "");

const fonts = new Set();
css = css.replace(/url\(\.\.\/media\/([^)]+?\.woff2)\)/g, (_m, file) => {
  fonts.add(file);
  return `url(fonts/${file})`;
});

/* next/font scopes the family vars to a hashed class on <html>; that class is
   gone, so define them on :root instead. */
css =
  `/* Fly by Night Fuel — landing page styles.
   Generated from the app build by scripts/export-landing.mjs. Do not hand-edit:
   change the app and re-export, or the two will drift apart. */\n` +
  css +
  `\n/* Font families, normally injected by next/font onto <html>. */\n` +
  `:root{--font-inter:"Inter","Inter Fallback";--font-geist-mono:"Geist Mono","Geist Mono Fallback"}\n`;

/* ------------------------------------------------------------------ *
 * 8. Write the package
 * ------------------------------------------------------------------ */

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "fonts"), { recursive: true });

fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.writeFileSync(path.join(OUT, "styles.css"), css);

/* script.js + README are maintained as real files under scripts/landing-static/
   and copied out with the app origin substituted in. */
for (const name of ["script.js", "README.md"]) {
  const body = read(path.join("scripts/landing-static", name)).replaceAll(
    "__APP_ORIGIN__",
    APP_ORIGIN,
  );
  fs.writeFileSync(path.join(OUT, name), body);
}

for (const file of fonts) {
  fs.copyFileSync(
    path.join(APP_ROOT, ".next/static/media", file),
    path.join(OUT, "fonts", file),
  );
}

/* Most assets live in public/, but the favicon comes from Next's app/ file
   convention instead. */
const SOURCES = { "/favicon.ico": "app/favicon.ico" };

for (const rel of wanted) {
  const from = path.join(APP_ROOT, SOURCES[rel] ?? path.join("public", rel));
  const to = path.join(OUT, "assets", rel);
  if (!fs.existsSync(from)) {
    console.warn(`  ! missing source for ${rel}`);
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

say(`Exported to ${OUT}`);
say(`  index.html   ${(html.length / 1024).toFixed(1)} KB`);
say(`  styles.css   ${(css.length / 1024).toFixed(1)} KB`);
say(`  fonts        ${fonts.size} files`);
say(`  assets       ${wanted.size} files`);
say(`  app links    ${appLinks} → ${APP_ORIGIN}`);
