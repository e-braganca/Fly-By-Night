"use client";

import type { ReactNode } from "react";
import { Sidebar, CUSTOMER_NAV } from "@/components/customer/Sidebar";
import { NotificationsDrawer } from "@/components/customer/NotificationsDrawer";
import {
  MobileTopBar,
  MobileBottomNav,
  ScheduleFab,
} from "@/components/ui/MobileChrome";
import {
  useAppStore,
  useScheduledDeliveries,
  useProfile,
  useNotificationPrefs,
} from "@/lib/store";
import { visibleNotifications } from "@/lib/data/notifications";

export function CustomerShell({ children }: { children: ReactNode }) {
  const openNotifications = useAppStore((s) => s.openNotifications);
  const readIds = useAppStore((s) => s.readNotifications);
  const deliveries = useScheduledDeliveries();
  const profile = useProfile();
  const prefs = useNotificationPrefs();

  const initials =
    `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const unread = visibleNotifications(deliveries, readIds, prefs).filter(
    (n) => !n.read,
  ).length;

  return (
    <div className="flex h-dvh overflow-hidden bg-neutral">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar
          homeHref="/customer/dashboard"
          unread={unread}
          onNotifications={openNotifications}
          profileHref="/customer/settings"
          avatarSrc={profile.avatar}
          avatarFallback={<span className="text-sm font-semibold">{initials}</span>}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <MobileBottomNav items={CUSTOMER_NAV} />
      </div>
      <ScheduleFab href="/customer-schedule" />
      <NotificationsDrawer />
    </div>
  );
}
