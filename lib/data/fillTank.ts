/* Fill My Tank (admin) — the operator's own fuel-purchase log.

   One row is one load bought from the supplier: how many gallons went in, what
   the supplier charged, and the markup we add when reselling it. Cost per gallon
   is derived (total / gallons) rather than typed, so a row can never disagree
   with itself, and the sell price is cost + markup. */

import { REFERENCE_TODAY } from "./schedule";

const round2 = (n: number) => Math.round(n * 100) / 100;

export type TankRefueling = {
  id: string;
  /** Gallons taken on. */
  gallons: number;
  /** What the supplier charged for the load. */
  total: number;
  /** total / gallons. */
  costPerGallon: number;
  /** Margin added per gallon when this fuel is resold. */
  markup: number;
  /** Display string, e.g. "8:17 am - July 20, 2026". */
  date: string;
  /** Same moment as `date`, sortable and filterable. */
  dateISO: string;
};

/** Derive a row's per-gallon cost and resale price from the raw inputs. */
export function computePurchase(gallons: number, total: number, markup: number) {
  const costPerGallon = gallons > 0 ? round2(total / gallons) : 0;
  return { costPerGallon, sellPrice: round2(costPerGallon + markup) };
}

/* Rack prices for off-road dyed diesel, which is what the truck is loaded with.
   A dollar of markup puts the resale price next to the posted rate in
   ./pricing — buying above that would mean selling at a loss. */
const seed: [string, number, number, number, string, string][] = [
  ["r1", 300, 726.0, 1.0, "8:17 am - July 20, 2026", "2026-07-20"],
  ["r2", 150, 357.0, 1.0, "8:31 am - July 18, 2026", "2026-07-18"],
  ["r3", 400, 980.0, 1.0, "1:42 pm - July 17, 2026", "2026-07-17"],
  ["r4", 350, 840.0, 1.0, "8:03 am - July 17, 2026", "2026-07-17"],
  ["r5", 500, 1255.0, 1.0, "8:11 am - July 16, 2026", "2026-07-16"],
  ["r6", 600, 1482.0, 1.0, "8:33 am - July 15, 2026", "2026-07-15"],
  ["r7", 700, 1673.0, 1.0, "8:21 am - July 14, 2026", "2026-07-14"],
  ["r8", 800, 2040.0, 1.0, "8:18 am - July 11, 2026", "2026-07-11"],
  ["r9", 700, 1708.0, 1.0, "8:26 am - July 10, 2026", "2026-07-10"],
];

export const seedRefuelings: TankRefueling[] = seed.map(
  ([id, gallons, total, markup, date, dateISO]) => ({
    id,
    gallons,
    total,
    markup,
    costPerGallon: computePurchase(gallons, total, markup).costPerGallon,
    date,
    dateISO,
  }),
);

/* The range the filter opens on. It runs to the app's reference "today" rather
   than to the newest seeded row, so a purchase added now lands inside the range
   instead of being filtered straight back out. */
export const PURCHASE_RANGE = {
  from: seed[seed.length - 1][5],
  to: REFERENCE_TODAY,
};

/**
 * Timestamp for a purchase logged right now. The date comes from the app's
 * reference day so new rows sit on the same timeline as the seeded ones; the
 * time of day comes from the clock. Client-side only (post-hydration).
 */
export function newPurchaseTimestamp(now = new Date()) {
  const { y, m, d } = {
    y: Number(REFERENCE_TODAY.slice(0, 4)),
    m: Number(REFERENCE_TODAY.slice(5, 7)),
    d: Number(REFERENCE_TODAY.slice(8, 10)),
  };
  const stamped = new Date(y, m - 1, d, now.getHours(), now.getMinutes());
  return { date: formatTransactionDate(stamped), dateISO: REFERENCE_TODAY };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a Date as "8:17 am - May 18, 2026". Client-side only (post-hydration). */
export function formatTransactionDate(d: Date): string {
  let h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${mm} ${ampm} - ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
