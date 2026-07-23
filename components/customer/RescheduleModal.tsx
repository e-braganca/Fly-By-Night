"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { OfferCard } from "@/components/customer/OfferCard";
import { MiniCalendar } from "@/components/schedule/MiniCalendar";
import { CalendarIcon } from "@/components/ui/Icon";
import { useAppStore, type RescheduleInput } from "@/lib/store";
import type { ScheduledDelivery, UrgencyTier } from "@/lib/data/types";
import {
  URGENCY_OPTIONS,
  URGENCY_SCHEDULE,
  formatLongDate,
  parseISO,
  REFERENCE_TODAY,
} from "@/lib/data/schedule";

const NEW_WINDOWS: UrgencyTier[] = ["after_hours_weekend", "emergency_call_out"];

/** Date field whose calendar opens as a floating, rounded popover (no outline),
    above or below the field — never pushing the drawer body content. */
function DateField({
  value,
  onSelect,
  allowsDay,
  placement = "top",
}: {
  value: string | null;
  onSelect: (iso: string) => void;
  allowsDay?: (iso: string) => boolean;
  placement?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const t = parseISO(REFERENCE_TODAY);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg bg-grey-500/8 px-3 py-3.5 text-sm text-text-primary outline-none transition-colors hover:bg-grey-500/16"
      >
        <span className={value ? "" : "text-text-disabled"}>
          {value ? formatLongDate(value) : "Select a date"}
        </span>
        <CalendarIcon size={18} className="ml-auto text-grey-600" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 right-0 z-30 rounded-2xl shadow-[var(--shadow-dropdown)] ${
              placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <MiniCalendar
              selectedISO={value}
              onSelect={(iso) => {
                onSelect(iso);
                setOpen(false);
              }}
              initialView={{ y: t.y, m: t.m }}
              minISO={REFERENCE_TODAY}
              isEnabled={allowsDay}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function RescheduleModal({
  open,
  onClose,
  delivery,
  intro = "You have this service scheduled under the following offer:",
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  delivery: ScheduledDelivery | null;
  /** Intro copy (admin passes a "This customer has…" variant). */
  intro?: string;
  /** Overrides the default store-based reschedule (e.g. for admin data). */
  onConfirm?: (id: string, input: RescheduleInput) => void;
}) {
  const reschedule = useAppStore((s) => s.rescheduleDelivery);
  const [pushDate, setPushDate] = useState<string | null>(null);
  const [tier, setTier] = useState<UrgencyTier | null>(null);
  const [winDate, setWinDate] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPushDate(null);
      setTier(null);
      setWinDate(null);
    }
  }, [open]);

  if (!delivery) return null;
  const current = URGENCY_OPTIONS[delivery.urgency];
  const isEmergency = tier === "emergency_call_out";
  const canConfirm = Boolean(pushDate) || isEmergency || Boolean(tier && winDate);
  const apply = onConfirm ?? reschedule;

  // Picking a push date and picking a new window are mutually exclusive ("or").
  function choosePush(iso: string) {
    setPushDate(iso);
    setTier(null);
    setWinDate(null);
  }
  function chooseTier(t: UrgencyTier) {
    setTier(t);
    setPushDate(null);
    setWinDate(null); // switching window invalidates the picked day
  }

  function confirm() {
    if (pushDate) {
      apply(delivery!.id, { mode: "push_date", newDateISO: pushDate });
    } else if (isEmergency && tier) {
      apply(delivery!.id, { mode: "new_window", newTier: tier });
    } else if (tier && winDate) {
      apply(delivery!.id, { mode: "reschedule", newTier: tier, newDateISO: winDate });
    }
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Reschedule Service"
      headerBorder
      footer={
        <div className="flex gap-3">
          <Button variant="soft" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" disabled={!canConfirm} onClick={confirm}>
            Confirm reschedule
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-6 py-4">
        <p className="text-base text-text-secondary">{intro}</p>

        <OfferCard option={current} highlight />

        <p className="text-lg font-semibold text-text-primary">What do you want to do?</p>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-text-primary">
            Push delivery from this date onward.
          </label>
          <DateField
            value={pushDate}
            onSelect={choosePush}
            allowsDay={URGENCY_SCHEDULE[delivery.urgency].allowsDay}
            placement="bottom"
          />
        </div>

        <p className="text-sm font-semibold text-text-primary">or</p>

        <div>
          <p className="mb-2 text-sm font-semibold text-text-primary">
            Select a new service window
          </p>
          <div className="flex flex-col gap-2">
            {NEW_WINDOWS.map((t) => (
              <div key={t}>
                <OfferCard
                  option={URGENCY_OPTIONS[t]}
                  selected={tier === t}
                  onClick={() => chooseTier(t)}
                />
                {tier === t && t !== "emergency_call_out" && (
                  <div className="mt-2">
                    <DateField
                      value={winDate}
                      onSelect={setWinDate}
                      allowsDay={URGENCY_SCHEDULE[t].allowsDay}
                      placement="top"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="rounded-lg border border-primary/16 bg-primary/8 px-4 py-3 text-sm text-primary">
          You will only be charged once the service is completed!
        </p>
      </div>
    </Drawer>
  );
}
