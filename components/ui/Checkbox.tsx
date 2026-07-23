"use client";

export function Checkbox({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
        checked ? "border-primary bg-primary text-white" : "border-grey-400 bg-white text-transparent"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 6" />
      </svg>
    </button>
  );
}
