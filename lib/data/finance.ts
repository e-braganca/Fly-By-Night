/* Admin Finance — a deterministic cross-customer order ledger. Each order builds
   a real Receipt (reusing buildReceipt) so the "See Receipt" drawer and the table
   numbers always reconcile. KPIs (gross income split into fuel + delivery-fee
   profit) are derived from the same ledger, filtered by the Week/Month/Year toggle. */

import type {
  Receipt,
  ReceiptStatus,
  ScheduledDelivery,
  DeliveryEquipmentLine,
  UrgencyTier,
} from "./types";
import { URGENCY_OPTIONS, parseISO, REFERENCE_TODAY } from "./schedule";
import { customers } from "./customers";
import { buildReceipt, money } from "./receipts";

const round2 = (n: number) => Math.round(n * 100) / 100;
const FL_FUEL_TAX_PER_GAL = 0.359;

const pad = (n: number) => String(n).padStart(2, "0");
function shiftDays(iso: string, days: number): string {
  const { y, m, d } = parseISO(iso);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

const LINES: DeliveryEquipmentLine[] = [
  { name: "Wheel Tractor-Scraper", units: 9, gallonsMax: 560, fuelType: "Off-road" },
  { name: "Compact Track Loader", units: 2, gallonsMax: 560, fuelType: "Off-road" },
  { name: "50kw Mobile Silent Diesel Generator", units: 1, gallonsMax: 560, fuelType: "Off-road" },
];

export type FinancePeriod = "week" | "month" | "year";

export const FINANCE_PERIODS: { key: FinancePeriod; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export type FinanceOrder = {
  orderNo: number;
  dateISO: string;
  customerName: string;
  gallons: number;
  /** Effective $/gal billed to the customer (total / gallons). */
  costPerGallon: number;
  /** Total invoiced (fuel + delivery fee + FL tax). */
  total: number;
  /** Margin on fuel = gallons × markup. */
  fuelProfit: number;
  /** Delivery fee collected (0 for standard). */
  deliveryFeeProfit: number;
  status: ReceiptStatus;
  receipt: Receipt;
};

const NEWEST_ORDER_NO = 871;
const LEDGER_SIZE = 60;

/** Order ledger, newest first (index 0 = most recent, order #871). */
export const financeOrders: FinanceOrder[] = (() => {
  const out: FinanceOrder[] = [];
  let iso = REFERENCE_TODAY;

  for (let i = 0; i < LEDGER_SIZE; i++) {
    const orderNo = NEWEST_ORDER_NO - i;
    const customerName = customers[(i * 3 + 1) % customers.length].name;
    const gallons = 150 + ((i * 37) % 82) * 5; // 150–555, in 5s
    const base = round2(2.3 + ((i * 13) % 40) / 100); // 2.30–2.69
    const markup = round2(0.9 + ((i * 17) % 50) / 100); // 0.90–1.39

    const urgency: UrgencyTier =
      i % 11 === 5 ? "emergency_call_out" : i % 5 === 2 ? "after_hours_weekend" : "standard";
    const deliveryFee = URGENCY_OPTIONS[urgency].fee;

    const fuelSell = round2(gallons * (base + markup));
    const tax = round2(gallons * FL_FUEL_TAX_PER_GAL);
    const total = round2(fuelSell + deliveryFee + tax);
    const costPerGallon = round2(total / gallons);
    const fuelProfit = round2(gallons * markup);

    // The four most recent orders are billed but not yet settled.
    const status: ReceiptStatus = i < 4 ? "invoice_received" : "paid";

    const delivery: ScheduledDelivery = {
      id: `fin-${orderNo}`,
      orderNo,
      dateISO: iso,
      status: "completed",
      isEditable: false,
      address: customers[(i * 3 + 1) % customers.length].address,
      urgency,
      gallonsScheduled: gallons,
      gallonsDelivered: gallons,
      price: money(total),
      equipment: LINES,
    };

    out.push({
      orderNo,
      dateISO: iso,
      customerName,
      gallons,
      costPerGallon,
      total,
      fuelProfit,
      deliveryFeeProfit: deliveryFee,
      status,
      receipt: buildReceipt(delivery, status, customerName),
    });

    iso = shiftDays(iso, -(1 + ((i * 7 + 3) % 6))); // step back 1–6 days
  }

  return out;
})();

/** Keep orders whose date falls inside the rolling window for `period`. */
export function ordersInPeriod(period: FinancePeriod): FinanceOrder[] {
  const windowDays = period === "week" ? 7 : period === "month" ? 30 : 365;
  const cutoff = shiftDays(REFERENCE_TODAY, -windowDays);
  return financeOrders.filter((o) => o.dateISO >= cutoff);
}

export function financeStats(orders: FinanceOrder[]) {
  const fuelProfit = round2(orders.reduce((s, o) => s + o.fuelProfit, 0));
  const deliveryFeeProfit = round2(orders.reduce((s, o) => s + o.deliveryFeeProfit, 0));
  return {
    orders: orders.length,
    grossIncome: round2(fuelProfit + deliveryFeeProfit),
    fuelProfit,
    deliveryFeeProfit,
  };
}
