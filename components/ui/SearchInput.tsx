"use client";

import { SearchIcon } from "./Icon";

/** Filled search field with a trailing search icon. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg bg-grey-500/8 pl-4 pr-11 text-sm text-text-primary outline-none placeholder:text-text-disabled focus:ring-2 focus:ring-primary/24"
      />
      <SearchIcon
        size={20}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grey-500"
      />
    </div>
  );
}
