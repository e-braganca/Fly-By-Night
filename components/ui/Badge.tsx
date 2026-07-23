import type { ReactNode } from "react";

export type Tone =
  | "neutral"
  | "error"
  | "primary"
  | "success"
  | "warning"
  | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-grey-500/16 text-text-secondary",
  error: "bg-error/16 text-error-dark",
  primary: "bg-primary/8 text-primary-dark",
  success: "bg-success/16 text-success-dark",
  warning: "bg-warning/16 text-warning-dark",
  info: "bg-info/16 text-info",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold leading-5 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
