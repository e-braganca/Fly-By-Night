/*
  Fuel-request pricing model — mirrors the Service Agreement (§4/§5):

  - Diesel is billed per gallon at the posted rate, with a 200-gallon minimum.
    Orders below the minimum, when accepted, carry a $150 Small Order Fee.
  - DEF is an optional add-on to a diesel delivery: a flat service call, up to a
    25-gallon allowance, regardless of the exact quantity dispensed.
  - Florida sales tax applies to taxable fuel and fees unless the customer has a
    valid exemption certificate (DR-13 resale or DR-97 agricultural) on file. It
    splits into the 6% state rate and Palm Beach County's 0.5% surtax.

  An order total is built in this order:
    1. Fuel — gallons × rate, plus the Small Order Fee below the minimum.
    2. Flat fees — delivery speed (after-hours, emergency call-out), DEF top-off.
    3. Card processing fee — on 1 + 2 only, never on tax.
    4. Sales tax and county surtax — on 1 + 2 + 3.
*/

import type { County } from "./customers";

export type FuelTypeId = "off_road" | "on_road";

/** Posted per-gallon rate for off-road dyed diesel (USD). */
export const OFF_ROAD_PRICE = 3.37;
/** Posted per-gallon rate for on-road (clear) diesel — road tax included. */
export const ON_ROAD_PRICE = 3.89;
/** Minimum diesel order, in gallons (§4). */
export const OFF_ROAD_MIN = 200;
/** Small Order Fee added to sub-minimum orders (§4/§5). */
export const SMALL_ORDER_FEE = 150;
/** Flat DEF top-off service rate per visit (USD). */
export const DEF_FLAT = 95;
/** Volume allowance included in a DEF top-off, in gallons. */
export const DEF_MAX = 25;

/** Florida state sales tax. */
export const FL_STATE_TAX_RATE = 0.06;
/** Palm Beach County discretionary surtax. */
export const COUNTY_SURTAX_RATE = 0.005;
/** Combined rate charged on taxable fuel and fees in Palm Beach (6.5%). */
export const FL_TAX_RATE = FL_STATE_TAX_RATE + COUNTY_SURTAX_RATE;

/* The discretionary surtax is set per county on top of the 6% state rate. Of the
   counties we reach, only Palm Beach levies one today — the others bill at the
   state rate. Add a county here when that changes. */
export const COUNTY_SURTAX: Record<County, number> = {
  "Palm Beach": COUNTY_SURTAX_RATE,
  Broward: 0,
  Collier: 0,
};

/* Card-processing fee: a rate on the fuel and fees it's charged against (never
   the tax), plus a flat charge. It then joins the taxable amount, since Florida
   taxes any fee added to the sale. */
export const CONVENIENCE_FEE_RATE = 0.03;
export const CONVENIENCE_FEE_FLAT = 30;

/** 3% of `base`, plus $30. */
export function convenienceFeeOn(base: number): number {
  return Math.round((base * CONVENIENCE_FEE_RATE + CONVENIENCE_FEE_FLAT) * 100 + 1e-6) / 100;
}

/** Sales-tax rate for a delivery address, e.g. 0.065 in Palm Beach, 0.06 elsewhere. */
export function taxRateForCounty(county: County): number {
  return FL_STATE_TAX_RATE + (COUNTY_SURTAX[county] ?? 0);
}

/** 0.065 -> "6.5%", 0.06 -> "6%". */
export function formatTaxRate(rate: number): string {
  return `${Number((rate * 100).toFixed(2))}%`;
}

export type FuelTypeDef = {
  id: FuelTypeId;
  name: string;
  desc: string;
  /** Per-gallon rate for the card. */
  price: number;
};

export const FUEL_TYPES: FuelTypeDef[] = [
  {
    id: "off_road",
    name: "Off-Road Dyed Diesel",
    desc: "Generators, equipment, tanks. Sold for off-road use.",
    price: OFF_ROAD_PRICE,
  },
  {
    id: "on_road",
    name: "On-Road Diesel",
    desc: "Fleet trucks and road vehicles. Road tax included in the price.",
    price: ON_ROAD_PRICE,
  },
];

export function ratePerGallon(fuelType: FuelTypeId | null): number {
  return fuelType === "on_road" ? ON_ROAD_PRICE : OFF_ROAD_PRICE;
}

export type CostBreakdown = {
  /** Diesel subtotal (gallons × rate). */
  fuel: number;
  /** Small Order Fee, if the order is below the minimum. */
  smallOrder: number;
  /** DEF top-off, if added (flat rate). */
  def: number;
  /** Urgency / delivery-speed surcharge. */
  urgency: number;
  /** Fuel and flat fees, before the card fee and tax. */
  subtotal: number;
  /** Card processing fee (0 unless paying by card). */
  cardFee: number;
  /** Sum subject to sales tax — the subtotal plus the card fee. */
  taxable: number;
  /** Florida state portion of the sales tax (0 when exempt). */
  stateTax: number;
  /** Palm Beach County surtax portion (0 when exempt). */
  countyTax: number;
  /** Total sales tax charged (state + county). */
  tax: number;
  /** Grand total. */
  total: number;
  /** True when the order sits below the 200-gallon minimum. */
  belowMinimum: boolean;
};

export function computeCost(opts: {
  fuelType: FuelTypeId | null;
  gallons: number;
  /** DEF top-off added to this delivery. */
  addDef?: boolean;
  taxExempt: boolean;
  urgencyFee: number;
  /** Paying by card, which adds the processing fee before tax. */
  byCard?: boolean;
}): CostBreakdown {
  const { fuelType, gallons, addDef = false, taxExempt, urgencyFee, byCard = false } = opts;

  const fuel = gallons * ratePerGallon(fuelType);
  const belowMinimum = gallons > 0 && gallons < OFF_ROAD_MIN;
  const smallOrder = belowMinimum ? SMALL_ORDER_FEE : 0;
  const def = addDef ? DEF_FLAT : 0;

  const subtotal = fuel + smallOrder + urgencyFee + def;
  const cardFee = byCard ? convenienceFeeOn(subtotal) : 0;
  const taxable = subtotal + cardFee;
  const stateTax = taxExempt ? 0 : taxable * FL_STATE_TAX_RATE;
  const countyTax = taxExempt ? 0 : taxable * COUNTY_SURTAX_RATE;
  const tax = stateTax + countyTax;

  return {
    fuel,
    smallOrder,
    def,
    urgency: urgencyFee,
    subtotal,
    cardFee,
    taxable,
    stateTax,
    countyTax,
    tax,
    total: taxable + tax,
    belowMinimum,
  };
}

/** "$1,234.50" */
export function money(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
