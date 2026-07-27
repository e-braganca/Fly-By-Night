"use client";

import type { ReactNode } from "react";
import { AdminSidebar, ADMIN_NAV } from "@/components/admin/AdminSidebar";
import { AdminNotificationsDrawer } from "@/components/admin/AdminNotificationsDrawer";
import {
  MobileTopBar,
  MobileBottomNav,
  ScheduleFab,
} from "@/components/ui/MobileChrome";
import { useAppStore } from "@/lib/store";
import { visibleAdminNotifications } from "@/lib/data/adminNotifications";

export function AdminShell({ children }: { children: ReactNode }) {
  const openNotifications = useAppStore((s) => s.openNotifications);
  const readIds = useAppStore((s) => s.readNotifications);
  const unread = visibleAdminNotifications(readIds).filter((n) => !n.read).length;

  return (
    <div className="flex h-dvh overflow-hidden bg-neutral">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar
          homeHref="/admin/dashboard"
          unread={unread}
          onNotifications={openNotifications}
          avatarFallback={<span className="text-sm font-semibold">AM</span>}
          badge={
            <span className="rounded-lg bg-grey-800 px-2 py-0.5 text-[11px] font-medium text-white">
              Admin
            </span>
          }
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <MobileBottomNav items={ADMIN_NAV} />
      </div>
      <ScheduleFab href="/admin-schedule" />
      <AdminNotificationsDrawer />
    </div>
  );
}
