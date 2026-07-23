/*
  Shared responsive page paddings. Kept in one place so every page and its
  sticky header use the same breakpoints. Mobile/tablet get tighter gutters and
  extra bottom room to clear the floating "Schedule a delivery" button; the
  desktop values (`lg:`) match the original px-10 / pt-6 / pb-10 layout.

  These are string literals (not composed at build time) so Tailwind's scanner
  picks up every utility class.
*/

/** Horizontal gutters. */
export const PAGE_X = "px-4 sm:px-6 lg:px-10";
/** Negative horizontal margins matching PAGE_X (for full-bleed sticky bars). */
export const PAGE_NX = "-mx-4 sm:-mx-6 lg:-mx-10";
/** Vertical padding for a scrolling page body. Extra bottom room until `xl`
    keeps content clear of the floating action button on mobile/tablet. */
export const PAGE_Y = "pt-4 pb-24 lg:pt-6 xl:pb-10";

/** Classes for a sticky page header that spans the page gutters. */
export const STICKY_HEADER =
  "sticky top-0 z-20 -mx-4 -mt-4 px-4 pb-4 pt-4 bg-neutral sm:-mx-6 sm:px-6 lg:-mx-10 lg:-mt-6 lg:px-10 lg:pt-6";
