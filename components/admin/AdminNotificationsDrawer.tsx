"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { DropletIcon, CheckIcon, LocationIcon, ReceiptIcon } from "@/components/ui/Icon";
import { useAppStore } from "@/lib/store";
import { visibleAdminNotifications, type AdminNotification } from "@/lib/data/adminNotifications";
import { buildReceipt } from "@/lib/data/receipts";
import { downloadReceiptPdf } from "@/lib/receiptPdf";
import { REFERENCE_TODAY } from "@/lib/data/schedule";

function KindIcon({ kind }: { kind: AdminNotification["kind"] }) {
  const map = {
    requested: { bg: "bg-primary/16", fg: "text-primary", Icon: DropletIcon },
    completed: { bg: "bg-success/16", fg: "text-success-dark", Icon: CheckIcon },
    location_change: { bg: "bg-warning/16", fg: "text-warning-dark", Icon: LocationIcon },
  } as const;
  const { bg, fg, Icon } = map[kind];
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${bg} ${fg}`}>
      <Icon size={22} />
    </span>
  );
}

function Body({ n }: { n: AdminNotification }) {
  if (n.kind === "requested") {
    return (
      <p className="text-sm leading-[1.4] text-text-primary">
        Fuel delivery requested to <span className="font-bold">{n.customer}</span> on{" "}
        <span className="font-bold">{n.address}</span>
      </p>
    );
  }
  if (n.kind === "completed") {
    return (
      <div className="text-sm leading-[1.4] text-text-primary">
        <p>
          Fuel delivery completed to <span className="font-bold">{n.customer}</span> on{" "}
          <span className="font-bold">{n.address}.</span>
        </p>
        <p className="mt-2">
          {n.gallons} gallons - {n.price}
        </p>
      </div>
    );
  }
  return (
    <p className="text-sm leading-[1.4] text-text-primary">
      <span className="font-bold">{n.customer}</span> requested to change their location from{" "}
      <span className="font-bold">{n.fromAddress}</span> to <span className="font-bold">{n.toAddress}</span>
    </p>
  );
}

export function AdminNotificationsDrawer() {
  const open = useAppStore((s) => s.notificationsOpen);
  const close = useAppStore((s) => s.closeNotifications);
  const readIds = useAppStore((s) => s.readNotifications);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  // Location-change requests that have been approved/declined this session.
  const [handled, setHandled] = useState<Set<string>>(new Set());

  const notifications = visibleAdminNotifications(readIds).filter((n) => !handled.has(n.id));

  function downloadReceipt(n: AdminNotification) {
    markRead(n.id);
    const delivery = {
      id: n.id,
      orderNo: n.orderNo ?? 0,
      dateISO: REFERENCE_TODAY,
      status: "completed" as const,
      isEditable: false,
      address: n.address ?? "",
      urgency: "standard" as const,
      gallonsScheduled: n.gallons ?? 0,
      gallonsDelivered: n.gallons ?? 0,
      price: n.price ?? "$0",
      equipment: [],
    };
    downloadReceiptPdf(buildReceipt(delivery, "paid", n.customer));
  }

  function resolve(n: AdminNotification) {
    markRead(n.id);
    setHandled((h) => new Set(h).add(n.id));
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
          <KindIcon kind={n.kind} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <Body n={n} />
              </div>
              {!n.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-error" />}
            </div>
            <p className="mt-1 text-xs text-text-disabled">{n.ago}</p>

            {n.kind === "completed" && (
              <div className="pt-3">
                <Button variant="dark" size="sm" onClick={() => downloadReceipt(n)}>
                  <ReceiptIcon size={18} />
                  Download Receipt
                </Button>
              </div>
            )}

            {n.kind === "location_change" && (
              <div className="flex gap-2 pt-3">
                <Button size="sm" onClick={() => resolve(n)}>
                  Approve
                </Button>
                <Button variant="soft" size="sm" onClick={() => resolve(n)}>
                  Decline
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
