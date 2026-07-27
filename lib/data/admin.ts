/* Admin (operator console) metadata — seed data for the admin dashboard. */

export const adminProfile = {
  name: "Alex Morrison",
  email: "amorrison@punchlinepetroleum.com",
  notifications: 12,
};

export type AdminWeekDay = {
  label: string;
  date: number;
  state: "muted" | "today" | "tomorrow" | "disabled";
  caption?: string;
};

// Week of the app's current date (Thursday, July 23 2026).
export const adminWeek: AdminWeekDay[] = [
  { label: "MON", date: 20, state: "muted" },
  { label: "TUE", date: 21, state: "muted" },
  { label: "WED", date: 22, state: "muted" },
  { label: "THU", date: 23, state: "today", caption: "TODAY'S DELIVERIES" },
  { label: "FRI", date: 24, state: "tomorrow", caption: "TOMORROW'S DELIVERIES" },
  { label: "SAT", date: 25, state: "muted" },
  { label: "SUN", date: 26, state: "disabled" },
];

export const dayKpis = {
  fuelDelivered: 75,
  fuelCapacity: 900,
  locationsDone: 1,
  locationsTotal: 11,
};

export const nextDeliveryAddress = "123 Ocean Blvd, West Palm Beach, FL.";

export type AdminDeliveryStatus = "Completed" | "Next" | "Scheduled";
export type Period = "MORNING" | "AFTERNOON" | "EVENING";

/* Per-unit fueling record (captured while the operator fills each unit). */
export type FuelingUnit = {
  unitNumber: string;
  /** Gallons filled into this unit (starts at 0 — the operator enters it). */
  gallons: number;
  /** True once the operator has moved past this unit / completed it. */
  done?: boolean;
  note?: string;
  equipmentPhoto?: string;
  odometerPhoto?: string;
};

/* One requested equipment on a delivery, with its individual units to fill. */
export type FuelingEquipment = {
  id: string;
  name: string;
  image?: string;
  /** Equipment-level note, e.g. "Key is on administration building." */
  notes?: string;
  /** Max tank capacity per unit (gallons). When omitted, any amount is allowed. */
  maxGallons?: number;
  units: FuelingUnit[];
  /** True once every unit has been fueled. */
  completed: boolean;
};

export type AdminDelivery = {
  id: string;
  street: string;
  city: string;
  /** e.g. "75 gal" or "Up to 192 gal". */
  gallons: string;
  units: number;
  status: AdminDeliveryStatus;
  /** Equipment selected at schedule time — drives the Complete Fueling drawer. */
  equipment?: FuelingEquipment[];
};

/* Pricing for the current fuel type (Off-road Diesel). */
export const FUEL_BASE_PRICE = 2.32;
export const FUEL_MARKUP = 1.0;
export const FUEL_OVERRIDE_DEFAULT = 1.3;
export const FUEL_CAPACITY = 150;

const genUnit = (prefix: string, i: number) => `${prefix}${100000 + i * 1111}`;

function mkUnits(prefix: string, count: number): FuelingUnit[] {
  return Array.from({ length: count }, (_, i) => ({
    unitNumber: genUnit(prefix, i),
    gallons: 0, // operator fills the real amount during fueling
  }));
}

/* Equipment requested for the delivery being fueled (from the schedule). */
export const FUELING_SEED: FuelingEquipment[] = [
  {
    id: "fe1",
    name: "Wheel Tractor-Scraper",
    image: "/equipments/off-road/excavator.png",
    notes: "Parked by the north gate.",
    maxGallons: 20,
    units: mkUnits("A", 3),
    completed: false,
  },
  {
    id: "fe2",
    name: "Compact Track Loader",
    image: "/equipments/off-road/compact-track-loader.png",
    notes: "Key is on administration building.",
    maxGallons: 30,
    units: mkUnits("B", 9),
    completed: false,
  },
  {
    id: "fe3",
    name: "50kw Mobile Silent Diesel Generator",
    image: "/equipments/off-road/generator.png",
    maxGallons: 55,
    units: mkUnits("C", 1),
    completed: false,
  },
  {
    id: "fe4",
    name: "Storike Mobile Light Tower",
    image: "/equipments/off-road/light-tower.png",
    units: mkUnits("D", 2),
    completed: false,
  },
];

