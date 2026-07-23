"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import {
  TruckIcon,
  CheckIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  TractorIcon,
  CameraIcon,
  InfoIcon,
} from "@/components/ui/Icon";
import { money } from "@/lib/data/receipts";
import {
  FUEL_BASE_PRICE,
  FUEL_MARKUP,
  FUEL_OVERRIDE_DEFAULT,
  FUEL_CAPACITY,
  FUELING_SEED,
  type FuelingEquipment,
} from "@/lib/data/admin";

const clone = (list: FuelingEquipment[]): FuelingEquipment[] =>
  list.map((e) => ({ ...e, units: e.units.map((u) => ({ ...u })) }));

/* ----------------------------- pricing field ----------------------------- */

function PriceField({
  label,
  value,
  readOnly,
  onChange,
  helper,
  warn,
  className,
  unit = "/ gal",
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (v: string) => void;
  helper?: React.ReactNode;
  warn?: boolean;
  className?: string;
  unit?: string;
}) {
  return (
    <div className={className}>
      <div
        className={`flex items-center justify-between gap-1 rounded-lg px-3 py-2 ${
          readOnly
            ? "border border-dashed border-grey-500/32 bg-grey-500/8"
            : "bg-grey-500/8"
        }`}
      >
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-text-secondary">{label}</p>
          <div className="flex items-baseline gap-1 text-sm text-text-primary">
            <span>$</span>
            {readOnly ? (
              <span className="whitespace-nowrap">{value}</span>
            ) : (
              <input
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            )}
            {unit && <span className="shrink-0 text-text-secondary">{unit}</span>}
          </div>
        </div>
        {warn && <AlertTriangleIcon size={18} className="shrink-0 text-warning" />}
      </div>
      {helper && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-text-disabled">
          {helper}
        </p>
      )}
    </div>
  );
}

function StatusPill({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-success/16 px-1.5 text-xs font-semibold text-success-dark">
      <CheckIcon size={14} />
      Fueling Completed
    </span>
  ) : (
    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-warning/16 px-1.5 text-xs font-semibold text-warning-dark">
      <AlertTriangleIcon size={14} />
      Pending refueling
    </span>
  );
}

/* ----------------------------- unit pager ----------------------------- */

// Windowed page tokens (1-indexed numbers with "…" gaps) for a unit count.
function pagerTokens(total: number, current1: number): (number | "…")[] {
  if (total <= 8) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set(
    [1, total, current1, current1 - 1, current1 + 1].filter((p) => p >= 1 && p <= total),
  );
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function PhotoTile({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }
  return (
    <div className="flex-1">
      <p className="mb-2 text-sm font-semibold text-text-primary">{label}</p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={pick} />
      <button
        onClick={() => ref.current?.click()}
        className="relative grid h-32 w-full place-items-center overflow-hidden rounded-lg bg-grey-500/8 text-grey-500 transition-colors hover:bg-grey-500/16"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1">
            <CameraIcon size={28} />
            <span className="text-xs">Click to take the photo</span>
          </span>
        )}
      </button>
    </div>
  );
}

/* ----------------------------- drawer ----------------------------- */

