/*
  Fuel-request pricing model — mirrors the Service Agreement (§4/§5):

  - Off-Road Dyed Diesel is billed per gallon at the posted rate, with a 200-gallon
    minimum. Orders below the minimum, when accepted, carry a $150 Small Order Fee.
  - DEF Top-Off is a flat service call per visit, up to a 25-gallon allowance,
    regardless of the exact quantity dispensed.
  - Florida sales tax (6.5%) applies to taxable fuel and fees unless the customer
    has a valid exemption certificate (DR-13 resale or DR-97 agricultural) on file.
*/

export type FuelTypeId = "off_road" | "def";

/** Posted per-gallon rate for off-road dyed diesel (USD). */
export const OFF_ROAD_PRICE = 3.37;
/** Minimum off-road fuel order, in gallons (§4). */
export const OFF_ROAD_MIN = 200;
/** Small Order Fee added to sub-minimum off-road orders (§4/§5). */
export const SMALL_ORDER_FEE = 150;
/** Flat DEF Top-Off service rate per visit (USD). */
export const DEF_FLAT = 95;
/** Volume allowance included in a DEF Top-Off visit, in gallons. */
export const DEF_MAX = 25;
/** Florida sales tax + county discretionary surtax applied to taxable fuel. */
export const FL_TAX_RATE = 0.065;

export type FuelTypeDef = {
  id: FuelTypeId;
  name: string;
  desc: string;
  /** Headline price for the card. */
  price: number;
  unit: "gal" | "visit";
  badge: string;
};

export const FUEL_TYPES: FuelTypeDef[] = [
  {
    id: "off_road",
    name: "Off-Road Dyed Diesel",
    desc: "Generators, equipment, tanks. Sold for off-road use.",
    price: OFF_ROAD_PRICE,
    unit: "gal",
    badge: "PER GAL",
  },
  {
    id: "def",
    name: "DEF Top-Off",
    desc: "Diesel Exhaust Fluid. Flat service call, up to 25 gallons.",
    price: DEF_FLAT,
    unit: "visit",
    badge: "PER VISIT",
  },
];

export type CostBreakdown = {
  /** Product subtotal (fuel gallons × rate, or the DEF flat rate). */
  fuel: number;
  /** Small Order Fee, if the off-road order is below the minimum. */
  smallOrder: number;
  /** Urgency / delivery-speed surcharge. */
  urgency: number;
  /** Sum subject to sales tax. */
  taxable: number;
  /** Sales tax charged (0 when exempt). */
  tax: number;
  /** Grand total. */
  total: number;
  /** True when an off-road order sits below the 200-gallon minimum. */
  belowMinimum: boolean;
};

export function computeCost(opts: {
  fuelType: FuelTypeId | null;
  gallons: number;
  taxExempt: boolean;
  urgencyFee: number;
}): CostBreakdown {
  const { fuelType, gallons, taxExempt, urgencyFee } = opts;

  if (fuelType === "def") {
    const fuel = DEF_FLAT;
    const taxable = fuel + urgencyFee;
    const tax = taxExempt ? 0 : taxable * FL_TAX_RATE;
    return {
      fuel,
      smallOrder: 0,
      urgency: urgencyFee,
      taxable,
      tax,
      total: taxable + tax,
      belowMinimum: false,
    };
  }

  // Off-road dyed diesel (also the default before a type is chosen).
  const fuel = gallons * OFF_ROAD_PRICE;
  const belowMinimum = gallons > 0 && gallons < OFF_ROAD_MIN;
  const smallOrder = belowMinimum ? SMALL_ORDER_FEE : 0;
  const taxable = fuel + smallOrder + urgencyFee;
  const tax = taxExempt ? 0 : taxable * FL_TAX_RATE;
  return {
    fuel,
    smallOrder,
    urgency: urgencyFee,
    taxable,
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
