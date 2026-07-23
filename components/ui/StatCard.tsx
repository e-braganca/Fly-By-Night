import type { ReactNode } from "react";

/** White stat card: a grey label above a value. Used across dashboard,
    equipments and receipts. */
export function StatCard({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 rounded-[var(--radius-card)] bg-white px-4 py-3 ${className}`}>
      <p className="text-xs font-semibold leading-5 text-grey-500">{label}</p>
      <div className="mt-0.5">{children}</div>
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

/** Money value like "$3,758.60" rendered as a small "$" + big blue number. */
export function StatMoney({ value }: { value: string }) {
  const num = value.replace("$", "");
  return (
    <span className="text-primary">
      <span className="align-top text-[17px] font-semibold">$</span>
      <span className="font-sans text-[32px] font-bold leading-tight">{num}</span>
    </span>
  );
}
