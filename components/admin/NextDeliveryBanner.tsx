"use client";

import {
  TruckIcon,
  DropletIcon,
  CheckIcon,
} from "@/components/ui/Icon";
import {
  BANNER_STEPS,
  nextDeliveryAddress,
  truckTankRemaining,
} from "@/lib/data/admin";

const ICONS = { truck: TruckIcon, nozzle: DropletIcon, check: CheckIcon };

export const BANNER_ALERT_INDEX = BANNER_STEPS.length;

export function NextDeliveryBanner({
  stepIndex,
  onAdvance,
  address = nextDeliveryAddress,
}: {
  stepIndex: number;
  onAdvance: () => void;
  address?: string;
}) {
  const isAlert = stepIndex >= BANNER_ALERT_INDEX;

  if (isAlert) {
    return (
      <div className="flex flex-1 flex-wrap items-center gap-4 rounded-[var(--radius-card)] bg-secondary-light px-4 py-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-darker">
          <TruckIcon size={24} />
        </span>
        <p className="min-w-[160px] flex-1 text-sm font-semibold text-secondary-darker">
          Make sure to refuel your tank before moving on to the next customer.
        </p>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-secondary-dark">
            Gallons remaining
          </p>
          <p className="font-sans text-[28px] font-bold leading-none text-secondary-darker">
            {truckTankRemaining}
          </p>
        </div>
        <button
          onClick={onAdvance}
          className="flex h-9 items-center gap-2 rounded-lg bg-grey-800 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-grey-900"
        >
          <TruckIcon size={18} />
          Fill My Tank
        </button>
      </div>
    );
  }

  const step = BANNER_STEPS[stepIndex];
  const NextIcon = ICONS[step.nextIcon];

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-[var(--radius-card)] bg-gradient-to-r from-primary to-primary-light px-4 py-4 text-white sm:flex-row sm:items-center">
      {/* Left: address */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/16 backdrop-blur">
          <TruckIcon size={22} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            Next delivery
          </p>
          <p className="truncate font-sans text-base font-semibold">
            {address}
          </p>
        </div>
      </div>

      {/* Right: status → change to */}
      <div className="flex items-center gap-4 border-t border-white/20 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            Current status
          </p>
          <span className="mt-1 inline-flex items-center rounded-full border border-white/40 px-3 py-1 text-[13px] font-semibold">
            {step.current}
          </span>
        </div>
        <span className="text-white/70">→</span>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            Change to
          </p>
          <button
            onClick={onAdvance}
            className="mt-1 flex h-9 items-center gap-2 rounded-lg bg-grey-800 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-grey-900"
          >
            <NextIcon size={18} />
            {step.next}
          </button>
        </div>
      </div>
    </div>
  );
}
