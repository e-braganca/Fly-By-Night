/* Admin Finance — a deterministic cross-customer order ledger. Each order builds
   a real Receipt (reusing buildReceipt) so the "See Receipt" drawer and the table
   numbers always reconcile.

   Pricing follows the posted model in ./pricing: the customer is billed
   gallons x the posted per-gallon rate, plus the urgency delivery fee, plus
   Florida sales tax on that taxable base. Wholesale cost is tracked per order so
   the period KPIs can walk revenue down to net income. */

import type {
  Receipt,
  ReceiptStatus,
  ScheduledDelivery,
  DeliveryEquipmentLine,
  UrgencyTier,
} from "./types";
import { URGENCY_OPTIONS, parseISO, REFERENCE_TODAY } from "./schedule";
import { customers, type County } from "./customers";
import { buildReceipt, money } from "./receipts";
import {
  OFF_ROAD_PRICE,
  OFF_ROAD_MIN,
  taxRateForCounty,
  formatTaxRate,
  convenienceFeeOn,
  FL_STATE_TAX_RATE,
  COUNTY_SURTAX,
} from "./pricing";

/* Currency rounding. The nudge covers values that land exactly on a half cent
   (4966.275) but sit a hair below it in binary, which would otherwise round
   down and disagree with the books by a cent. */
const round2 = (n: number) => Math.round(n * 100 + (n >= 0 ? 1e-6 : -1e-6)) / 100;

/** What it costs us to put one delivery on the road: driver time, truck diesel,
    and the amortised slice of insurance and maintenance. Walks gross income down
    to operating income. At the current margin this is covered by roughly 160
    gallons, which is why the business sets a 200-gallon minimum. */
export const OPERATING_COST_PER_DELIVERY = 128;

/** Provision set aside on operating profit. Sales tax is NOT this — that money
    was never ours. */
export const INCOME_TAX_RATE = 0.21;

export { formatTaxRate };

const pad = (n: number) => String(n).padStart(2, "0");
function shiftDays(iso: string, days: number): string {
  const { y, m, d } = parseISO(iso);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
function isSunday(iso: string): boolean {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0;
}

const LINES: DeliveryEquipmentLine[] = [
  { name: "Wheel Tractor-Scraper", units: 9, gallonsMax: 560, fuelType: "Off-road" },
  { name: "Compact Track Loader", units: 2, gallonsMax: 560, fuelType: "Off-road" },
  { name: "50kw Mobile Silent Diesel Generator", units: 1, gallonsMax: 560, fuelType: "Off-road" },
];

export type FinanceOrder = {
  orderNo: number;
  dateISO: string;
  customerId: string;
  customerName: string;
  county: County;
  gallons: number;
  /** What a gallon costs us at the rack. */
  wholesalePerGallon: number;
  /** What we add on top of the rack price. */
  markupPerGallon: number;
  /** Posted per-gallon rate billed to the customer (wholesale + markup). */
  costPerGallon: number;
  /** Gallons x rate — the fuel bill. */
  fuelSubtotal: number;
  /** Which urgency tier the customer chose. */
  urgency: UrgencyTier;
  /** Urgency surcharge (0 for standard). */
  deliveryFee: number;
  /** Sales-tax rate applied, which depends on the delivery county. */
  taxRate: number;
  /** Florida's 6% state share. */
  stateTax: number;
  /** The county's discretionary surtax share. */
  countyTax: number;
  /** Both tax shares together. */
  tax: number;
  /** Fuel + fees + tax, before the card charge. */
  subtotal: number;
  /** Card-processing surcharge: 3% of the tax-inclusive subtotal, plus $30. */
  convenienceFee: number;
  /** Everything invoiced: fuel + fee + tax + convenience fee. */
  total: number;
  /** What the fuel cost us at the rack — the order's cost of goods sold. */
  cost: number;
  /** What the order actually earned: the fuel bill and the delivery fee, less
      what the fuel cost at the rack. Sales tax is excluded (it belongs to the
      state) and so is the card charge (it belongs to the processor). */
  margin: number;
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
    const customer = customers[(i * 3 + 1) % customers.length];
    // Never below the posted off-road minimum — a smaller load cannot carry
    // the cost of the truck roll.
    const gallons = OFF_ROAD_MIN + ((i * 37) % 72) * 5; // 200–555, in 5s

    // The posted rate drifts a few cents a day, the way the rack price does.
    const costPerGallon = round2(OFF_ROAD_PRICE + (((i * 13) % 17) - 8) / 100);
    // Wholesale is the posted rate less our margin, which moves independently.
    const wholesale = round2(costPerGallon - (0.82 + ((i * 17) % 28) / 100));

    const urgency: UrgencyTier =
      i % 11 === 5 ? "emergency_call_out" : i % 5 === 2 ? "after_hours_weekend" : "standard";
    const deliveryFee = URGENCY_OPTIONS[urgency].fee;

    const fuelSubtotal = round2(gallons * costPerGallon);
    const taxable = round2(fuelSubtotal + deliveryFee);
    const taxRate = taxRateForCounty(customer.county);
    const stateTax = round2(taxable * FL_STATE_TAX_RATE);
    const countyTax = round2(taxable * COUNTY_SURTAX[customer.county]);
    const tax = round2(stateTax + countyTax);
    const subtotal = round2(taxable + tax);
    const convenienceFee = convenienceFeeOn(subtotal);
    const total = round2(subtotal + convenienceFee);
    const cost = round2(gallons * wholesale);
    const margin = round2(taxable - cost);

    // The four most recent orders are billed but not yet settled.
    const status: ReceiptStatus = i < 4 ? "invoice_received" : "paid";

    const delivery: ScheduledDelivery = {
      id: `fin-${orderNo}`,
      orderNo,
      dateISO: iso,
      status: "completed",
      isEditable: false,
      address: customer.address,
      urgency,
      gallonsScheduled: gallons,
      gallonsDelivered: gallons,
      price: money(total),
      equipment: LINES,
    };

    out.push({
      orderNo,
      dateISO: iso,
      customerId: customer.id,
      customerName: customer.name,
      county: customer.county,
      gallons,
      wholesalePerGallon: wholesale,
      markupPerGallon: round2(costPerGallon - wholesale),
      costPerGallon,
      fuelSubtotal,
      urgency,
      deliveryFee,
      taxRate,
      stateTax,
      countyTax,
      tax,
      subtotal,
      convenienceFee,
      total,
      cost,
      margin,
      status,
      receipt: buildReceipt(delivery, status, customer.name, {
        label: `Florida sales tax (${formatTaxRate(taxRate)})`,
        amount: tax,
        note: `${formatTaxRate(taxRate)} of ${money(taxable)} • ${customer.county} County`,
      }),
    });

    iso = shiftDays(iso, -(1 + ((i * 7 + 3) % 6))); // step back 1–6 days
    // Deliveries never land on a Sunday (only rare emergencies) — nudge off it.
    if (isSunday(iso)) iso = shiftDays(iso, -1);
  }

  return out;
})();

