"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  TruckIcon,
  InvoiceIcon,
  BellIcon,
  DropletIcon,
  LogoutIcon,
} from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  useAppStore,
  useScheduledDeliveries,
  useProfile,
  useNotificationPrefs,
} from "@/lib/store";
import { visibleNotifications } from "@/lib/data/notifications";

export const CUSTOMER_NAV = [
  { label: "Home", href: "/customer/dashboard", Icon: HomeIcon },
  { label: "Deliveries", href: "/customer/deliveries", Icon: CalendarIcon },
  { label: "Equipments", href: "/customer/equipments", Icon: TruckIcon },
  { label: "Receipts", href: "/customer/receipts", Icon: InvoiceIcon },
];

export function Sidebar() {
  const pathname = usePathname();
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
    <aside className="hidden h-full w-70 shrink-0 flex-col border-r-2 border-primary-dark bg-white px-4 xl:flex">
      {/* Brand */}
      <div className="flex h-20 items-center pr-4">
        <Link href="/customer/dashboard" className="flex items-center">
          <Image
            src="/brand/logo-horizontal.svg"
            alt="Fly by Night Fuel"
            width={184}
            height={50}
            priority
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {CUSTOMER_NAV.map(({ label, href, Icon }) => {
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

        {/* Notifications opens the drawer */}
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
      <Link href="/customer-schedule" className="mt-4 block">
        <Button variant="primary" size="lg" pill className="w-full">
          <DropletIcon size={20} />
          Schedule a delivery
        </Button>
      </Link>

      {/* Account (pinned) → Settings */}
      <div className="mt-auto py-4">
        <div
          className={`flex w-full items-center gap-1 rounded-lg px-1 py-1 transition-colors ${
            pathname.startsWith("/customer/settings")
              ? "bg-primary/8"
              : "hover:bg-grey-500/8"
          }`}
        >
          <Link
            href="/customer/settings"
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <Avatar
              size={40}
              src={profile.avatar}
              fallback={<span className="text-sm font-semibold">{initials}</span>}
              className="ring-2 ring-grey-500/8"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-text-primary">
                {profile.firstName} {profile.lastName}
              </span>
              <span className="block truncate text-sm text-text-secondary">
                {profile.email}
              </span>
            </span>
          </Link>
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
