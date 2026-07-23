"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@/components/ui/Icon";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Compact month calendar date-picker shared by the admin + customer schedule
    wizards. Days before `minISO` (if given) are disabled. */
export function MiniCalendar({
  selectedISO,
  onSelect,
  initialView,
  minISO,
  isEnabled,
}: {
  selectedISO: string | null;
  onSelect: (iso: string) => void;
  initialView: { y: number; m: number };
  minISO?: string;
  /** Extra availability predicate (e.g. weekdays only). */
  isEnabled?: (iso: string) => boolean;
}) {
  const [view, setView] = useState(initialView);
  const firstWeekday = new Date(Date.UTC(view.y, view.m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const iso = (d: number) =>
    `${view.y}-${String(view.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const shift = (delta: number) =>
    setView((v) => {
      const m = v.m + delta;
      if (m < 1) return { y: v.y - 1, m: 12 };
      if (m > 12) return { y: v.y + 1, m: 1 };
      return { y: v.y, m };
    });

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between pb-3">
        <span className="flex items-center gap-1 text-base font-semibold text-text-primary">
          {MONTHS[view.m - 1]} {view.y}
          <ChevronDownIcon size={18} className="text-grey-600" />
        </span>
        <div className="flex gap-1">
          <button aria-label="Previous month" onClick={() => shift(-1)} className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-500/8">
            <ChevronLeftIcon size={20} />
          </button>
          <button aria-label="Next month" onClick={() => shift(1)} className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-500/8">
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="flex h-9 items-center justify-center text-xs text-text-secondary">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="h-10" />;
          const dayISO = iso(d);
          const disabled =
            (minISO ? dayISO < minISO : false) || (isEnabled ? !isEnabled(dayISO) : false);
          const selected = selectedISO === dayISO;
          return (
            <div key={i} className="flex h-10 items-center justify-center">
              <button
                disabled={disabled}
                onClick={() => onSelect(dayISO)}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm ${
                  selected
                    ? "bg-primary font-semibold text-white"
                    : disabled
                      ? "text-text-disabled"
                      : "text-text-primary hover:bg-primary/8"
                }`}
              >
                {d}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