export type BoardColumn = {
  period: Period;
  deliveries: (AdminDelivery | null)[]; // null = empty delivery slot
  delivered: number;
  capacityLabel: string; // "/ 276 gal" or "/ Up to 598 gal"
};

export const board: BoardColumn[] = [
  {
    period: "MORNING",
    delivered: 75,
    capacityLabel: "/ 276 gal",
    deliveries: [
      {
        id: "d1",
        street: "123 Maple Avenue",
        city: "Sunnyvale, FL",
        gallons: "75 gal",
        units: 12,
        status: "Completed",
      },
      {
        id: "d2",
        street: "789 Maple Lane",
        city: "Sunnyvale, FL",
        gallons: "Up to 192 gal",
        units: 15,
        status: "Next",
      },
    ],
  },
  {
    period: "AFTERNOON",
    delivered: 0,
    capacityLabel: "/ Up to 598 gal",
    deliveries: [
      {
        id: "d3",
        street: "321 Elm Avenue",
        city: "Fort Lauderdale, FL",
        gallons: "Up to 120 gal",
        units: 12,
        status: "Scheduled",
      },
      null,
    ],
  },
  {
    period: "EVENING",
    delivered: 0,
    capacityLabel: "/ Up to 598 gal",
    deliveries: [
      {
        id: "d4",
        street: "123 Ocean Blvd",
        city: "West Palm Beach, FL",
        gallons: "Up to 86 gal",
        units: 9,
        status: "Scheduled",
      },
      {
        id: "d5",
        street: "456 Sunset Drive",
        city: "Coral Springs, FL",
        gallons: "Up to 220 gal",
        units: 13,
        status: "Scheduled",
      },
    ],
  },
];

/** Tomorrow's board (Fri Jul 24) — everything is still Scheduled. */
export const tomorrowBoard: BoardColumn[] = [
  {
    period: "MORNING",
    delivered: 0,
    capacityLabel: "/ Up to 236 gal",
    deliveries: [
      { id: "t1", street: "88 Cypress Way", city: "Naples, FL", gallons: "Up to 140 gal", units: 8, status: "Scheduled" },
      { id: "t2", street: "12 Palm Street", city: "Boca Raton, FL", gallons: "Up to 96 gal", units: 6, status: "Scheduled" },
    ],
  },
  {
    period: "AFTERNOON",
    delivered: 0,
    capacityLabel: "/ Up to 220 gal",
    deliveries: [
      { id: "t3", street: "456 Sunset Drive", city: "Coral Springs, FL", gallons: "Up to 220 gal", units: 13, status: "Scheduled" },
      null,
    ],
  },
  {
    period: "EVENING",
    delivered: 0,
    capacityLabel: "/ Up to 312 gal",
    deliveries: [
      { id: "t4", street: "321 Elm Avenue", city: "Fort Lauderdale, FL", gallons: "Up to 120 gal", units: 12, status: "Scheduled" },
      { id: "t5", street: "789 Maple Lane", city: "Sunnyvale, FL", gallons: "Up to 192 gal", units: 15, status: "Scheduled" },
    ],
  },
];

/* Next-delivery status machine (drives the top banner). */
export type BannerStep = {
  key: string;
  /** current-status label shown in the banner. */
  current: string;
  /** label of the button that advances to the next step. */
  next: string;
  nextIcon: "truck" | "nozzle" | "check";
  alert?: boolean;
};

export const BANNER_STEPS: BannerStep[] = [
  { key: "scheduled", current: "Delivery scheduled", next: "En Route", nextIcon: "truck" },
  { key: "en_route", current: "En Route", next: "On Scene", nextIcon: "truck" },
  { key: "on_scene", current: "On Scene", next: "Start Fueling", nextIcon: "nozzle" },
  { key: "fueling", current: "Fueling", next: "Complete", nextIcon: "check" },
];

/** Truck fuel level — when low, the banner switches to the amber "Fill My Tank" alert. */
export const truckTankRemaining = 31;