export function CompleteFuelingDrawer({
  open,
  onClose,
  onComplete,
  equipment,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  address?: string;
  equipment?: FuelingEquipment[];
}) {
  const [equips, setEquips] = useState<FuelingEquipment[]>(() => clone(FUELING_SEED));
  const [override, setOverride] = useState(FUEL_OVERRIDE_DEFAULT.toFixed(2));
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    if (open) {
      setEquips(clone(equipment ?? FUELING_SEED));
      setOverride(FUEL_OVERRIDE_DEFAULT.toFixed(2));
      setQuery("");
      setActiveId(null);
      setSel(0);
    }
  }, [open, equipment]);

  const pricePerGal = FUEL_BASE_PRICE + FUEL_MARKUP + (Number(override) || 0);
  const delivered = equips
    .filter((e) => e.completed)
    .reduce((s, e) => s + e.units.reduce((t, u) => t + u.gallons, 0), 0);
  const totalCost = delivered * pricePerGal;
  const allDone = equips.length > 0 && equips.every((e) => e.completed);

  const active = useMemo(
    () => equips.find((e) => e.id === activeId) ?? null,
    [equips, activeId],
  );

  const shown = query
    ? equips.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    : equips;

  function updateUnit(patch: Partial<FuelingEquipment["units"][number]>) {
    setEquips((list) =>
      list.map((e) =>
        e.id === activeId
          ? { ...e, units: e.units.map((u, i) => (i === sel ? { ...u, ...patch } : u)) }
          : e,
      ),
    );
  }

  function completeEquipment() {
    setEquips((list) =>
      list.map((e) => (e.id === activeId ? { ...e, completed: true } : e)),
    );
    setActiveId(null);
    setSel(0);
  }

  /* ------------------------- unit (per-unit) view ------------------------- */
  if (active) {
    const unit = active.units[sel];
    const isLast = sel === active.units.length - 1;
    const unitTotal = pricePerGal * unit.gallons;

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title="Complete Fueling"
        headerBorder
        footer={
          <div className="flex gap-3">
            <Button
              variant="soft"
              size="lg"
              onClick={() => (sel === 0 ? (setActiveId(null), setSel(0)) : setSel((s) => s - 1))}
            >
              Back
            </Button>
            {isLast ? (
              <Button size="lg" className="flex-1" onClick={completeEquipment}>
                Complete Fueling
                <CheckIcon size={20} />
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={() => setSel((s) => s + 1)}>
                Next Unit
                <ArrowRightIcon size={20} />
              </Button>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          {/* Equipment heading */}
          <div className="flex items-center gap-3">
            <Avatar
              size={56}
              src={active.image}
              fallback={<TractorIcon size={24} className="text-grey-500" />}
            />
            <h3 className="text-xl font-bold leading-tight text-text-primary">{active.name}</h3>
          </div>

          {/* Equipment note */}
          {active.notes && (
            <div className="rounded-lg bg-grey-500/8 px-4 py-3">
              <p className="text-xs font-semibold text-text-secondary">Notes</p>
              <p className="text-sm font-semibold text-text-primary">{active.notes}</p>
            </div>
          )}

          {/* Unit pager */}
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous unit"
              disabled={sel === 0}
              onClick={() => setSel((s) => Math.max(0, s - 1))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-grey-600 hover:bg-grey-500/8 disabled:opacity-30"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div className="flex flex-1 items-center justify-center gap-2">
              {pagerTokens(active.units.length, sel + 1).map((tok, i) =>
                tok === "…" ? (
                  <span key={`e${i}`} className="px-0.5 text-sm text-text-disabled">
                    …
                  </span>
                ) : (
                  <button
                    key={tok}
                    onClick={() => setSel(tok - 1)}
                    className={`relative grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors ${
                      tok - 1 === sel
                        ? "bg-primary text-white"
                        : tok - 1 < sel
                          ? "bg-grey-800 text-white"
                          : "text-text-secondary hover:bg-grey-500/8"
                    }`}
                  >
                    {tok}
                    {tok - 1 < sel && (
                      <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-white ring-2 ring-white">
                        <CheckIcon size={10} />
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
            <button
              aria-label="Next unit"
              disabled={isLast}
              onClick={() => setSel((s) => Math.min(active.units.length - 1, s + 1))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-grey-600 hover:bg-grey-500/8 disabled:opacity-30"
            >
              <ChevronRightIcon size={18} />
            </button>
          </div>

          {/* Unit number */}
          <div className="flex items-center justify-between rounded-lg bg-grey-500/8 px-4 py-3">
            <span className="text-sm text-text-secondary">Unit Number</span>
            <span className="text-sm font-bold text-text-primary">{unit.unitNumber}</span>
          </div>

          {/* Pricing row */}
          <div>
            <div className="flex gap-3">
              <PriceField
                label="Fuel Price"
                value={pricePerGal.toFixed(2)}
                readOnly
                warn
                className="flex-1"
              />
              <div className="flex-1">
                <div className="rounded-lg border border-grey-800 bg-white px-3 py-2">
                  <p className="text-[11px] font-semibold text-text-secondary">Gal. filled</p>
                  <input
                    inputMode="decimal"
                    value={unit.gallons ? String(unit.gallons) : ""}
                    placeholder="0"
                    onChange={(e) =>
                      updateUnit({
                        gallons: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0,
                      })
                    }
                    className="w-full bg-transparent text-sm text-text-primary outline-none"
                  />
                </div>
              </div>
              <PriceField
                label="Total"
                value={money(unitTotal).replace("$", "")}
                readOnly
                unit=""
                className="flex-1"
              />
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-text-disabled">
              <InfoIcon size={13} />
              Changed by you
            </p>
          </div>

          {/* Per-unit note */}
          <div>
            <p className="mb-2 text-sm font-semibold text-text-primary">Notes</p>
            <textarea
              value={unit.note ?? ""}
              onChange={(e) => updateUnit({ note: e.target.value })}
              placeholder="Add a note for this unit"
              rows={3}
              className="w-full resize-none rounded-lg bg-grey-500/8 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-disabled"
            />
          </div>

          {/* Photos */}
          <div className="flex gap-4">
            <PhotoTile
              label="Equipment Photo"
              value={unit.equipmentPhoto}
              onChange={(v) => updateUnit({ equipmentPhoto: v })}
            />
            <PhotoTile
              label="Odometer reading"
              value={unit.odometerPhoto}
              onChange={(v) => updateUnit({ odometerPhoto: v })}
            />
          </div>
        </div>
      </Drawer>
    );
  }

  /* ------------------------- list view ------------------------- */
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Complete Fueling"
      headerBorder
      footer={
        <div className="flex gap-3">
          <Button variant="soft" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" disabled={!allDone} onClick={onComplete}>
            Complete Fueling
            <CheckIcon size={20} />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-4">
        <p className="text-base text-text-secondary">
          Go over each requested equipment to be filled, and add the information.
        </p>

        {/* Fuel type tag */}
        <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-grey-800 px-3 py-1.5 text-sm font-medium text-white">
          <TruckIcon size={18} />
          Off-road Diesel
        </span>

        {/* Pricing — Override takes ~40%, the other two split the rest */}
        <div className="flex gap-3">
          <PriceField label="Fuel Base Price" value={FUEL_BASE_PRICE.toFixed(2)} readOnly className="flex-1" />
          <PriceField label="Markup Price" value={FUEL_MARKUP.toFixed(2)} readOnly className="flex-1" />
          <PriceField
            label="Override Markup"
            value={override}
            onChange={setOverride}
            helper="Changed on 05/23/26"
            className="shrink-0 basis-[40%]"
          />
        </div>

        {/* Search */}
        <SearchInput value={query} onChange={setQuery} placeholder="Search equipment" />

        {/* Equipment list */}
        <div className="flex flex-col">
          {shown.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setActiveId(e.id);
                setSel(0);
              }}
              className="flex items-center gap-3 py-3 text-left transition-colors hover:bg-grey-500/8"
            >
              <Avatar
                size={48}
                src={e.image}
                fallback={<TractorIcon size={22} className="text-grey-500" />}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{e.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-grey-500/16 px-1.5 text-xs font-semibold text-text-secondary">
                    {e.units.length}
                  </span>
                  <StatusPill done={e.completed} />
                </div>
              </div>
              <ChevronRightIcon size={20} className="shrink-0 text-grey-500" />
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-2 flex gap-3">
          <StatCard label="Total Delivered">
            <span className="font-sans text-[28px] font-bold leading-tight text-primary">
              {delivered}
            </span>
            <span className="text-sm font-semibold text-text-primary"> / up to {FUEL_CAPACITY} gal</span>
          </StatCard>
          <StatCard label="Total Cost">
            <span className="text-primary">
              <span className="align-top text-sm font-semibold">$</span>
              <span className="font-sans text-[28px] font-bold leading-tight">
                {money(totalCost).replace("$", "")}
              </span>
            </span>
          </StatCard>
        </div>
      </div>
    </Drawer>
  );
}
