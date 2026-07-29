/* Equipment metadata — seed data + helpers. The live, mutable list lives in the store. */

import type { Equipment, EquipmentClass } from "./types";

export const DEFAULT_LOCATION = "123 Ocean Blvd, West Palm Beach, FL";

export const EQUIPMENT_CLASSES: EquipmentClass[] = ["On-road", "Off-road"];

export const EQUIPMENT_SUBTYPES = [
  "Construction",
  "Agriculture",
  "Generator",
  "Lighting",
  "Transport",
  "Other",
] as const;

const OFF = "/equipments/off-road";

/*
  A small, realistic fleet for the demo: three pieces of off-road machinery with
  a couple of units each. All off-road on purpose — the company only delivers
  dyed diesel and DEF, never on-road fuel (see the Service Agreement §3).
*/
export const seedEquipments: Equipment[] = [
  {
    id: "e1",
    name: "CAT 320 Excavator",
    classification: "Off-road",
    subtype: "Construction",
    maxTankCapacity: 90,
    quantity: 2,
    image: `${OFF}/excavator.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e2",
    name: "Atlas Copco QAS 60 Diesel Generator",
    classification: "Off-road",
    subtype: "Generator",
    maxTankCapacity: 80,
    quantity: 1,
    image: `${OFF}/generator.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e3",
    name: "Atlas Copco QPAS 40 Light Tower",
    classification: "Off-road",
    subtype: "Lighting",
    maxTankCapacity: 30,
    quantity: 3,
    image: `${OFF}/light-tower.png`,
    location: DEFAULT_LOCATION,
  },
];

/** "1 Unit" / "9 Units" */
export function unitsLabel(quantity: number): string {
  return `${quantity} ${quantity === 1 ? "Unit" : "Units"}`;
}

/** Total tank capacity across all units, e.g. "250 Gallons Total". */
export function gallonsTotalLabel(e: {
  maxTankCapacity: number;
  quantity: number;
}): string {
  return `${e.maxTankCapacity * e.quantity} Gallons Total`;
}
