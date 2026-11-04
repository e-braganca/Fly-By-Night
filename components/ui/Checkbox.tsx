"use client";

export function Checkbox({
  checked,
  onChange,
  id,
  invalid = false,
  "aria-label": ariaLabel,
  "aria-describedby": describedBy,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  id?: string;
  /** Required and not ticked after a submit attempt: draws the error border. */
  invalid?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
        checked
          ? "border-primary bg-primary text-white"
          : invalid
            ? "border-error bg-white text-transparent"
            : "border-grey-400 bg-white text-transparent"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 6" />
      </svg>
    </button>
  );
}
