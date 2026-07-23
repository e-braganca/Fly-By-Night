"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropletIcon,
  EyeIcon,
  CalendarIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/Icon";
import { AdminDeliveryCalendar } from "@/components/admin/AdminDeliveryCalendar";
import { PAGE_X, PAGE_Y, STICKY_HEADER } from "@/components/ui/layout";
import { ScheduleDetailModal } from "@/components/customer/ScheduleDetailModal";
import { RescheduleModal } from "@/components/customer/RescheduleModal";
import { formatLongDate, parseISO } from "@/lib/data/schedule";
import {
  buildDayDeliveries,
  DAY_COUNTS,
  ADMIN_PERIODS,
  ADMIN_INITIAL_DAY,
  type AdminPeriod,
  type AdminScheduledDelivery,
} from "@/lib/data/adminDeliveries";
import type { RescheduleInput } from "@/lib/store";

function shiftISO(iso: string, days: number): string {
  const { y, m, d } = parseISO(iso);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function TimelineItem({
  d,
  last,
  onDetails,
  onReschedule,
  onCancel,
}: {
  d: AdminScheduledDelivery;
  last: boolean;
  onDetails: (d: AdminScheduledDelivery) => void;
  onReschedule: (d: AdminScheduledDelivery) => void;
  onCancel: (d: AdminScheduledDelivery) => void;
}) {
  const completed = d.status === "completed";
  return (
    <div className="flex gap-3">
      {/* rail */}
      <div className="flex flex-col items-center pt-1.5">
        <span
          className={`h-3 w-3 rounded-full ${
            completed ? "bg-primary" : "border-2 border-primary bg-white"
          }`}
        />
        {!last && <span className="w-px flex-1 bg-divider" />}
      </div>

      {/* content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary">{d.address}</p>
          {completed ? (
            <Badge tone="success">Completed</Badge>
          ) : (
            <Badge>Scheduled</Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-text-disabled">{d.customerName}</p>
        {completed && d.gallonsDelivered && (
          <p className="text-xs text-text-disabled">{d.gallonsDelivered} Gallons</p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="dark" size="sm" onClick={() => onDetails(d)}>
            <EyeIcon size={18} />
            Details
          </Button>
          {!completed && (
            <>
              <Button variant="soft" size="sm" onClick={() => onReschedule(d)}>
                <CalendarIcon size={18} />
                Reschedule Service
              </Button>
              <Button variant="errorSoft" size="sm" onClick={() => onCancel(d)}>
                <TrashIcon size={18} />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDeliveriesPage() {
  const [selectedISO, setSelectedISO] = useState(ADMIN_INITIAL_DAY);
  const [tab, setTab] = useState<AdminPeriod>("Morning");
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const [detail, setDetail] = useState<AdminScheduledDelivery | null>(null);
  const [reschedule, setReschedule] = useState<AdminScheduledDelivery | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminScheduledDelivery | null>(null);

  const day = parseISO(selectedISO).d;
  const all = useMemo(
    () => buildDayDeliveries(selectedISO, DAY_COUNTS[day] ?? 0),
    [selectedISO, day],
  );

  const visible = all.filter((d) => !removed.has(d.id));
  const rows = visible.filter((d) => d.period === tab);

  function drop(id: string) {
    setRemoved((s) => new Set(s).add(id));
  }

  function onRescheduleConfirm(id: string, input: RescheduleInput) {
    // A changed date moves the delivery to another day → leaves this day's list.
    if (input.mode === "push_date" || input.mode === "reschedule") drop(id);
  }

  return (
    <div className={`mx-auto flex w-full max-w-[1200px] flex-col gap-8 ${PAGE_X} ${PAGE_Y}`}>
      {/* Header (sticky) */}
      <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${STICKY_HEADER}`}>
        <h1 className="flex-1 text-2xl font-bold text-text-primary sm:text-3xl">
          Deliveries Schedule
        </h1>
        <Link href="/admin-schedule">
          <Button size="md">
            <DropletIcon size={20} />
            Schedule a delivery
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px] md:gap-8 lg:grid-cols-[1fr_400px]">
        {/* Calendar */}
        <AdminDeliveryCalendar
          selectedISO={selectedISO}
          onSelectDay={(iso) => {
            setSelectedISO(iso);
            setTab("Morning");
          }}
        />

        {/* Day panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text-primary">
              {formatLongDate(selectedISO)}
            </h2>
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous day"
                onClick={() => setSelectedISO((s) => shiftISO(s, -1))}
                className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-500/8"
              >
                <ChevronLeftIcon size={20} />
              </button>
              <button
                aria-label="Next day"
                onClick={() => setSelectedISO((s) => shiftISO(s, 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-500/8"
              >
                <ChevronRightIcon size={20} />
              </button>
            </div>
          </div>

          {/* Period tabs */}
          <div className="flex gap-6 border-b border-divider">
            {ADMIN_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setTab(p)}
                className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
                  tab === p
                    ? "border-grey-900 text-text-primary"
                    : "border-transparent text-text-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex flex-col">
            {rows.length === 0 ? (
              <p className="py-12 text-center text-sm text-grey-500">
                No deliveries scheduled for this period.
              </p>
            ) : (
              rows.map((d, i) => (
                <TimelineItem
                  key={d.id}
                  d={d}
                  last={i === rows.length - 1}
                  onDetails={setDetail}
                  onReschedule={(x) => {
                    setDetail(null);
                    setReschedule(x);
                  }}
                  onCancel={(x) => {
                    setDetail(null);
                    setCancelTarget(x);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals (reused from the customer app) */}
      <ScheduleDetailModal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        delivery={detail}
        onReschedule={(x) => {
          setDetail(null);
          setReschedule(x as AdminScheduledDelivery);
        }}
        onCancel={(x) => {
          setDetail(null);
          setCancelTarget(x as AdminScheduledDelivery);
        }}
      />

      <RescheduleModal
        open={Boolean(reschedule)}
        onClose={() => setReschedule(null)}
        delivery={reschedule}
        intro="This customer has this service scheduled under the following offer:"
        onConfirm={onRescheduleConfirm}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && drop(cancelTarget.id)}
        title="Cancel this schedule?"
        description="Are you sure you want to cancel this schedule?"
        confirmLabel="Cancel Schedule"
        cancelLabel="Back"
      />
    </div>
  );
}
