/* Admin notifications — operator-facing alerts (customer requests, completed
   fuelings, location-change approvals). Read state lives in the store. */

export type AdminNotifKind = "requested" | "completed" | "location_change";

export type AdminNotification = {
  id: string;
  kind: AdminNotifKind;
  /** Relative time label. */
  ago: string;
  read: boolean;
  customer: string;
  address?: string;
  gallons?: number;
  price?: string;
  orderNo?: number;
  fromAddress?: string;
  toAddress?: string;
};

const SEED: Omit<AdminNotification, "read">[] = [
  {
    id: "an1",
    kind: "requested",
    ago: "30 minutes ago",
    customer: "BuildCore Constructors",
    address: "123 Maple Avenue, Sunnyvale, FL",
  },
  {
    id: "an2",
    kind: "completed",
    ago: "an hour ago",
    customer: "BuildCore Constructors",
    address: "123 Maple Avenue, Sunnyvale, FL",
    gallons: 162,
    price: "$541.08",
    orderNo: 871,
  },
  {
    id: "an3",
    kind: "completed",
    ago: "an hour ago",
    customer: "Summit Constructors",
    address: "789 Maple Lane, Sunnyvale, FL",
    gallons: 121,
    price: "$404.14",
    orderNo: 870,
  },
  {
    id: "an4",
    kind: "location_change",
    ago: "30 minutes ago",
    customer: "Aldera Builders",
    fromAddress: "321 Elm Avenue, Fort Lauderdale, FL",
    toAddress: "318 Pine Street, Miami, FL",
  },
];

/** Notification list with read-state resolved from the store's read ids. */
export function visibleAdminNotifications(readIds: string[]): AdminNotification[] {
  return SEED.map((n) => ({ ...n, read: readIds.includes(n.id) }));
}
