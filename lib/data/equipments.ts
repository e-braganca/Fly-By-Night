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
const ON = "/equipments/on-road";

export const seedEquipments: Equipment[] = [
  // Off-road machinery (runs on tax-exempt dyed diesel).
  {
    id: "e1",
    name: "CAT 320 Excavator",
    classification: "Off-road",
    subtype: "Construction",
    maxTankCapacity: 90,
    quantity: 3,
    image: `${OFF}/excavator.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e2",
    name: "CAT 299D3 Compact Track Loader",
    classification: "Off-road",
    subtype: "Construction",
    maxTankCapacity: 30,
    quantity: 2,
    image: `${OFF}/compact-track-loader.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e3",
    name: "BOMAG Vibratory Soil Compactor",
    classification: "Off-road",
    subtype: "Construction",
    maxTankCapacity: 60,
    quantity: 1,
    image: `${OFF}/vibratory-soil-compactor.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e4",
    name: "Atlas Copco XAS 185 Air Compressor",
    classification: "Off-road",
    subtype: "Other",
    maxTankCapacity: 25,
    quantity: 2,
    image: `${OFF}/air-compressor.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e5",
    name: "Atlas Copco QAS 60 Diesel Generator",
    classification: "Off-road",
    subtype: "Generator",
    maxTankCapacity: 80,
    quantity: 1,
    image: `${OFF}/generator.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e6",
    name: "Atlas Copco QPAS 40 Light Tower",
    classification: "Off-road",
    subtype: "Lighting",
    maxTankCapacity: 30,
    quantity: 4,
    image: `${OFF}/light-tower.png`,
    location: DEFAULT_LOCATION,
  },
  // On-road, road-registered trucks (taxed on-road diesel).
  {
    id: "e7",
    name: "Volvo VHD Dump Truck",
    classification: "On-road",
    subtype: "Transport",
    maxTankCapacity: 100,
    quantity: 2,
    image: `${ON}/dump-truck.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e8",
    name: "Scania P360 Concrete Mixer Truck",
    classification: "On-road",
    subtype: "Transport",
    maxTankCapacity: 90,
    quantity: 1,
    image: `${ON}/concrete-mixer-truck.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e9",
    name: "Ford F-350 Work Truck",
    classification: "On-road",
    subtype: "Transport",
    maxTankCapacity: 40,
    quantity: 3,
    image: `${ON}/pickup-work-truck.png`,
    location: DEFAULT_LOCATION,
  },
  {
    id: "e10",
    name: "Freightliner Lowboy Hauler",
    classification: "On-road",
    subtype: "Transport",
    maxTankCapacity: 120,
    quantity: 1,
    image: `${ON}/semi-truck-lowboy.png`,
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
