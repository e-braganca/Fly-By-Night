/* Admin Deliveries — per-day delivery counts (calendar) + a deterministic
   generator that expands a day's count into delivery rows (grouped by period).
   Reuses the customer ScheduledDelivery shape + customerName/period. */

import type {
  ScheduledDelivery,
  DeliveryEquipmentLine,
} from "./types";
import { REFERENCE_TODAY, parseISO } from "./schedule";

export type AdminPeriod = "Morning" | "Afternoon" | "Evening";
export const ADMIN_PERIODS: AdminPeriod[] = ["Morning", "Afternoon", "Evening"];

export type AdminScheduledDelivery = ScheduledDelivery & {
  customerName: string;
  period: AdminPeriod;
};

/** The admin deliveries page opens on the app's current date. */
export const ADMIN_INITIAL_DAY = REFERENCE_TODAY;

/** The month the delivery counts belong to (the current month). */
export const DELIVERY_MONTH = {
  y: parseISO(REFERENCE_TODAY).y,
  m: parseISO(REFERENCE_TODAY).m,
};

/** Delivery counts per day-of-month for the current month (drives the calendar
    pins). 0 = none. Days before today resolve to completed deliveries. */
export const DAY_COUNTS: Record<number, number> = {
  1: 8, 2: 3, 3: 0, 4: 10, 5: 14, 6: 8, 7: 10, 8: 11, 9: 3, 10: 0,
  11: 8, 12: 13, 13: 12, 14: 8, 15: 9, 16: 4, 17: 0, 18: 11, 19: 13, 20: 8,
  21: 8, 22: 9, 23: 3, 24: 0, 25: 8, 26: 9, 27: 14, 28: 13, 29: 10, 30: 3, 31: 0,
};

const LINES: DeliveryEquipmentLine[] = [
  { name: "Wheel Tractor-Scraper", units: 9, gallonsMax: 560, fuelType: "Off-road" },
  { name: "Compact Track Loader", units: 2, gallonsMax: 560, fuelType: "Off-road" },
  { name: "50kw Mobile Silent Diesel Generator", units: 1, gallonsMax: 560, fuelType: "Off-road" },
  { name: "50kw Mobile Silent Diesel Generator", units: 1, gallonsMax: 560, fuelType: "Off-road" },
];

const CERT = [
  { label: "DR-97 Tax-Exempt Certificate", filename: "certificate-9834788755.pdf", url: "#" },
];

const TEMPLATES = [
  { street: "123 Maple Avenue", city: "Sunnyvale, FL", customer: "MDB Construction, LLC" },
  { street: "789 Maple Lane", city: "Sunnyvale, FL", customer: "ABC Company, LLC" },
  { street: "321 Elm Avenue", city: "Fort Lauderdale, FL", customer: "Coastal Builders, LLC" },
  { street: "123 Ocean Blvd", city: "West Palm Beach, FL", customer: "Harbor Logistics" },
  { street: "456 Sunset Drive", city: "Coral Springs, FL", customer: "Sunset Ranch Co." },
];

/** Split a total count across the 3 periods (Morning-heavy, matches the mock). */
function splitPeriods(count: number): Record<AdminPeriod, number> {
  const m = Math.ceil(count * 0.4);
  const a = Math.ceil((count - m) * 0.55);
  const e = Math.max(0, count - m - a);
  return { Morning: m, Afternoon: a, Evening: e };
}

/** Expand a day into its delivery rows (deterministic — no randomness).
    Past days resolve to all-completed (locked) deliveries; today has its first
    delivery already done; future days are all still scheduled. */
export function buildDayDeliveries(
  dateISO: string,
  count: number,
): AdminScheduledDelivery[] {
  const isPast = dateISO < REFERENCE_TODAY;
  const isToday = dateISO === REFERENCE_TODAY;
  const split = splitPeriods(count);
  const rows: AdminScheduledDelivery[] = [];
  let i = 0;
  for (const period of ADMIN_PERIODS) {
    for (let k = 0; k < split[period]; k++, i++) {
      const t = TEMPLATES[i % TEMPLATES.length];
      // Past → every delivery is completed. Today → the first is completed and
      // the rest are still scheduled. Future → nothing completed yet.
      const completed = isPast || (isToday && i === 0);
      rows.push({
        id: `${dateISO}-${i}`,
        dateISO,
        status: completed ? "completed" : "scheduled",
        isEditable: !completed,
        address: `${t.street}, ${t.city}`,
        urgency: "standard",
        gallonsScheduled: 220,
        gallonsDelivered: completed ? 220 : undefined,
        price: completed ? "$763.51" : undefined,
        orderNo: completed ? 871 - i : undefined,
        equipment: LINES,
        documents: CERT,
        customerName: completed ? "MDB Construction, LLC" : t.customer,
        period,
      });
    }
  }
  return rows;
}
