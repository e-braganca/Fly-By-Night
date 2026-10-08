/* Receipts are DERIVED from completed scheduled deliveries so the numbers stay
   consistent everywhere (Receipts page, receipt drawer, and the schedule
   detail "Invoice" tab all use buildReceipt). */

import type {
  Receipt,
  ReceiptParty,
  ReceiptStatus,
  ScheduledDelivery,
} from "./types";
import { URGENCY_OPTIONS } from "./schedule";

export const SELLER: ReceiptParty = {
  name: "Fueling Around, LLC",
  lines: ["DBA: Punchline Petroleum", "123 Ocean Blv,", "West Palm Beach, FL.", "United States"],
  email: "hi@punchlinepetroleum.com",
};

export const BILL_TO: ReceiptParty = {
  name: "MDB Construction, LLC",
  lines: ["123 Ocean Blv,", "West Palm Beach, FL.", "United States"],
  email: "robert@mdbconstruction.com",
};

/** Florida on-road fuel tax, per gallon (pass-through to FL DOR). */
const FL_FUEL_TAX_PER_GAL = 0.359;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** "$763.51" → 763.51 */
export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

/** 751.72 → "$751.72" (deterministic, no locale deps). */
export function money(n: number): string {
  const neg = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}$${withCommas}.${dec}`;
}

/**
 * Build a Receipt from a completed delivery. The breakdown always reconciles to
 * the delivery's total: fuelCost + deliveryFee + taxes === total.
 */
export function buildReceipt(
  d: ScheduledDelivery,
  status: ReceiptStatus,
  billToName?: string,
  /* Orders priced on the posted per-gallon rate carry Florida *sales* tax, not
     the per-gallon excise assumed below. Those callers (admin Finance) pass
     their own tax line so the breakdown still reconciles to the total. */
  taxLine?: { label: string; amount: number; note: string },
): Receipt {
  const total = parsePrice(d.price ?? "$0");
  const gallons = d.gallonsDelivered ?? d.gallonsScheduled;
  const urgency = URGENCY_OPTIONS[d.urgency];
  const deliveryFee = urgency.fee;
  const taxes = taxLine ? taxLine.amount : round2(gallons * FL_FUEL_TAX_PER_GAL);
  const fuelCost = round2(total - deliveryFee - taxes);
  const rawPerGallon = gallons ? round2(fuelCost / gallons) : 0;
  const costPerGallon = gallons ? round2(total / gallons) : 0;

  return {
    orderNo: d.orderNo ?? 0,
    dateISO: d.dateISO,
    status,
    totalGallons: gallons,
    costPerGallon,
    total,
    seller: SELLER,
    // Bill-to name comes from the customer's Business Information (Settings).
    billTo: billToName ? { ...BILL_TO, name: billToName } : BILL_TO,
    relatedDeliveryId: d.id,
    lineItems: [
      {
        label: "Fuel Cost (pass-through)",
        amount: fuelCost,
        note: `${gallons} gal x ${money(rawPerGallon)}`,
      },
      {
        label: "Delivery fee",
        amount: deliveryFee,
        free: deliveryFee === 0,
        note: `${urgency.title} scheduled delivery`,
      },
      taxLine ?? {
        label: "Florida fuel tax (on-road)",
        amount: taxes,
        note: `$${FL_FUEL_TAX_PER_GAL.toFixed(3)}/gal • pass-through to FL DOR`,
      },
    ],
  };
}

export const RECEIPT_STATUS_LABEL: Record<ReceiptStatus, string> = {
  paid: "Paid",
  invoice_received: "Invoice Received",
};

/**
 * Derive the receipt list from completed deliveries, newest first. The most
 * recent completed delivery is "Invoice Received" (issued, not yet paid); the
 * rest are "Paid".
 */
export function receiptsFromDeliveries(
  deliveries: ScheduledDelivery[],
  billToName?: string,
): Receipt[] {
  const completed = deliveries
    .filter((d) => d.status === "completed" && d.orderNo)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  return completed.map((d, i) =>
    buildReceipt(d, i === 0 ? "invoice_received" : "paid", billToName),
  );
}
