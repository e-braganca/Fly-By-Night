"use client";

import { useState } from "react";
import { StatCard, StatNumber, StatUnit } from "@/components/ui/StatCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CalendarIcon } from "@/components/ui/Icon";
import { AdminWeekStrip, type BoardDay } from "@/components/admin/AdminWeekStrip";
import {
  NextDeliveryBanner,
  BANNER_ALERT_INDEX,
} from "@/components/admin/NextDeliveryBanner";
import {
  AdminDeliveryCard,
  EmptySlot,
} from "@/components/admin/AdminDeliveryCard";
import { CompleteFuelingDrawer } from "@/components/admin/CompleteFuelingDrawer";
import { PAGE_X, PAGE_Y } from "@/components/ui/layout";
import {
  board as seedBoard,
  tomorrowBoard as seedTomorrowBoard,
  dayKpis,
  nextDeliveryAddress,
  BANNER_STEPS,
  FUELING_SEED,
  type AdminDelivery,
  type BoardColumn,
} from "@/lib/data/admin";

// Banner step whose action ("Start Fueling") opens the Complete Fueling drawer.
const START_FUELING_STEP = BANNER_STEPS.findIndex((s) => s.key === "on_scene");

export default function AdminDashboard() {
  const [step, setStep] = useState(0);
  const [day, setDay] = useState<BoardDay>("today");
  const [boards, setBoards] = useState<Record<BoardDay, BoardColumn[]>>({
    today: seedBoard,
    tomorrow: seedTomorrowBoard,
  });
  const [cancelTarget, setCancelTarget] = useState<AdminDelivery | null>(null);
  const [nextTarget, setNextTarget] = useState<AdminDelivery | null>(null);
  const [fuelingOpen, setFuelingOpen] = useState(false);
  const [todayDone, setTodayDone] = useState(dayKpis.locationsDone);

  const board = boards[day];
  const isToday = day === "today";
  const tomorrowStops = boards.tomorrow
    .flatMap((c) => c.deliveries)
    .filter(Boolean).length;

  // The delivery currently queued as "Next" today drives the banner + drawer.
  const todayNext =
    boards.today.flatMap((c) => c.deliveries).find((d) => d?.status === "Next") ?? null;
  const nextAddress = todayNext
    ? `${todayNext.street}, ${todayNext.city}`
    : nextDeliveryAddress;
  const nextEquipment = todayNext?.equipment ?? FUELING_SEED;

  // The live status banner + alert dimming only apply to today.
  const isAlert = isToday && step >= BANNER_ALERT_INDEX;
  const cycleLength = BANNER_STEPS.length + 1; // steps + alert

  // "Start Fueling" opens the drawer; every other step just cycles forward.
  const advance = () => {
    if (step === START_FUELING_STEP) {
      setFuelingOpen(true);
      return;
    }
    setStep((s) => (s + 1) % cycleLength);
  };

  // Completing the drawer marks today's "Next" delivery done, promotes the next
  // scheduled stop to "Next", and resets the banner to its initial state.
  function completeFueling() {
    setFuelingOpen(false);
    setBoards((prev) => {
      const today = prev.today.map((c) => ({ ...c, deliveries: [...c.deliveries] }));
      today.forEach((c) =>
        c.deliveries.forEach((d, i) => {
          if (d?.status === "Next") c.deliveries[i] = { ...d, status: "Completed" };
        }),
      );
      // Promote the first remaining "Scheduled" stop to "Next".
      for (const c of today) {
        const i = c.deliveries.findIndex((d) => d?.status === "Scheduled");
        if (i !== -1) {
          c.deliveries[i] = { ...c.deliveries[i]!, status: "Next" };
          break;
        }
      }
      return { ...prev, today };
    });
    setTodayDone((n) => n + 1);
    setStep(0);
  }

  const setBoard = (updater: (cols: BoardColumn[]) => BoardColumn[]) =>
    setBoards((prev) => ({ ...prev, [day]: updater(prev[day]) }));

  // Cancelling leaves the slot empty (null) so the 2-per-period grid is kept.
  function doCancel(d: AdminDelivery) {
    setBoard((cols) =>
      cols.map((c) => ({
        ...c,
        deliveries: c.deliveries.map((x) => (x?.id === d.id ? null : x)),
      })),
    );
  }

  // Promote `d` to "Next" and swap slots with the previous "Next": the old next
  // takes the slot that `d` just vacated.
  function doMakeNext(d: AdminDelivery) {
    setBoard((cols) => {
      const next = cols.map((c) => ({ ...c, deliveries: [...c.deliveries] }));

      // Locate a slot (column + slot index) by predicate. Returning a typed
      // value keeps `target`/`current` narrowable (a `let` assigned only inside
      // a closure collapses to `never` under strict control-flow analysis).
      const locate = (pred: (x: AdminDelivery | null) => boolean) => {
        for (let ci = 0; ci < next.length; ci++) {
          const di = next[ci].deliveries.findIndex(pred);
          if (di !== -1) return { ci, di };
        }
        return null;
      };

      const target = locate((x) => x?.id === d.id); // d's slot
      if (!target) return next;
      const current = locate((x) => x?.status === "Next"); // old next's slot

      const promoted: AdminDelivery = { ...d, status: "Next" };

      if (current) {
        const old = next[current.ci].deliveries[current.di]!;
        // old next -> d's old slot (demoted); d -> old next's slot (promoted)
        next[target.ci].deliveries[target.di] = { ...old, status: "Scheduled" };
        next[current.ci].deliveries[current.di] = promoted;
      } else {
        next[target.ci].deliveries[target.di] = promoted;
      }
      return next;
    });
  }

  return (
    <div className={`mx-auto flex w-full max-w-[1200px] flex-col gap-6 ${PAGE_X} ${PAGE_Y}`}>
      <AdminWeekStrip selected={day} onSelect={setDay} />

      {/* KPI cards + next-delivery banner */}
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-col lg:flex-row">
          <StatCard
            label={isToday ? "Today's fuel delivery" : "Tomorrow's fuel delivery"}
            className="lg:min-w-[200px]"
          >
            <StatNumber>{isToday ? dayKpis.fuelDelivered : 0}</StatNumber>
            <StatUnit> / {dayKpis.fuelCapacity} gal</StatUnit>
          </StatCard>
          <StatCard
            label={isToday ? "Already delivered to" : "Deliveries planned"}
            className="lg:min-w-[200px]"
          >
            <StatNumber>{isToday ? todayDone : tomorrowStops}</StatNumber>
            <StatUnit> {isToday ? `/ ${dayKpis.locationsTotal} locations` : "locations"}</StatUnit>
          </StatCard>
        </div>
        {isToday ? (
          <NextDeliveryBanner stepIndex={step} onAdvance={advance} address={nextAddress} />
        ) : (
          <div className="flex flex-1 items-center gap-3 rounded-[var(--radius-card)] bg-grey-500/8 px-6 py-4">
            <CalendarIcon size={22} className="shrink-0 text-grey-500" />
            <p className="text-sm text-text-secondary">
              Showing <span className="font-semibold text-text-primary">tomorrow&apos;s</span> schedule
              — nothing is en route yet.
            </p>
          </div>
        )}
      </div>

      {/* Delivery board */}
      <div
        className={`grid grid-cols-1 gap-4 transition-opacity md:grid-cols-3 md:gap-6 ${
          isAlert ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {board.map((col) => (
          <div key={col.period} className="flex flex-col gap-4">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-text-secondary">
              {col.period}
            </h2>

            {Array.from({ length: 2 }, (_, i) => col.deliveries[i] ?? null).map(
              (d, i) =>
                d ? (
                  <AdminDeliveryCard
                    key={d.id}
                    delivery={d}
                    onCancel={setCancelTarget}
                    onMakeNext={setNextTarget}
                  />
                ) : (
                  <EmptySlot key={`empty-${col.period}-${i}`} />
                ),
            )}

            {/* Period summary */}
            <StatCard label="Period fuel delivery">
              <StatNumber>{col.delivered}</StatNumber>
              <StatUnit> {col.capacityLabel}</StatUnit>
            </StatCard>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && doCancel(cancelTarget)}
        title="Cancel this delivery?"
        description={
          cancelTarget
            ? `The delivery to ${cancelTarget.street}, ${cancelTarget.city} will be cancelled. This can't be undone.`
            : undefined
        }
        confirmLabel="Cancel Delivery"
        cancelLabel="Back"
      />

      <ConfirmDialog
        open={Boolean(nextTarget)}
        onClose={() => setNextTarget(null)}
        onConfirm={() => nextTarget && doMakeNext(nextTarget)}
        title="Make this the next delivery?"
        description={
          nextTarget
            ? `${nextTarget.street}, ${nextTarget.city} will be moved to the front of the queue as the next stop.`
            : undefined
        }
        confirmLabel="Make Next"
        cancelLabel="Back"
        destructive={false}
      />

      <CompleteFuelingDrawer
        open={fuelingOpen}
        onClose={() => setFuelingOpen(false)}
        onComplete={completeFueling}
        address={nextAddress}
        equipment={nextEquipment}
      />
    </div>
  );
}
