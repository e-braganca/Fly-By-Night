/* Notifications are DERIVED from real app state (scheduled + completed
   deliveries) so the drawer reflects what's actually happening in the app.
   Read-state is tracked separately in the store. */

import type {
  AppNotification,
  NotificationPrefs,
  ScheduledDelivery,
} from "./types";
import { groupOf } from "./schedule";

/** Canned relative-time labels, applied by recency index (deterministic). */
const AGO_LABELS = [
  "30 minutes ago",
  "an hour ago",
  "3 hours ago",
  "5 hours ago",
  "yesterday",
  "2 days ago",
  "4 days ago",
  "1 week ago",
  "2 weeks ago",
  "3 weeks ago",
];

const agoAt = (i: number) => AGO_LABELS[Math.min(i, AGO_LABELS.length - 1)];

/** A standing system notice (out-of-area address change) — shows the error style. */
const ADDRESS_ISSUE: Omit<AppNotification, "ago" | "read"> = {
  id: "n_issue_address",
  kind: "issue",
  address: "",
  message:
    "We couldn't process your address change because it's outside our service area. For further assistance, please email us at support@flybynightfuel.com.",
};

/**
 * Build the notification feed from the delivery list, newest first:
 * upcoming (requested) → the address issue → completed (newest first).
 * `readIds` marks which notifications have been read.
 */
export function buildNotifications(
  deliveries: ScheduledDelivery[],
  readIds: string[],
): AppNotification[] {
  const read = new Set(readIds);

  const requested = deliveries
    .filter((d) => groupOf(d) === "upcoming")
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .map(
      (d): Omit<AppNotification, "ago" | "read"> => ({
        id: `n_req_${d.id}`,
        kind: "requested",
        address: d.address,
        dateISO: d.dateISO,
        relatedDeliveryId: d.id,
      }),
    );

  const completed = deliveries
    .filter((d) => d.status === "completed")
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .map(
      (d): Omit<AppNotification, "ago" | "read"> => ({
        id: `n_done_${d.id}`,
        kind: "completed",
        address: d.address,
        dateISO: d.dateISO,
        gallons: d.gallonsDelivered ?? d.gallonsScheduled,
        price: d.price,
        orderNo: d.orderNo,
        relatedDeliveryId: d.id,
      }),
    );

  const ordered = [...requested, ADDRESS_ISSUE, ...completed];

  return ordered.map((n, i) => ({
    ...n,
    ago: agoAt(i),
    read: read.has(n.id),
  }));
}

/**
 * Apply the customer's notification preferences (from Settings) to the feed.
 * "Successfully Scheduled" gates the requested cards; "Fueling complete"/
 * "Invoice sent" gate the completed cards; issues always show. `disableAll`
 * hides everything.
 */
export function visibleNotifications(
  deliveries: ScheduledDelivery[],
  readIds: string[],
  prefs: NotificationPrefs,
): AppNotification[] {
  if (prefs.disableAll) return [];
  return buildNotifications(deliveries, readIds).filter((n) => {
    if (n.kind === "requested") return prefs.successfullyScheduled;
    if (n.kind === "completed")
      return prefs.fuelingComplete || prefs.invoiceSent;
    return true; // issue
  });
}
