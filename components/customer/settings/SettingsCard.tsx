import type { ReactNode } from "react";

export function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] bg-white p-6">
      <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
      {footer && <div className="mt-6 flex justify-end">{footer}</div>}
    </section>
  );
}
