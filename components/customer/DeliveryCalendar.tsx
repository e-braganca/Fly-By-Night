"use client";

import { useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@/components/ui/Icon";
import type { ScheduledDelivery } from "@/lib/data/types";
import { parseISO } from "@/lib/data/schedule";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export type CalendarView = { y: number; m: number }; // m is 1-12

/** Controlled month calendar — the parent owns the viewed month so it can be
    kept in sync with a scrolling list beside it. */
export function DeliveryCalendar({
  deliveries,
  view,
  onViewChange,
  onSelectDay,
}: {
  deliveries: ScheduledDelivery[];
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onSelectDay?: (d: ScheduledDelivery) => void;
}) {
  // Map "day number" → deliveries for the viewed month
  const byDay = useMemo(() => {
    const map = new Map<number, ScheduledDelivery[]>();
    for (const d of deliveries) {
      const { y, m, d: day } = parseISO(d.dateISO);
      if (y === view.y && m === view.m) {
        const arr = map.get(day) ?? [];
        arr.push(d);
        map.set(day, arr);
      }
    }
    return map;
  }, [deliveries, view]);

  const firstWeekday = new Date(Date.UTC(view.y, view.m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();

  // Build a 6×7 grid of day numbers (null for padding)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  function shift(delta: number) {
    const m = view.m + delta;
    if (m < 1) onViewChange({ y: view.y - 1, m: 12 });
    else if (m > 12) onViewChange({ y: view.y + 1, m: 1 });
    else onViewChange({ y: view.y, m });
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white">
      {/* Header */}
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

      {/* Weekday row */}
      <div className="grid grid-cols-7 px-2">
        {WEEKDAYS.map((w, i) => (
          <div
            key={i}
            className="flex h-10 items-center justify-center text-xs text-text-secondary"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="px-2 pb-2">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className={`grid grid-cols-7 ${
              wi < weeks.length - 1 ? "border-b border-grey-500/16" : ""
            }`}
          >
            {week.map((day, di) => {
              if (day === null)
                return <div key={di} className="min-h-[88px]" />;
              const items = byDay.get(day);
              const primary = items?.[0];
              const completed = primary?.status === "completed";
              const scheduled = primary?.status === "scheduled";
              const multi = (items?.length ?? 0) > 1;

              return (
                <div
                  key={di}
                  className="flex min-h-[88px] flex-col items-center gap-1 py-2"
                >
                  {primary ? (
                    <button
                      onClick={() => onSelectDay?.(primary)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${
                          completed
                            ? "bg-primary text-white"
                            : "border-2 border-primary text-primary-dark"
                        }`}
                      >
                        {day}
                      </span>
                      <span className="text-center leading-tight">
                        <span className="block text-[13px] font-semibold text-text-primary">
                          {primary.gallonsScheduled} Gal
                        </span>
                        {completed ? (
                          <span className="block text-xs text-text-secondary">
                            {primary.price}
                          </span>
                        ) : scheduled ? (
                          <span className="block text-xs text-text-secondary">
                            Scheduled
                          </span>
                        ) : null}
                      </span>
                      {multi && (
                        <span className="h-1.5 w-1.5 rounded-full bg-grey-500" />
                      )}
                    </button>
                  ) : (
                    <span className="grid h-9 w-9 place-items-center text-sm text-text-primary">
                      {day}
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