/** Oldest and newest dates in the ledger, for seeding the date-range filter. */
export const LEDGER_RANGE = {
  from: financeOrders[financeOrders.length - 1].dateISO,
  to: financeOrders[0].dateISO,
};

export type FinanceFilters = {
  customerId: string | "all";
  county: County | "all";
  fromISO: string;
  toISO: string;
  query: string;
};

export function filterOrders(orders: FinanceOrder[], f: FinanceFilters): FinanceOrder[] {
  const q = f.query.trim().toLowerCase().replace("#", "");
  return orders.filter((o) => {
    if (f.customerId !== "all" && o.customerId !== f.customerId) return false;
    if (f.county !== "all" && o.county !== f.county) return false;
    if (f.fromISO && o.dateISO < f.fromISO) return false;
    if (f.toISO && o.dateISO > f.toISO) return false;
    if (q && !String(o.orderNo).includes(q) && !o.customerName.toLowerCase().includes(q))
      return false;
    return true;
  });
}

/**
 * The period figures behind the KPI cards.
 *
 *   revenue   = fuel + fees, EXCLUDING sales tax. Tax collected from a customer
 *               is held for the state, so it is never revenue and never gets
 *               subtracted from profit further down.
 *   gross     = revenue, less what the fuel cost us at the rack
 *   operating = gross, less the cost of running the deliveries
 *   taxOwed   = sales tax collected and due to Florida — a liability shown so it
 *               can be set aside, deliberately NOT part of the chain above
 *   net       = operating, less the provision on that profit
 *
 * The chain is checkable end to end: revenue - cost = gross, gross - operatingCost
 * = operating, operating - incomeTax = net. The table's "Total Invoiced" column
 * sums to revenue + taxOwed.
 */
export function financeStats(orders: FinanceOrder[]) {
  const invoiced = round2(orders.reduce((s, o) => s + o.total, 0));
  const taxOwed = round2(orders.reduce((s, o) => s + o.tax, 0));
  const revenue = round2(invoiced - taxOwed);
  const cost = round2(orders.reduce((s, o) => s + o.cost, 0));
  const deliveryFees = round2(orders.reduce((s, o) => s + o.deliveryFee, 0));
  const convenienceFees = round2(orders.reduce((s, o) => s + o.convenienceFee, 0));
  const margin = round2(orders.reduce((s, o) => s + o.margin, 0));
  const operatingCost = round2(orders.length * OPERATING_COST_PER_DELIVERY);

  const grossIncome = round2(revenue - cost);
  const operatingIncome = round2(grossIncome - operatingCost);
  const incomeTax = round2(Math.max(0, operatingIncome) * INCOME_TAX_RATE);
  const netIncome = round2(operatingIncome - incomeTax);

  return {
    orders: orders.length,
    invoiced,
    revenue,
    grossIncome,
    operatingIncome,
    taxOwed,
    deliveryFees,
    convenienceFees,
    margin,
    incomeTax,
    netIncome,
    cost,
    operatingCost,
    gallons: orders.reduce((s, o) => s + o.gallons, 0),
  };
}
