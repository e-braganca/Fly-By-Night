import type { ReactNode } from "react";
import { STICKY_HEADER } from "@/components/ui/layout";

/** Page title with an optional right-aligned actions slot. Sticks to the top of
    the scroll area; the negative margins let its background span the page
    gutters at every breakpoint. */
export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${STICKY_HEADER}`}>
      <h1 className="flex-1 text-2xl font-bold text-text-primary sm:text-3xl">
        {title}
      </h1>
      {children}
    </div>
  );
}
