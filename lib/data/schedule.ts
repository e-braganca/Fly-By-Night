/* Scheduled-delivery metadata — seed data + helpers. Live list lives in the store. */

import type {
  ScheduledDelivery,
  DeliveryEquipmentLine,
  DeliveryStatus,
  UrgencyOption,
  UrgencyTier,
} from "./types";
import { DEFAULT_LOCATION } from "./equipments";

/** Reference "today" for the demo — the app's current date. Drives grouping,
    the calendars, the week strips, and whether a delivery is past (locked) or
    upcoming (editable). */
export const REFERENCE_TODAY = "2026-07-23";

export const URGENCY_OPTIONS: Record<UrgencyTier, UrgencyOption> = {
  standard: {
    tier: "standard",
    title: "Standard",
    description: "Weekdays 9am - 5pm. Same-day or next-day window.",
    fee: 0,
    icon: "calendar",
  },
  after_hours_weekend: {
    tier: "after_hours_weekend",
    title: "After-Hours",
    description: "Weekdays after 5pm.",
    fee: 150,
    icon: "clock",
  },
  emergency_call_out: {
    tier: "emergency_call_out",
    title: "Emergency Call-Out",
    description: "4 hours turnaround",
    fee: 250,
    icon: "alert",
  },
};

export function feeLabel(fee: number): string {
  return fee === 0 ? "Free" : `$${fee}`;
}

const NOTE_LESS =
  "Refuelling was 3 gallons less than the scheduled amount due to equipment capacity.";
const NOTE_MORE =
  "Refuelling was 11 gallons more than the scheduled amount due to equipment capacity.";

/* Mirrors the customer's fleet in ./equipments so a delivery never lists gear
   they don't own. 2×90 + 1×80 + 3×30 = 350 gal of capacity. */
const defaultLines: DeliveryEquipmentLine[] = [
  { name: "CAT 320 Excavator", units: 2, gallonsMax: 90, fuelType: "Off-road" },
  { name: "Atlas Copco QAS 60 Diesel Generator", units: 1, gallonsMax: 80, fuelType: "Off-road" },
  { name: "Atlas Copco QPAS 40 Light Tower", units: 3, gallonsMax: 30, fuelType: "Off-road" },
];

const certificate = [
  {
    label: "DR-97 Tax-Exempt Certificate",
    filename: "certificate-9834788755.pdf",
    url: "#",
  },
];

export const seedScheduledDeliveries: ScheduledDelivery[] = [
  // Upcoming (after today = 2026-07-23) — editable, except the nearest one which
  // is inside the lead-time window and therefore locked.
  {
    id: "s1",
    dateISO: "2026-08-07",
    status: "scheduled",
    isEditable: true,
    address: DEFAULT_LOCATION,
    urgency: "standard",
    gallonsScheduled: 220,
    equipment: defaultLines,
    documents: certificate,
  },
  {
    id: "s2",
    dateISO: "2026-07-31",
    status: "scheduled",
    isEditable: true,
    address: DEFAULT_LOCATION,
    urgency: "standard",
    gallonsScheduled: 220,
    equipment: defaultLines,
    documents: certificate,
  },
  {
    id: "s3",
    dateISO: "2026-07-24",
    status: "scheduled",
    isEditable: false,
    address: DEFAULT_LOCATION,
    urgency: "standard",
    gallonsScheduled: 220,
    equipment: defaultLines,
    documents: certificate,
  },
  // Completed this month (July 2026).
  {
    id: "s4",
    orderNo: 871,
    dateISO: "2026-07-17",
    status: "completed",
    isEditable: false,
    address: DEFAULT_LOCATION,
    urgency: "standard",
    gallonsScheduled: 220,
    gallonsDelivered: 217,
    price: "$763.51",
    equipment: defaultLines,
    notes: NOTE_LESS,
    documents: certificate,
  },
  {
    id: "s5",
    orderNo: 843,
    dateISO: "2026-07-10",
    status: "completed",
    isEditable: false,
    address: DEFAULT_LOCATION,
    urgency: "standard",
    gallonsScheduled: 220,
    gallonsDelivered: 231,
    price: "$789.78",
    equipment: defaultLines,
    notes: NOTE_MORE,
    documents: certificate,
  },
  // Completed previously (before July).
  ...[
    { dateISO: "2026-06-26", orderNo: 798 },
    { dateISO: "2026-06-19", orderNo: 756 },
    { dateISO: "2026-06-12", orderNo: 733 },
    { dateISO: "2026-06-05", orderNo: 702 },
  ].map(
    ({ dateISO, orderNo }, i): ScheduledDelivery => ({
      id: `s${6 + i}`,
      orderNo,
      dateISO,
      status: "completed",
      isEditable: false,
      address: DEFAULT_LOCATION,
      urgency: "standard",
      gallonsScheduled: 220,
      gallonsDelivered: 231,
      price: "$778.90",
      equipment: defaultLines,
      notes: NOTE_MORE,
      documents: certificate,
    }),
  ),
];

/* ---- Date helpers (no locale deps; avoids hydration drift) ---- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-05-15" → "May 15, 2026" */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** True when `iso` falls before the app's current date (2026-07-23). */
export function isPastDate(iso: string): boolean {
  return iso < REFERENCE_TODAY;
}

/** Monday–Friday. */
export function isWeekday(iso: string): boolean {
  const { y, m, d } = parseISO(iso);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow >= 1 && dow <= 5;
}

/** Monday–Saturday. We never deliver on a Sunday, whatever the urgency. */
export function isNotSunday(iso: string): boolean {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() !== 0;
}

export type DeliveryWindowName = "Morning" | "Afternoon" | "Evening";

/**
 * Availability rules per urgency tier (drives the schedule step):
 * - Standard      → weekdays 9am–5pm  → Morning + Afternoon (no Evening)
 * - After-Hours   → weekdays after 5pm → Evening only
 * - Emergency     → any day, any window
 */
export const URGENCY_SCHEDULE: Record<
  UrgencyTier,
  { allowsDay: (iso: string) => boolean; windows: DeliveryWindowName[] }
> = {
  standard: { allowsDay: isWeekday, windows: ["Morning", "Afternoon"] },
  after_hours_weekend: { allowsDay: isWeekday, windows: ["Evening"] },
  // Emergency reaches Saturdays and any window — but never a Sunday.
  emergency_call_out: {
    allowsDay: isNotSunday,
    windows: ["Morning", "Afternoon", "Evening"],
  },
};

/**
 * A delivery can be rescheduled / cancelled only when it is still scheduled,
 * not locked (lead-time), AND not in the past — past deliveries are history.
 */
export function canModifyDelivery(d: {
  status: DeliveryStatus;
  isEditable: boolean;
  dateISO: string;
}): boolean {
  return d.status === "scheduled" && d.isEditable && !isPastDate(d.dateISO);
}

export type ScheduleGroup = "upcoming" | "done_this_month" | "previously";

export function groupOf(d: ScheduledDelivery): ScheduleGroup {
  if (d.status === "scheduled") return "upcoming";
  const ref = parseISO(REFERENCE_TODAY);
  const { y, m } = parseISO(d.dateISO);
  if (y === ref.y && m === ref.m) return "done_this_month";
  return "previously";
}

export const GROUP_LABELS: Record<ScheduleGroup, string> = {
  upcoming: "Upcoming Deliveries",
  done_this_month: "Done This Month",
  previously: "Previously",
};
