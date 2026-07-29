"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { PencilIcon, TractorIcon, ChevronDownIcon } from "@/components/ui/Icon";
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
  const [open, setOpen] = useState(false);
  const selectedCount = selectedUnitCount(e, deselected);
  const totalGallons = e.maxTankCapacity * e.quantity;
  /* The header switch is the equipment's on/off for this delivery: on while any
     unit is selected, off once every unit is deselected. */
  const enabled = selectedCount > 0;

  function toggleUnit(i: number) {
    const next = new Set(deselected);
    const key = unitKey(e.id, i);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  /** Off → drop every unit; on → bring them all back. */
  function toggleEquipment() {
    const next = new Set(deselected);
    for (let i = 0; i < e.quantity; i++) {
      const key = unitKey(e.id, i);
      if (enabled) next.add(key);
      else next.delete(key);
    }
    onChange(next);
  }

  // Dims the equipment's identity while it's switched off — the controls stay
  // at full strength so they still read as actionable.
  const dim = enabled ? "" : "opacity-40";

  return (
    <div
      className={`rounded-2xl p-4 transition-colors ${
        enabled ? "bg-grey-500/8" : "bg-grey-500/4 ring-1 ring-inset ring-grey-500/16"
      }`}
    >
      {/* Header — photo + chevron expand the unit list; the switch on the right
          includes or excludes the whole equipment. */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? `Hide units of ${e.name}` : `Show units of ${e.name}`}
          className={`relative shrink-0 rounded-xl ${dim}`}
        >
          <Avatar size={44} src={e.image} fallback={<TractorIcon size={22} className="text-grey-500" />} />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-primary shadow-[var(--shadow-card)]">
            <ChevronDownIcon size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`min-w-0 flex-1 text-left ${dim}`}
        >
          <p className="truncate text-sm font-semibold text-text-primary">{e.name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge tone="neutral">
              {selectedCount}/{e.quantity} Units
            </Badge>
            <Badge tone="neutral">{totalGallons} Gallons Total</Badge>
            <Badge tone="neutral">{e.classification}</Badge>
          </div>
        </button>
        {onEdit && (
          <button
            aria-label={`Edit ${e.name}`}
            onClick={() => onEdit(e)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-grey-600 transition-colors hover:bg-grey-500/16"
          >
            <PencilIcon size={18} />
          </button>
        )}
        <Switch
          checked={enabled}
          onChange={toggleEquipment}
          aria-label={
            enabled
              ? `Exclude ${e.name} from this delivery`
              : `Include ${e.name} in this delivery`
          }
        />
      </div>

      {!enabled && (
        <p className="mt-3 text-xs font-medium text-text-secondary">
          Not included in this delivery — switch it on to fuel it.
        </p>
      )}

      {/* Unit list — revealed when the equipment is expanded. */}
      {open && (
        <div className="mt-4 flex flex-col">
          <div className="border-b border-divider pb-2">
            <span className="text-xs font-medium text-text-secondary">Unit Number</span>
          </div>
          {Array.from({ length: e.quantity }, (_, i) => {
            const selected = !deselected.has(unitKey(e.id, i));
            const label = unitLabel(e, i);
            return (
              <div key={i} className="flex items-center justify-between py-2.5">
                <span className={`text-sm text-text-primary ${selected ? "" : "opacity-40"}`}>
                  {label}
                </span>
                <Switch checked={selected} onChange={() => toggleUnit(i)} aria-label={`Unit ${label}`} />
              </div>
            );
          })}
        </div>
      )}
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
