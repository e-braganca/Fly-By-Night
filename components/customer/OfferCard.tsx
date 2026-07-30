"use client";

import { CalendarIcon, ClockIcon, AlertTriangleIcon } from "@/components/ui/Icon";
import type { UrgencyOption } from "@/lib/data/types";
import { feeLabel } from "@/lib/data/schedule";

const ICONS = {
  calendar: CalendarIcon,
  clock: ClockIcon,
  alert: AlertTriangleIcon,
};

/**
 * Selectable urgency/service-tier card. `selected` shows the filled radio +
 * active styling; `highlight` shows active styling without a filled radio (for
 * a read-only "current offer"). Shared by the reschedule flow and the
 * schedule-a-delivery wizard.
 */
export function OfferCard({
  option,
  selected,
  highlight,
  onClick,
  showFee = true,
}: {
  option: UrgencyOption;
  selected?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  /** Guest request flow hides pricing until the visitor confirms who they are. */
  showFee?: boolean;
}) {
  const Icon = ICONS[option.icon];
  const active = selected || highlight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors ${
        active
          ? "border-2 border-primary bg-primary-lighter"
          : "border-2 border-transparent bg-white hover:bg-grey-500/8"
      }`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-grey-400"
        }`}
      >
        {selected && <span className="h-3 w-3 rounded-full bg-primary" />}
      </span>
      <Icon size={24} className={active ? "text-primary" : "text-grey-600"} />
      <div className="flex-1">
        <p
          className={`font-sans text-[17px] font-bold ${
            active ? "text-primary-darker" : "text-text-primary"
          }`}
        >
          {option.title}
        </p>
        <p className={`text-sm ${active ? "text-primary-dark" : "text-text-secondary"}`}>
          {option.description}
        </p>
      </div>
      {showFee && (
        <div className="text-right">
          <p className={`text-xs ${active ? "text-primary" : "text-text-secondary"}`}>
            fee
          </p>
          <p
            className={`text-lg font-semibold ${
              active ? "text-primary-darker" : "text-text-primary"
            }`}
          >
            {feeLabel(option.fee)}
          </p>
        </div>
      )}
    </button>
  );
}
