"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { PencilIcon, TractorIcon } from "@/components/ui/Icon";
import type { Equipment } from "@/lib/data/types";

/* Per-unit selection is stored as a set of DESELECTED keys, so every unit —
   including units of newly-added equipment — defaults to selected. */
export const unitKey = (id: string, i: number) => `${id}:${i}`;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic serial-style unit number, e.g. "A2738491". */
export function unitNumber(id: string, i: number): string {
  const letter = String.fromCharCode(65 + (i % 26));
  const num = ((hash(id) % 9_000_000) + 1_000_000 + i * 111_111) % 10_000_000;
  return `${letter}${String(num).padStart(7, "0")}`;
}

/** The unit label for `e`'s i-th unit: its stored serial, else a generated one. */
function unitLabel(e: Equipment, i: number): string {
  return e.unitNumbers?.[i] ?? unitNumber(e.id, i);
}

/** How many units of `e` are currently selected. */
export function selectedUnitCount(e: Equipment, deselected: Set<string>): number {
  let n = 0;
  for (let i = 0; i < e.quantity; i++) if (!deselected.has(unitKey(e.id, i))) n++;
  return n;
}

function EquipmentCard({
  e,
  deselected,
  onChange,
  onEdit,
}: {
  e: Equipment;
  deselected: Set<string>;
  onChange: (next: Set<string>) => void;
  onEdit?: (e: Equipment) => void;
}) {
  const allSelected = selectedUnitCount(e, deselected) === e.quantity;
  const totalGallons = e.maxTankCapacity * e.quantity;

  function toggleUnit(i: number) {
    const next = new Set(deselected);
    const key = unitKey(e.id, i);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  function toggleAll() {
    const next = new Set(deselected);
    for (let i = 0; i < e.quantity; i++) {
      const key = unitKey(e.id, i);
      if (allSelected) next.add(key);
      else next.delete(key);
    }
    onChange(next);
  }

  return (
    <div className="rounded-2xl bg-grey-500/8 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar size={44} src={e.image} fallback={<TractorIcon size={22} className="text-grey-500" />} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{e.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge tone="neutral">{e.quantity} Units</Badge>
            <Badge tone="neutral">{totalGallons} Gallons Total</Badge>
            <Badge tone="neutral">{e.classification}</Badge>
          </div>
        </div>
        {onEdit && (
          <button
            aria-label={`Edit ${e.name}`}
            onClick={() => onEdit(e)}
            className="grid h-8 w-8 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/16"
          >
            <PencilIcon size={18} />
          </button>
        )}
      </div>

      {/* Unit list */}
      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between border-b border-divider pb-2">
          <span className="text-xs font-medium text-text-secondary">Unit Number</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary">
              {allSelected ? "Unselect All" : "Select All"}
            </span>
            <Switch checked={allSelected} onChange={toggleAll} aria-label={`Toggle all units of ${e.name}`} />
          </div>
        </div>
        {Array.from({ length: e.quantity }, (_, i) => {
          const selected = !deselected.has(unitKey(e.id, i));
          const label = unitLabel(e, i);
          return (
            <div key={i} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-text-primary">{label}</span>
              <Switch checked={selected} onChange={() => toggleUnit(i)} aria-label={`Unit ${label}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "Your Equipment" per-unit selection list, shared by the schedule wizards. */
export function EquipmentUnitPicker({
  equipments,
  deselected,
  onChange,
  onEdit,
}: {
  equipments: Equipment[];
  deselected: Set<string>;
  onChange: (next: Set<string>) => void;
  onEdit?: (e: Equipment) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {equipments.map((e) => (
        <EquipmentCard key={e.id} e={e} deselected={deselected} onChange={onChange} onEdit={onEdit} />
      ))}
    </div>
  );
}
