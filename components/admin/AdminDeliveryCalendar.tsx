"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LocationIcon,
} from "@/components/ui/Icon";
import { parseISO } from "@/lib/data/schedule";
import { DAY_COUNTS, DELIVERY_MONTH } from "@/lib/data/adminDeliveries";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function AdminDeliveryCalendar({
  selectedISO,
  onSelectDay,
}: {
  selectedISO: string;
  onSelectDay: (iso: string) => void;
}) {
  const init = parseISO(selectedISO);
  const [view, setView] = useState({ y: init.y, m: init.m });

  const firstWeekday = new Date(Date.UTC(view.y, view.m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
  const counts =
    view.y === DELIVERY_MONTH.y && view.m === DELIVERY_MONTH.m ? DAY_COUNTS : {};

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const shift = (delta: number) =>
    setView((v) => {
      const m = v.m + delta;
      if (m < 1) return { y: v.y - 1, m: 12 };
      if (m > 12) return { y: v.y + 1, m: 1 };
      return { y: v.y, m };
    });

  const iso = (d: number) =>
    `${view.y}-${String(view.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="flex flex-col rounded-2xl bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <button className="flex items-center gap-1 text-base font-semibold text-text-primary">
          {MONTHS[view.m - 1]} {view.y}
          <ChevronDownIcon size={18} className="text-grey-600" />
        </button>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="grid h-10 w-10 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8"
          >
            <ChevronLeftIcon size={22} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => shift(1)}
            className="grid h-10 w-10 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8"
          >
            <ChevronRightIcon size={22} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 px-2">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="flex h-10 items-center justify-center text-xs text-text-secondary">
            {w}
          </div>
        ))}
      </div>

      <div className="px-2 pb-3">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className={`grid grid-cols-7 ${wi < weeks.length - 1 ? "border-b border-grey-500/16" : ""}`}
          >
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="min-h-[92px]" />;
              const count = counts[day] ?? 0;
              const selected = iso(day) === selectedISO;
              const hasDeliveries = count > 0;
              return (
                <div key={di} className="flex min-h-[92px] flex-col items-center gap-1.5 py-3">
                  <button
                    onClick={() => hasDeliveries && onSelectDay(iso(day))}
                    disabled={!hasDeliveries}
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${
                      selected
                        ? "bg-primary text-white"
                        : hasDeliveries
                          ? "bg-grey-500/12 text-text-primary hover:bg-grey-500/24"
                          : "border border-dashed border-grey-400 text-grey-500"
                    }`}
                  >
                    {day}
                  </button>
                  {hasDeliveries && (
                    <span className="flex items-center gap-0.5 text-xs text-text-secondary">
                      <LocationIcon size={14} className="text-primary" />
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
