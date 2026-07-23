/* Delivery metadata — seed data. The live, mutable list lives in the store. */

import type { Delivery } from "./types";

export const seedDeliveries: Delivery[] = Array.from({ length: 5 }, (_, i) => ({
  id: `d${i + 1}`,
  date: "July 17, 2026",
  gallons: 217,
  price: "$774.90",
  address: "123 Ocean Blvd, West Palm Beach, FL",
}));
