"use client";

import type { ReactNode } from "react";
import { ChevronDownIcon } from "./Icon";

/* Labelled filter controls for the admin Finance bar: a small grey caption with
   a filled control under it. Matches the filled style of SearchInput so the
   whole row reads as one band. */

const CONTROL =
  "h-11 w-full rounded-lg bg-grey-500/8 px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/24";

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <Labelled label={label}>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={`${CONTROL} appearance-none pr-10`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grey-600"
        />
      </span>
    </Labelled>
  );
}

export function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <Labelled label={label}>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL}
      />
    </Labelled>
  );
}
