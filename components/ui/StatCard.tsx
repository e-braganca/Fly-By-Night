import type { ReactNode } from "react";

/** White stat card: a grey label above a value. Used across dashboard,
    equipments and receipts. `tone="primary"` fills it blue to single out the
    figure a row adds up to (Finance's Total Profit). */
export function StatCard({
  label,
  children,
  note,
  tone = "default",
  className = "",
  labelLines = 1,
}: {
  label: string;
  children: ReactNode;
  /** Small line under the value, e.g. how a total splits. */
  note?: ReactNode;
  tone?: "default" | "primary";
  className?: string;
  /** Rows to reserve for the caption. Set to 2 when a card sits in a row whose
      longest label wraps, so every value in the row keeps the same baseline. */
  labelLines?: 1 | 2;
}) {
  const primary = tone === "primary";
  return (
    <div
      className={`flex-1 rounded-[var(--radius-card)] px-4 py-3 ${
        primary ? "bg-primary text-white" : "bg-white"
      } ${className}`}
    >
      <p
        className={`text-xs font-semibold leading-5 ${primary ? "text-white/80" : "text-grey-500"} ${
          labelLines === 2 ? "min-h-10" : ""
        }`}
      >
        {label}
      </p>
      <div className="mt-0.5">{children}</div>
      {note && (
        <p className={`mt-0.5 text-xs ${primary ? "text-white/80" : "text-grey-500"}`}>{note}</p>
      )}
    </div>
  );
}

/** Big blue stat number (Public-Sans-style 32px bold). */
export function StatNumber({ children }: { children: ReactNode }) {
  return (
    <span className="font-sans text-[32px] font-bold leading-tight text-primary">
      {children}
    </span>
  );
}

/** Secondary unit/value text next to a StatNumber, e.g. "gallons" or "/ 14". */
export function StatUnit({ children }: { children: ReactNode }) {
  return (
    <span className="text-[17px] font-semibold text-text-primary">{children}</span>
  );
}

/**
 * Money value like "$3,758.60" rendered as a small "$" + big blue number.
 *
 * `subtleCents` drops the cents to the same size as the "$", which is how the
 * admin Finance KPIs are drawn — it keeps six figures readable side by side in
 * a narrow card without rounding the number away. On phones the number also
 * steps down a size, so six figures still fit a half-width card.
 */
export function StatMoney({
  value,
  subtleCents = false,
  className = "text-primary",
}: {
  value: string;
  subtleCents?: boolean;
  /** Text colour; pass "text-white" inside a primary-tone StatCard. */
  className?: string;
}) {
  const num = value.replace("$", "");
  const [int, cents] = num.split(".");

  return (
    <span className={className}>
      <span className="align-top text-[17px] font-semibold">$</span>
      <span
        className={`font-sans font-bold leading-tight ${
          subtleCents ? "text-[26px] sm:text-[32px]" : "text-[32px]"
        }`}
      >
        {subtleCents ? int : num}
      </span>
      {subtleCents && cents && (
        <span className="text-[17px] font-semibold">.{cents}</span>
      )}
    </span>
  );
}
