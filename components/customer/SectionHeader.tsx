import type { ReactNode } from "react";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-sans text-sm font-bold uppercase leading-7 tracking-wide text-text-secondary">
        {title}
      </h2>
      {action}
    </div>
  );
}
