/* Fill My Tank (admin) — the operator's own fuel-purchase log + last-week KPIs. */

import type { EquipmentClass } from "./types";

export type TankRefueling = {
  id: string;
  gallons: number;
  costPerGallon: number;
  taxPct: number;
  taxAmount: number;
  total: number;
  /** On-road vs Off-road diesel. */
  fuelType: EquipmentClass;
  /** display string, e.g. "8:17 am - May 18, 2026". */
  date: string;
};

export const fillTankKpis = {
  priceAvgPerGal: 2.28,
  totalFuelCost: 12532.5,
  fuelAvgGallons: 450,
  totalFuelGallons: 2700,
};

export const seedRefuelings: TankRefueling[] = [
  { id: "r1", gallons: 300, costPerGallon: 4.0, taxPct: 10, taxAmount: 250, total: 1200, fuelType: "Off-road", date: "8:17 am - Jul 20, 2026" },
  { id: "r2", gallons: 150, costPerGallon: 3.5, taxPct: 5, taxAmount: 125, total: 525, fuelType: "On-road", date: "8:31 am - Jul 18, 2026" },
  { id: "r3", gallons: 400, costPerGallon: 4.25, taxPct: 12, taxAmount: 300, total: 1700, fuelType: "Off-road", date: "1:42 pm - Jul 17, 2026" },
  { id: "r4", gallons: 350, costPerGallon: 3.9, taxPct: 7, taxAmount: 175, total: 682.5, fuelType: "Off-road", date: "8:03 am - Jul 17, 2026" },
  { id: "r5", gallons: 500, costPerGallon: 4.5, taxPct: 15, taxAmount: 375, total: 2250, fuelType: "On-road", date: "8:11 am - Jul 16, 2026" },
  { id: "r6", gallons: 600, costPerGallon: 4.75, taxPct: 20, taxAmount: 500, total: 3000, fuelType: "Off-road", date: "8:33 am - Jul 15, 2026" },
  { id: "r7", gallons: 700, costPerGallon: 5.0, taxPct: 25, taxAmount: 625, total: 4375, fuelType: "On-road", date: "8:21 am - Jul 14, 2026" },
  { id: "r8", gallons: 800, costPerGallon: 5.25, taxPct: 30, taxAmount: 750, total: 5250, fuelType: "Off-road", date: "8:18 am - Jul 11, 2026" },
  { id: "r9", gallons: 700, costPerGallon: 5.0, taxPct: 25, taxAmount: 625, total: 4375, fuelType: "On-road", date: "8:26 am - Jul 10, 2026" },
];

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Compute the derived amounts for a refueling from raw inputs. */
export function computeRefueling(gallons: number, costPerGallon: number, taxPct: number) {
  const fuelCost = round2(gallons * costPerGallon);
  const taxAmount = round2((fuelCost * taxPct) / 100);
  const total = round2(fuelCost + taxAmount);
  return { fuelCost, taxAmount, total };
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
