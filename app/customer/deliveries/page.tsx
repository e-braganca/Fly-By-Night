"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DropletIcon } from "@/components/ui/Icon";
import { DeliveryCalendar, type CalendarView } from "@/components/customer/DeliveryCalendar";
import { PAGE_X } from "@/components/ui/layout";
import { ScheduleTimeline } from "@/components/customer/ScheduleTimeline";
import { ScheduleDetailModal } from "@/components/customer/ScheduleDetailModal";
import { RescheduleModal } from "@/components/customer/RescheduleModal";
import { useAppStore, useScheduledDeliveries } from "@/lib/store";
import { REFERENCE_TODAY, parseISO } from "@/lib/data/schedule";
import type { ScheduledDelivery } from "@/lib/data/types";

const monthKey = (v: CalendarView) =>
  `${v.y}-${String(v.m).padStart(2, "0")}`;

export default function DeliveriesPage() {
  const deliveries = useScheduledDeliveries();
  const cancelDelivery = useAppStore((s) => s.cancelDelivery);

  const [detail, setDetail] = useState<ScheduledDelivery | null>(null);
  const [reschedule, setReschedule] = useState<ScheduledDelivery | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ScheduledDelivery | null>(null);

  // Calendar month is kept in sync with the scrolling list (both directions).
  const [view, setView] = useState<CalendarView>(() => {
    const t = parseISO(REFERENCE_TODAY);
    return { y: t.y, m: t.m };
  });
  const listRef = useRef<HTMLDivElement>(null);
  // Suppresses the list→calendar sync while we programmatically scroll the list.
  const suppressSync = useRef(false);

  /** Month of the item currently sitting at the top of the list viewport:
      the first item still visible below a line just under the top edge (using
      each item's bottom edge handles the variable row heights + group dividers). */
  function topMonth(): CalendarView | null {
    const cont = listRef.current;
    if (!cont) return null;
    const contTop = cont.getBoundingClientRect().top;
    const LINE = 56;
    const items = cont.querySelectorAll<HTMLElement>("[data-month]");
    let key: string | null = null;
    for (const el of items) {
      if (el.getBoundingClientRect().bottom - contTop > LINE) {
        key = el.dataset.month ?? null;
        break;
      }
    }
    if (!key && items.length) key = items[items.length - 1].dataset.month ?? null;
    if (!key) return null;
    return { y: Number(key.slice(0, 4)), m: Number(key.slice(5, 7)) };
  }

  function handleListScroll() {
    if (suppressSync.current) return;
    const m = topMonth();
    if (m && (m.y !== view.y || m.m !== view.m)) setView(m);
  }

  /** Calendar nav → scroll the list to the first delivery of that month. */
  function handleViewChange(next: CalendarView) {
    setView(next);
    const cont = listRef.current;
    if (!cont) return;
    const el = cont.querySelector<HTMLElement>(`[data-month="${monthKey(next)}"]`);
    if (!el) return;
    suppressSync.current = true;
    const delta =
      el.getBoundingClientRect().top - cont.getBoundingClientRect().top;
    cont.scrollTo({ top: cont.scrollTop + delta - 8, behavior: "smooth" });
    window.setTimeout(() => {
      suppressSync.current = false;
    }, 500);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col">
      {/* Fixed header */}
      <div className={`flex flex-wrap items-center gap-3 pb-4 pt-4 sm:gap-4 lg:pt-6 ${PAGE_X}`}>
        <h1 className="flex-1 text-2xl font-bold text-text-primary sm:text-3xl">
          Deliveries Schedule
        </h1>
        <Link href="/customer-schedule">
          <Button size="md">
            <DropletIcon size={20} />
            Schedule a delivery
          </Button>
        </Link>
      </div>

      {/* Body: fixed calendar + scrolling list */}
      <div className={`grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8 ${PAGE_X}`}>
        <div className="self-start">
          <DeliveryCalendar
            deliveries={deliveries}
            view={view}
            onViewChange={handleViewChange}
            onSelectDay={(d) => setDetail(d)}
          />
        </div>

        <div
          ref={listRef}
          onScroll={handleListScroll}
          className="min-h-0 overflow-y-auto pb-24 pr-1 lg:pb-10"
        >
          <ScheduleTimeline
            deliveries={deliveries}
            onDetails={(d) => setDetail(d)}
            onReschedule={(d) => {
              setDetail(null);
              setReschedule(d);
            }}
            onCancel={(d) => {
              setDetail(null);
              setCancelTarget(d);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <ScheduleDetailModal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        delivery={detail}
        onReschedule={(d) => {
          setDetail(null);
          setReschedule(d);
        }}
        onCancel={(d) => {
          setDetail(null);
          setCancelTarget(d);
        }}
      />

      <RescheduleModal
        open={Boolean(reschedule)}
        onClose={() => setReschedule(null)}
        delivery={reschedule}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelDelivery(cancelTarget.id)}
        title="Cancel this schedule?"
        description="Are you sure you want to cancel this schedule?"
        confirmLabel="Cancel Schedule"
        cancelLabel="Back"
      />
    </div>
  );
}
