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
import {
  CONVENIENCE_FEE_FLAT,
  CONVENIENCE_FEE_RATE,
  DEF_FLAT,
  DEF_MAX,
  FL_TAX_RATE,
  OFF_ROAD_MIN,
  SMALL_ORDER_FEE,
  formatTaxRate,
} from "./pricing";

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

type Line = { label: string; amount: number; note: string };

/** A DR-13 or DR-97 on the delivery exempts it from sales tax. */
const isTaxExempt = (d: ScheduledDelivery) =>
  d.documents?.some((doc) => /DR-(13|97)/.test(doc.label)) ?? false;

/**
 * Build a Receipt from a completed delivery. The breakdown always reconciles to
 * the delivery's total, and is laid out in the order the total is built:
 * fuel (+ Small Order Fee) → delivery fee, DEF → card processing fee → sales tax.
 *
 * A delivery only stores its total, so the parts are worked back from it: tax
 * comes off first, then the card fee (3% + $30 of the fuel and fees), and the
 * fuel is what remains after the flat fees.
 */
export function buildReceipt(
  d: ScheduledDelivery,
  status: ReceiptStatus,
  billToName?: string,
  /* Callers that already know the exact breakdown (admin Finance) pass their
     own tax and card-fee lines; the fuel line is then what's left of the total. */
  taxLine?: Line,
  cardFeeLine?: Line,
): Receipt {
  const total = parsePrice(d.price ?? "$0");
  const gallons = d.gallonsDelivered ?? d.gallonsScheduled;
  const urgency = URGENCY_OPTIONS[d.urgency];
  const deliveryFee = urgency.fee;
  const smallOrder = gallons > 0 && gallons < OFF_ROAD_MIN ? SMALL_ORDER_FEE : 0;
  const def = d.addDef ? DEF_FLAT : 0;

  let tax: Line;
  let cardFee: Line | undefined;
  if (taxLine) {
    tax = taxLine;
    cardFee = cardFeeLine;
  } else {
    const exempt = isTaxExempt(d);
    const taxable = round2(total / (1 + (exempt ? 0 : FL_TAX_RATE)));
    // A card on file carries the processing fee; settling on delivery doesn't.
    const byCard = d.payment?.method !== "on_delivery";
    const beforeCard = byCard
      ? round2((taxable - CONVENIENCE_FEE_FLAT) / (1 + CONVENIENCE_FEE_RATE))
      : taxable;
    if (byCard) {
      cardFee = {
        label: "Card processing fee",
        amount: round2(taxable - beforeCard),
        note: `${CONVENIENCE_FEE_RATE * 100}% of ${money(beforeCard)} + $${CONVENIENCE_FEE_FLAT}`,
      };
    }
    tax = exempt
      ? { label: "Florida sales tax", amount: 0, note: "Exempt • certificate on file" }
      : {
          label: `Florida sales tax (${formatTaxRate(FL_TAX_RATE)})`,
          amount: round2(total - taxable),
          note: `${formatTaxRate(FL_TAX_RATE)} of ${money(taxable)} • Palm Beach County`,
        };
  }

  const fuelCost = round2(total - smallOrder - deliveryFee - def - (cardFee?.amount ?? 0) - tax.amount);
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
      ...(smallOrder
        ? [{ label: "Small order fee", amount: smallOrder, note: `Under the ${OFF_ROAD_MIN}-gallon minimum` }]
        : []),
      {
        label: "Delivery fee",
        amount: deliveryFee,
        free: deliveryFee === 0,
        note: `${urgency.title} scheduled delivery`,
      },
      ...(def ? [{ label: "DEF top-off", amount: def, note: `Flat rate, up to ${DEF_MAX} gal` }] : []),
      ...(cardFee ? [cardFee] : []),
      tax,
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
