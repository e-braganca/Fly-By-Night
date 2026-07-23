"use client";

import { OfferCard } from "@/components/customer/OfferCard";
import { URGENCY_OPTIONS } from "@/lib/data/schedule";
import type { UrgencyTier } from "@/lib/data/types";

/** Urgency-tier selector (Standard / After-Hours / Emergency), shared by both
    schedule wizards. */
export function UrgencyPicker({
  value,
  onChange,
}: {
  value: UrgencyTier | null;
  onChange: (t: UrgencyTier) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {(Object.keys(URGENCY_OPTIONS) as UrgencyTier[]).map((t) => (
        <OfferCard
          key={t}
          option={URGENCY_OPTIONS[t]}
          selected={value === t}
          onClick={() => onChange(t)}
        />
      ))}
    </div>
  );
}
