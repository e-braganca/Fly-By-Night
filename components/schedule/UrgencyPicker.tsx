"use client";

import { OfferCard } from "@/components/customer/OfferCard";
import { URGENCY_OPTIONS } from "@/lib/data/schedule";
import type { UrgencyTier } from "@/lib/data/types";

/** Urgency-tier selector (Standard / After-Hours / Emergency), shared by both
    schedule wizards. */
export function UrgencyPicker({
  value,
  onChange,
  showFee = true,
}: {
  value: UrgencyTier | null;
  onChange: (t: UrgencyTier) => void;
  /** Guest request flow hides pricing until the visitor confirms who they are. */
  showFee?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {(Object.keys(URGENCY_OPTIONS) as UrgencyTier[]).map((t) => (
        <OfferCard
          key={t}
          option={URGENCY_OPTIONS[t]}
          selected={value === t}
          onClick={() => onChange(t)}
          showFee={showFee}
        />
      ))}
    </div>
  );
}
