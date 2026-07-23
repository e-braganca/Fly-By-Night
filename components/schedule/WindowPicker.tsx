"use client";

export type DeliveryWindow = "Morning" | "Afternoon" | "Evening";
export const DELIVERY_WINDOWS: DeliveryWindow[] = ["Morning", "Afternoon", "Evening"];

/** Morning / Afternoon / Evening single-select, shared by both schedule wizards. */
export function WindowPicker({
  value,
  onChange,
  enabled,
}: {
  value: DeliveryWindow | null;
  onChange: (w: DeliveryWindow) => void;
  /** When provided, only these windows are selectable; others render disabled. */
  enabled?: DeliveryWindow[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {DELIVERY_WINDOWS.map((w) => {
        const isEnabled = enabled ? enabled.includes(w) : true;
        return (
          <button
            key={w}
            disabled={!isEnabled}
            onClick={() => onChange(w)}
            className={`h-12 rounded-lg border-2 text-sm font-semibold transition-colors ${
              value === w
                ? "border-primary bg-primary text-white"
                : !isEnabled
                  ? "cursor-not-allowed border-grey-500/16 bg-grey-500/8 text-text-disabled"
                  : "border-primary/48 bg-transparent text-primary hover:bg-primary/8"
            }`}
          >
            {w}
          </button>
        );
      })}
    </div>
  );
}
