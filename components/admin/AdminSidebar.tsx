"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  TruckIcon,
  DollarIcon,
  BellIcon,
  DropletIcon,
  LogoutIcon,
} from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { adminProfile } from "@/lib/data/admin";
import { useAppStore } from "@/lib/store";
import { visibleAdminNotifications } from "@/lib/data/adminNotifications";

export const ADMIN_NAV = [
  { label: "Home", href: "/admin/dashboard", Icon: HomeIcon },
  { label: "Deliveries", href: "/admin/deliveries", Icon: CalendarIcon },
  { label: "Fill My Tank", href: "/admin/fill-my-tank", Icon: TruckIcon },
  { label: "Finance", href: "/admin/finance", Icon: DollarIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const openNotifications = useAppStore((s) => s.openNotifications);
  const readIds = useAppStore((s) => s.readNotifications);
  const unread = visibleAdminNotifications(readIds).filter((n) => !n.read).length;

  return (
    <aside className="hidden h-full w-70 shrink-0 flex-col border-r-2 border-primary-dark bg-white px-4 xl:flex">
      {/* Brand + Admin chip */}
      <div className="flex flex-col gap-2 pb-5 pt-6 pr-4">
        <Link href="/admin/dashboard" className="flex items-center">
          <Image
            src="/brand/logo-horizontal.svg"
            alt="Fly by Night Fuel"
            width={184}
            height={50}
            priority
            className="h-12 w-auto"
          />
        </Link>
        <span className="w-fit rounded-lg bg-grey-800 px-2 py-0.5 text-[13px] font-medium text-white">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {ADMIN_NAV.map(({ label, href, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 items-center gap-4 rounded-lg pl-3 pr-2 text-sm transition-colors ${
                active
                  ? "bg-primary/8 font-semibold text-primary-dark"
                  : "font-medium text-text-secondary hover:bg-grey-500/8"
              }`}
            >
              <Icon size={24} className={active ? "text-primary" : "text-grey-600"} />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}

        {/* Notifications opens the drawer (not a route). */}
        <button
          onClick={openNotifications}
          className="flex min-h-11 items-center gap-4 rounded-lg pl-3 pr-2 text-sm font-medium text-text-secondary transition-colors hover:bg-grey-500/8"
        >
          <BellIcon size={24} className="text-grey-600" />
          <span className="flex-1 text-left">Notifications</span>
          {unread > 0 ? <Badge tone="error">{unread}</Badge> : null}
        </button>
      </nav>

      {/* Schedule a delivery */}
      <Link href="/admin-schedule" className="mt-4">
        <Button variant="primary" size="lg" pill className="w-full">
          <DropletIcon size={20} />
          Schedule a delivery
        </Button>
      </Link>

      {/* Account (pinned) */}
      <div className="mt-auto py-4">
        <div className="flex w-full items-center gap-1 rounded-lg px-1 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Avatar
              size={40}
              fallback={<span className="text-sm font-semibold">AM</span>}
              className="ring-2 ring-grey-500/8"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-text-primary">
                {adminProfile.name}
              </span>
              <span className="block truncate text-sm text-text-secondary">
                {adminProfile.email}
              </span>
            </span>
          </div>
          <Link
            href="/login"
            aria-label="Log out"
            title="Log out"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/16 hover:text-error"
          >
            <LogoutIcon size={20} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
