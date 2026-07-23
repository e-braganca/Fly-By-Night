"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { DropletIcon, CheckIcon, ReceiptIcon } from "@/components/ui/Icon";
import { useAppStore, useScheduledDeliveries, useNotificationPrefs, useBusiness } from "@/lib/store";
import { visibleNotifications } from "@/lib/data/notifications";
import { formatLongDate } from "@/lib/data/schedule";
import { buildReceipt } from "@/lib/data/receipts";
import { downloadReceiptPdf } from "@/lib/receiptPdf";
import type { AppNotification } from "@/lib/data/types";

function Avatar({ kind }: { kind: AppNotification["kind"] }) {
  const map = {
    requested: { bg: "bg-primary/16", fg: "text-primary", Icon: DropletIcon },
    completed: { bg: "bg-success/16", fg: "text-success-dark", Icon: CheckIcon },
    issue: { bg: "bg-error/16", fg: "text-error", Icon: XIcon },
  } as const;
  const { bg, fg, Icon } = map[kind];
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${bg} ${fg}`}>
      <Icon size={22} />
    </span>
  );
}

function XIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function Body({ n }: { n: AppNotification }) {
  if (n.kind === "requested") {
    return (
      <p className="text-sm leading-[1.4] text-text-primary">
        Fuel delivery requested for{" "}
        <span className="font-bold">{n.dateISO ? formatLongDate(n.dateISO) : ""}</span> on{" "}
        <span className="font-bold">{n.address}</span>
      </p>
    );
  }
  if (n.kind === "completed") {
    return (
      <div className="text-sm leading-[1.4] text-text-primary">
        <p>
          Fuel delivery completed on <span className="font-bold">{n.address}.</span>
        </p>
        <p className="mt-2">
          {n.gallons} gallons - {n.price}
        </p>
      </div>
    );
  }
  return <p className="text-sm leading-[1.4] text-text-primary">{n.message}</p>;
}

export function NotificationsDrawer() {
  const open = useAppStore((s) => s.notificationsOpen);
  const close = useAppStore((s) => s.closeNotifications);
  const readIds = useAppStore((s) => s.readNotifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const deliveries = useScheduledDeliveries();
  const prefs = useNotificationPrefs();
  const business = useBusiness();

  const notifications = visibleNotifications(deliveries, readIds, prefs);

  function downloadReceipt(n: AppNotification) {
    const delivery = deliveries.find((d) => d.id === n.relatedDeliveryId);
    if (!delivery) return;
    markRead(n.id);
    downloadReceiptPdf(buildReceipt(delivery, "paid", business.businessName));
  }

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Notifications"
      width={420}
      headerActions={
        <button
          onClick={() => markAllRead(notifications.map((n) => n.id))}
          className="rounded-lg px-1 py-1.5 text-[13px] font-semibold text-primary hover:underline"
        >
          Mark all as read
        </button>
      }
    >
      {notifications.map((n) => (
        <div key={n.id} className="flex items-start gap-4 p-5">
          <Avatar kind={n.kind} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <Body n={n} />
              </div>
              {!n.read && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-error" />
              )}
            </div>
            <p className="mt-1 text-xs text-text-disabled">{n.ago}</p>

            {n.kind === "completed" && (
              <div className="pt-3">
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => downloadReceipt(n)}
                >
                  <ReceiptIcon size={18} />
                  Download Receipt
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {notifications.length === 0 && (
        <p className="px-5 py-16 text-center text-sm text-grey-500">
          You&apos;re all caught up.
        </p>
      )}
    </Drawer>
  );
}
