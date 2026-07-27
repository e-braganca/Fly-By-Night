/* Shared domain types for the Fly by Night customer app. */

export type WeekDay = {
  label: string;
  date: number;
  state: "past" | "today" | "next" | "muted";
};

export type ChecklistStep = {
  label: string;
  done: boolean;
};

/** On-road vs off-road classification (Figma form labels this "fuel type"). */
export type EquipmentClass = "On-road" | "Off-road";

export type Equipment = {
  id: string;
  name: string;
  /** On-road / Off-road — drives the grouped list sections. */
  classification: EquipmentClass;
  /** Equipment subtype, e.g. "Construction", "Generator". */
  subtype: string;
  /** Max tank capacity in gallons, per unit. */
  maxTankCapacity: number;
  /** Number of units the customer owns of this equipment. */
  quantity: number;
  /** Per-unit serial numbers (optional; length matches `quantity` when set). */
  unitNumbers?: string[];
  notes?: string;
  /** Photo URL / data URL (optional; falls back to an icon). */
  image?: string;
  /** Delivery location this equipment lives at. */
  location: string;
};

export type Delivery = {
  id: string;
  date: string;
  gallons: number;
  price: string;
  address: string;
};

/* ---- Scheduled deliveries ---- */

export type DeliveryStatus = "scheduled" | "completed" | "cancelled";

export type UrgencyTier = "standard" | "after_hours_weekend" | "emergency_call_out";

export type UrgencyOption = {
  tier: UrgencyTier;
  title: string;
  description: string;
  /** 0 renders as "Free". */
  fee: number;
  icon: "calendar" | "clock" | "alert";
};

export type DeliveryEquipmentLine = {
  name: string;
  units: number;
  gallonsMax: number;
  fuelType: string;
};

export type DeliveryDocument = {
  label: string;
  filename: string;
  url: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** avatar data/URL (optional). */
  avatar?: string;
};

export type BusinessInfo = {
  businessName: string;
  businessType: string;
  taxId: string;
  /** Uploaded DR-97 tax-exempt certificate filename; applies to all deliveries. */
  dr97?: string;
};

export type DeliveryUpdateKey =
  | "successfullyScheduled"
  | "driverOnTheWay"
  | "reachedDestination"
  | "beganDelivering"
  | "fuelingComplete"
  | "invoiceSent";

export type NotificationPrefs = {
  disableAll: boolean;
} & Record<DeliveryUpdateKey, boolean>;

export type NotificationKind = "requested" | "completed" | "issue";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  /** Relative time label, e.g. "an hour ago". */
  ago: string;
  read: boolean;
  address: string;
  /** Delivery date (requested notifications). */
  dateISO?: string;
  gallons?: number;
  price?: string;
  orderNo?: number;
  relatedDeliveryId?: string;
  /** Freeform body for `issue` notifications. */
  message?: string;
};

export type ReceiptStatus = "paid" | "invoice_received";

export type ReceiptParty = {
  name: string;
  lines: string[];
  email: string;
};

export type ReceiptLineItem = {
  label: string;
  /** Numeric amount; 0 renders as "Free" when `free` is true. */
  amount: number;
  free?: boolean;
  note?: string;
};

export type Receipt = {
  orderNo: number;
  /** ISO date of issue. */
  dateISO: string;
  status: ReceiptStatus;
  totalGallons: number;
  /** Customer effective rate ($/gal): total / gallons. */
  costPerGallon: number;
  total: number;
  seller: ReceiptParty;
  billTo: ReceiptParty;
  lineItems: ReceiptLineItem[];
  /** id of the scheduled delivery this receipt was generated from. */
  relatedDeliveryId: string;
};

export type ScheduledDelivery = {
  id: string;
  /** Order / invoice number, e.g. 843 (completed deliveries only). */
  orderNo?: number;
  /** ISO date, e.g. "2026-05-15". */
  dateISO: string;
  status: DeliveryStatus;
  /** false → Reschedule/Cancel are locked (e.g. within lead time). */
  isEditable: boolean;
  address: string;
  urgency: UrgencyTier;
  /** Gallons scheduled for the delivery. */
  gallonsScheduled: number;
  /** Actual gallons delivered (completed only). */
  gallonsDelivered?: number;
  /** Total price string for completed deliveries, e.g. "$763.51". */
  price?: string;
  equipment: DeliveryEquipmentLine[];
  notes?: string;
  documents?: DeliveryDocument[];
};
