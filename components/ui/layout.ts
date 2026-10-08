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

/** Reading width for ordinary pages — keeps prose and cards from stretching. */
export const PAGE_MAX = "max-w-[1200px]";
/** Pages built around a wide table instead run the full content area, so the
    grid has room for every column before it needs to scroll. */
export const PAGE_MAX_WIDE = "max-w-none";

/* A table page fills the viewport instead of ending wherever the rows stop, so
   the pagination sits at the bottom of the screen rather than floating in the
   middle with dead space under it. Put PAGE_FILL on the page container and
   PAGE_FILL_BODY on the element that should absorb the slack (the table). */
export const PAGE_FILL = "min-h-full";
export const PAGE_FILL_BODY = "flex-1";

/** Classes for a sticky page header that spans the page gutters. */
export const STICKY_HEADER =
  "sticky top-0 z-20 -mx-4 -mt-4 px-4 pb-4 pt-4 bg-neutral sm:-mx-6 sm:px-6 lg:-mx-10 lg:-mt-6 lg:px-10 lg:pt-6";
