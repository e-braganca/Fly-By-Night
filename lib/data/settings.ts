/* Settings metadata — seeds + option lists. Live values live in the store. */

import type {
  Profile,
  BusinessInfo,
  NotificationPrefs,
  DeliveryUpdateKey,
} from "./types";

export const seedProfile: Profile = {
  firstName: "Zoe",
  lastName: "Harris",
  email: "zoeharris@email.com",
  phone: "365-374-4961",
};

export const BUSINESS_TYPES = [
  "Construction",
  "Agriculture",
  "Transportation & Logistics",
  "Landscaping",
  "Oil & Gas",
  "Other",
] as const;

export const seedBusiness: BusinessInfo = {
  businessName: "MDB Construction, LLC",
  businessType: "Construction",
  taxId: "",
  // Prototype: assume the customer uploaded their DR-97 in the past.
  dr97: "dr-97-tax-exempt-certificate.pdf",
};

/**
 * Defaults: delivery + invoice updates ON (so the notifications drawer stays
 * populated); the intermediate driver/route steps OFF. Toggling these live-
 * filters the notifications drawer.
 */
export const seedNotificationPrefs: NotificationPrefs = {
  disableAll: false,
  successfullyScheduled: true,
  driverOnTheWay: false,
  reachedDestination: false,
  beganDelivering: false,
  fuelingComplete: true,
  invoiceSent: true,
};

export const DELIVERY_UPDATE_ROWS: { key: DeliveryUpdateKey; label: string }[] = [
  { key: "successfullyScheduled", label: "Successfully Scheduled" },
  { key: "driverOnTheWay", label: "The driver is on the way." },
  { key: "reachedDestination", label: "Reached the destination." },
  { key: "beganDelivering", label: "Began delivering the fuel." },
  { key: "fuelingComplete", label: "Fueling complete." },
  { key: "invoiceSent", label: "Invoice sent" },
];

export const SETTINGS_SECTIONS = [
  { key: "profile", label: "Profile" },
  { key: "business", label: "Business Information" },
  { key: "credentials", label: "Credentials" },
  { key: "notifications", label: "Notifications" },
] as const;

export type SettingsSectionKey = (typeof SETTINGS_SECTIONS)[number]["key"];
