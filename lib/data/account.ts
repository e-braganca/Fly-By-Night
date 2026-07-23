/* Static account / dashboard metadata (not part of the mutable equipment/delivery store). */

import type { WeekDay, ChecklistStep } from "./types";

export const customer = {
  firstName: "Paul",
  fullName: "Paul Black",
  account: {
    name: "Zoe Harris",
    email: "zoeharris@email.com",
  },
  refuelingThisWeek: 236,
  lastRefuelingDate: "Jul 17, 2026",
  notifications: 12,
};

// Week of the app's current date (Thursday, July 23 2026); next delivery Jul 24.
export const week: WeekDay[] = [
  { label: "MON", date: 20, state: "muted" },
  { label: "TUE", date: 21, state: "muted" },
  { label: "WED", date: 22, state: "muted" },
  { label: "THU", date: 23, state: "today" },
  { label: "FRI", date: 24, state: "next" },
  { label: "SAT", date: 25, state: "muted" },
  { label: "SUN", date: 26, state: "muted" },
];

export const checklist: ChecklistStep[] = [
  { label: "Confirm your email", done: true },
  { label: "Add Delivery Location", done: false },
  { label: "Add Your Equipments", done: false },
  { label: "Add Business Information", done: false },
  { label: "Request First Delivery", done: false },
];
