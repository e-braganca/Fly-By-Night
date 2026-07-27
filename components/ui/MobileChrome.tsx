"use client";

/*
  Shared responsive app chrome for viewports below `lg` (1024px), where the
  left sidebar is replaced by a top app bar (brand + notifications + avatar) and
  a bottom tab bar. Both admin and customer shells reuse these presentational
  pieces so the pattern stays in one place.
*/

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { BellIcon, DropletIcon, LogoutIcon } from "@/components/ui/Icon";

export type MobileNavItem = {
  label: string;
  href: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
};

/** Sticky top app bar (brand + notifications bell + account avatar). */
export function MobileTopBar({
  homeHref,
  unread,
  onNotifications,
  profileHref,
  avatarSrc,
  avatarFallback,
  badge,
  logoutHref = "/login",
}: {
  homeHref: string;
  unread: number;
  onNotifications: () => void;
  profileHref?: string;
  avatarSrc?: string;
  avatarFallback?: ReactNode;
  /** Optional chip shown next to the brand (e.g. the admin "Admin" pill). */
  badge?: ReactNode;
  logoutHref?: string;
}) {
  const avatar = (
    <Avatar
      size={36}
      src={avatarSrc}
      fallback={avatarFallback}
      className="ring-2 ring-grey-500/8"
    />
  );

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-primary-dark bg-white px-4 xl:hidden">
      <div className="flex items-center gap-2">
        <Link href={homeHref} className="flex items-center">
          <Image
            src="/brand/logo-horizontal.svg"
            alt="Fly by Night Fuel"
            width={160}
            height={44}
            priority
            className="h-9 w-auto"
          />
        </Link>
        {badge}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onNotifications}
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8"
        >
          <BellIcon size={24} />
          {unread > 0 && (
            <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
        {profileHref ? <Link href={profileHref}>{avatar}</Link> : avatar}
        <Link
          href={logoutHref}
          aria-label="Log out"
          className="grid h-10 w-10 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/16 hover:text-error"
        >
          <LogoutIcon size={22} />
        </Link>
      </div>
    </header>
  );
}

/** Fixed bottom tab bar with the primary nav items. */
export function MobileBottomNav({ items }: { items: MobileNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex shrink-0 items-stretch justify-around border-t border-grey-500/16 bg-white pb-[env(safe-area-inset-bottom)] xl:hidden">
      {items.map(({ label, href, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5"
          >
            <Icon size={24} className={active ? "text-primary" : "text-grey-600"} />
            <span
              className={`text-[11px] ${
                active ? "font-semibold text-primary" : "text-text-secondary"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Floating "Schedule a delivery" action, sitting above the bottom tab bar. */
export function ScheduleFab({
  href,
  label = "Schedule a delivery",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="fixed bottom-20 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[var(--shadow-dropdown)] transition-colors hover:bg-primary-dark xl:hidden"
    >
      <DropletIcon size={20} />
      {label}
    </Link>
  );
}
