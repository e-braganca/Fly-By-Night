import type { ReactNode } from "react";
import { PAGE_X, PAGE_Y } from "@/components/ui/layout";

/** Centered, responsively-padded page wrapper shared by the customer pages. */
export function PageContainer({
  maxWidth = 1200,
  gap = 24,
  className = "",
  children,
}: {
  maxWidth?: number;
  /** vertical gap between direct children, in px. */
  gap?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto flex w-full flex-col ${PAGE_X} ${PAGE_Y} ${className}`}
      style={{ maxWidth, gap }}
    >
      {children}
    </div>
  );
}
