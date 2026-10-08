import type { ReactNode } from "react";
import { PAGE_X, PAGE_Y, PAGE_FILL } from "@/components/ui/layout";

/** Centered, responsively-padded page wrapper shared by the customer pages. */
export function PageContainer({
  /** `"full"` lets a wide table use the whole content area. */
  maxWidth = 1200,
  gap = 24,
  className = "",
  /** Stretch to the viewport, for pages built around a table. */
  fill = false,
  children,
}: {
  maxWidth?: number | "full";
  /** vertical gap between direct children, in px. */
  gap?: number;
  className?: string;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`mx-auto flex w-full flex-col ${fill ? PAGE_FILL : ""} ${PAGE_X} ${PAGE_Y} ${className}`}
      style={{ maxWidth: maxWidth === "full" ? undefined : maxWidth, gap }}
    >
      {children}
    </div>
  );
}
