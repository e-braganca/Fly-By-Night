"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { Avatar } from "@/components/ui/Avatar";
import {
  CheckIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  TractorIcon,
  CameraIcon,
  InfoIcon,
  DropletIcon,
  InvoiceIcon,
  XCircleIcon,
} from "@/components/ui/Icon";
import { money } from "@/lib/data/receipts";
import { SELLER, BILL_TO } from "@/lib/data/receipts";
import { formatLongDate } from "@/lib/data/schedule";
import { REFERENCE_TODAY } from "@/lib/data/schedule";
import {
  FUEL_BASE_PRICE,
  FUEL_MARKUP,
  FUEL_OVERRIDE_DEFAULT,
  FUEL_OVERRIDE_CHANGED_ON,
  DEF_TOP_OFF_PRICE,
  FUELING_SEED,
  type FuelingEquipment,
} from "@/lib/data/admin";

/*
  The fueling run, as a focused full-screen flow:

    prep -> list -> unit (per unit, repeated) -> list -> invoice

  It takes over the viewport rather than sitting in a drawer, matching the Figma
  flow where the operator has nothing else on screen. Kept as an overlay on the
  dashboard instead of its own route so the board behind it keeps its state.
*/

type Step = "prep" | "list" | "unit" | "invoice";

const clone = (list: FuelingEquipment[]): FuelingEquipment[] =>
  list.map((e) => ({ ...e, units: e.units.map((u) => ({ ...u })) }));

const FL_FUEL_TAX_PER_GAL = 0.359;
const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------ shared bits ------------------------------ */

function Shell({
  title,
  subtitle,
  children,
  footer,
  dialog,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** Rendered above the flow — the cancel confirmation. */
  dialog?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 px-5 py-8">
          <header className="rounded-[var(--radius-card)] bg-white px-6 py-5">
            <h1 className="text-[28px] font-bold leading-tight text-text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
          </header>
          {children}
        </div>
      </div>
      <div className="border-t border-divider bg-neutral">
        <div className="mx-auto flex w-full max-w-[640px] gap-3 px-5 py-4">{footer}</div>
      </div>
      {dialog}
    </div>
  );
}

function Figure({
  label,
  value,
  unit,
  sub,
  boxed,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: string;
  boxed?: boolean;
}) {
  return (
    <div className="flex-1 px-4 py-3 text-center">
      <p className="text-xs text-text-secondary">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold text-text-primary ${
          boxed ? "rounded-lg bg-white px-3 py-1.5" : ""
        }`}
      >
        {value}
        {unit && <span className="ml-0.5 text-sm font-semibold">{unit}</span>}
      </p>
      {sub && <p className="mt-1 text-xs text-text-secondary">{sub}</p>}
    </div>
  );
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
  return (
    <div className="flex-1">
      {label && <p className="mb-2 text-sm font-semibold text-text-primary">{label}</p>}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />
      <button
        onClick={() => ref.current?.click()}
        className="relative grid h-36 w-full place-items-center overflow-hidden rounded-lg border border-dashed border-grey-400 bg-grey-500/8 text-grey-500 transition-colors hover:bg-grey-500/16"
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

function StatusPill({ done, skipped }: { done: boolean; skipped?: boolean }) {
  if (skipped)
    return (
      <span className="inline-flex h-6 items-center gap-1 rounded-md bg-error/16 px-1.5 text-xs font-semibold text-error-dark">
        <XCircleIcon size={14} />
        Could not fuel
      </span>
    );
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

/* --------------------------------- flow --------------------------------- */

export function FuelingFlow({
  onClose,
  onComplete,
  equipment,
  defTopOff = true,
}: {
  onClose: () => void;
  onComplete: () => void;
  address?: string;
  equipment?: FuelingEquipment[];
  /** Whether the customer asked for the DEF top-off on this delivery. */
  defTopOff?: boolean;
}) {
  const [step, setStep] = useState<Step>("prep");
  const [equips, setEquips] = useState<FuelingEquipment[]>(() => clone(equipment ?? FUELING_SEED));
  const [override, setOverride] = useState(FUEL_OVERRIDE_DEFAULT.toFixed(2));
  const [meterPhoto, setMeterPhoto] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sel, setSel] = useState(0);
  /** The current unit's pump is running — switches the unit screen to phase two. */
  const [running, setRunning] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView();
  }, [step, activeId, sel]);

  const pricePerGal = FUEL_BASE_PRICE + FUEL_MARKUP + (Number(override) || 0);

  const countedUnits = equips.flatMap((e) => e.units).filter((u) => !u.skipped);
  const delivered = countedUnits.reduce((s, u) => s + u.gallons, 0);
  const requested = equips.reduce(
    (s, e) => s + (e.maxGallons ? e.maxGallons * e.units.length : 0),
    0,
  );
  const allDone = equips.length > 0 && equips.every((e) => e.completed);

  const active = useMemo(() => equips.find((e) => e.id === activeId) ?? null, [equips, activeId]);
  const shown = query
    ? equips.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    : equips;

  function patchUnit(patch: Partial<FuelingEquipment["units"][number]>) {
    setEquips((list) =>
      list.map((e) =>
        e.id === activeId
          ? { ...e, units: e.units.map((u, i) => (i === sel ? { ...u, ...patch } : u)) }
          : e,
      ),
    );
  }

  /** Mark the equipment done once every one of its units is settled. */
  function settleEquipment() {
    setEquips((list) =>
      list.map((e) =>
        e.id === activeId
          ? { ...e, completed: e.units.every((u) => u.done || u.skipped) }
          : e,
      ),
    );
  }

  function advanceUnit() {
    const last = active && sel === active.units.length - 1;
    setRunning(false);
    if (last) {
      settleEquipment();
      setActiveId(null);
      setSel(0);
      setStep("list");
    } else {
      setSel((s) => s + 1);
    }
  }

  /* ------------------------------- step: prep ------------------------------ */
  const cancelDialog = (
    <ConfirmDialog
      open={confirmCancel}
      onClose={() => setConfirmCancel(false)}
      onConfirm={onClose}
      title="Cancel this service?"
      description="The fueling run will be discarded — gallons entered, photos taken and notes written on this visit are not saved. The delivery stays scheduled."
      confirmLabel="Cancel Service"
      cancelLabel="Keep Fueling"
    />
  );

  if (step === "prep") {
    return (
      <Shell
        dialog={cancelDialog}
        title="Before you begin fueling"
        subtitle="First, check your markup price, take a photo of the meter and check the service requested."
        footer={
          <>
            <Button variant="soft" size="lg" onClick={() => setConfirmCancel(true)}>
              Cancel Service
            </Button>
            <Button size="lg" className="flex-1" onClick={() => setStep("list")}>
              Proceed to Fueling
              <CheckIcon size={20} />
            </Button>
          </>
        }
      >
        <div ref={topRef} />

        {/* Prices */}
        <div className="flex flex-col divide-y divide-divider rounded-[var(--radius-card)] bg-white sm:flex-row sm:divide-x sm:divide-y-0">
          <Figure label="Fuel Base Price" value={`$ ${FUEL_BASE_PRICE.toFixed(2)}`} />
          <Figure label="Markup Price" value={`$ ${FUEL_MARKUP.toFixed(2)}`} unit="/gal" />
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-xs text-text-secondary">Override Markup</p>
            <div className="mt-1 inline-flex items-baseline gap-1 rounded-lg bg-grey-500/8 px-3 py-1.5">
              <span className="text-sm font-semibold text-text-primary">$</span>
              <input
                value={override}
                onChange={(e) => setOverride(e.target.value.replace(/[^\d.]/g, ""))}
                aria-label="Override markup"
                className="w-14 bg-transparent text-2xl font-bold text-text-primary outline-none"
              />
              <span className="text-sm font-semibold text-text-primary">/gal</span>
            </div>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-text-disabled">
              <InfoIcon size={14} />
              Changed on {FUEL_OVERRIDE_CHANGED_ON}
            </p>
          </div>
        </div>

        {/* Meter photo */}
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-white p-6 sm:flex-row">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-text-primary">Odometer reading</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Take a photo of the odometer reading before starting fueling the equipment.
            </p>
            <p className="mt-3 text-sm text-text-secondary">Make sure the photo is sharp.</p>
          </div>
          <div className="sm:w-[300px]">
            <PhotoTile label="" value={meterPhoto} onChange={setMeterPhoto} />
          </div>
        </div>

        {/* What was requested */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 rounded-[var(--radius-card)] bg-white px-5 py-4">
            <p className="text-xs font-semibold text-text-secondary">Total Fuel Requested</p>
            <p className="mt-1 text-[28px] font-bold leading-tight text-primary">
              {requested}
              <span className="ml-1 text-sm font-semibold text-text-primary">/ gal</span>
            </p>
          </div>
          <div className="flex-1 rounded-[var(--radius-card)] bg-white px-5 py-4">
            <p className="text-xs font-semibold text-text-secondary">DEF top-off</p>
            <p className="mt-1 text-[22px] font-bold leading-tight text-primary">
              {defTopOff ? "Yes, DEF top-off" : "No DEF top-off"}
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  /* ------------------------------- step: unit ------------------------------ */
  if (step === "unit" && active) {
    const unit = active.units[sel];
    const unitCost = pricePerGal * unit.gallons;
    const equipTotal = active.units.filter((u) => !u.skipped).reduce((s, u) => s + u.gallons, 0);
    const equipRequested = (active.maxGallons ?? 0) * active.units.length;

    return (
      <Shell
        dialog={cancelDialog}
        title="Start fueling"
        subtitle="Go over each requested equipment to be filled, and add the information."
        footer={
          <>
            <Button
              variant="soft"
              size="lg"
              onClick={() => {
                if (running) return setRunning(false);
                if (sel === 0) {
                  setActiveId(null);
                  setStep("list");
                } else setSel((s) => s - 1);
              }}
            >
              {running ? "Start over" : "Back"}
            </Button>
            {running ? (
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  patchUnit({ done: true, skipped: false });
                  advanceUnit();
                }}
              >
                Complete Unit Fueling
                <CheckIcon size={20} />
              </Button>
            ) : (
              <>
                <Button
                  variant="errorSoft"
                  size="lg"
                  onClick={() => {
                    patchUnit({ skipped: true, done: false, gallons: 0 });
                    advanceUnit();
                  }}
                >
                  Can&apos;t Fuel
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setRunning(true)}>
                  Start Fueling Unit
                  <DropletIcon size={20} />
                </Button>
              </>
            )}
          </>
        }
      >
        <div ref={topRef} />
        <div className="rounded-[var(--radius-card)] bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <Avatar
              size={56}
              src={active.image}
              fallback={<TractorIcon size={24} className="text-grey-500" />}
            />
            <h2 className="text-xl font-bold leading-tight text-text-primary">{active.name}</h2>
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <div className="min-w-0 flex-1">
              {/* Notes */}
              <div className="rounded-lg bg-grey-500/8 px-4 py-3">
                <p className="text-xs font-semibold text-text-secondary">Notes</p>
                <textarea
                  value={unit.note ?? active.notes ?? ""}
                  onChange={(e) => patchUnit({ note: e.target.value })}
                  rows={3}
                  className="mt-1 w-full resize-none bg-transparent text-sm text-text-primary outline-none"
                />
              </div>

              {/* Photos */}
              <div className="mt-5 flex gap-4">
                <PhotoTile
                  label="Equipment Before Fueling"
                  value={unit.equipmentPhoto}
                  onChange={(v) => patchUnit({ equipmentPhoto: v })}
                />
                <PhotoTile
                  label="Equipment After Fueling"
                  value={unit.odometerPhoto}
                  onChange={(v) => patchUnit({ odometerPhoto: v })}
                />
              </div>

              {/* Figures */}
              <div className="mt-5 rounded-lg bg-grey-500/8 p-4">
                <span className="inline-flex items-baseline gap-1 rounded-md bg-white px-2 py-1 text-xs">
                  <span className="text-text-secondary">Fuel Price</span>
                  <span className="font-bold text-text-primary">{money(pricePerGal)}</span>
                </span>
                <div className="mt-3 flex divide-x divide-divider">
                  <div className="flex-1 px-2 text-left">
                    <p className="text-xs text-text-secondary">In this Unit</p>
                    <div className="mt-1 inline-flex items-baseline rounded-lg bg-white px-3 py-1.5">
                      <input
                        value={String(unit.gallons)}
                        disabled={!running}
                        onChange={(e) => {
                          const n = Number(e.target.value.replace(/[^\d.]/g, "")) || 0;
                          patchUnit({ gallons: active.maxGallons ? Math.min(n, active.maxGallons) : n });
                        }}
                        aria-label="Gallons into this unit"
                        className="w-12 bg-transparent text-2xl font-bold text-text-primary outline-none disabled:text-text-disabled"
                      />
                      <span className="text-sm font-semibold">gal</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{money(unitCost)}</p>
                  </div>
                  <Figure
                    label="Total Fuel Amount"
                    value={equipTotal}
                    unit="gal"
                    sub={money(equipTotal * pricePerGal)}
                  />
                  <Figure
                    label="Total Requested"
                    value={equipRequested}
                    unit="gal"
                    sub={money(equipRequested * pricePerGal)}
                  />
                </div>
              </div>
            </div>

            {/* Unit serial rail */}
            <ul className="flex shrink-0 flex-row gap-2 overflow-x-auto md:w-[136px] md:flex-col md:overflow-visible">
              {active.units.map((u, i) => (
                <li key={u.unitNumber}>
                  <button
                    onClick={() => {
                      setSel(i);
                      setRunning(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      i === sel ? "bg-grey-500/16 text-text-primary" : "text-text-secondary hover:bg-grey-500/8"
                    }`}
                  >
                    {u.unitNumber}
                    {u.skipped ? (
                      <XCircleIcon size={16} className="text-error" />
                    ) : u.done ? (
                      <CheckIcon size={16} className="text-success" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Shell>
    );
  }

  /* ----------------------------- step: invoice ----------------------------- */
  if (step === "invoice") {
    const fuelCost = round2(delivered * pricePerGal);
    const def = defTopOff ? DEF_TOP_OFF_PRICE : 0;
    const tax = round2(delivered * FL_FUEL_TAX_PER_GAL);
    const total = round2(fuelCost + def + tax);

    return (
      <Shell
        dialog={cancelDialog}
        title="Review and generate invoice"
        subtitle="Go over each requested equipment to be filled, and add the information."
        footer={
          <>
            <Button variant="soft" size="lg" onClick={() => setConfirmCancel(true)}>
              Cancel Service
            </Button>
            <Button variant="soft" size="lg" className="flex-1" onClick={() => setStep("list")}>
              Previous Step
            </Button>
            <Button size="lg" className="flex-1" onClick={onComplete}>
              Issue invoice
              <InvoiceIcon size={20} />
            </Button>
          </>
        }
      >
        <div ref={topRef} />
        <div className="rounded-[var(--radius-card)] bg-white">
          {/* Parties */}
          <div className="border-b border-divider p-6">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <p className="text-sm font-bold text-text-primary">
                Invoice number <span className="ml-2">AX871</span>
              </p>
              <p className="text-xs text-text-secondary">
                Date of issue <span className="ml-2 text-text-primary">{formatLongDate(REFERENCE_TODAY)}</span>
              </p>
              <p className="text-xs text-text-secondary">
                Date due <span className="ml-2 text-text-primary">{formatLongDate(REFERENCE_TODAY)}</span>
              </p>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                { title: SELLER.name, lines: SELLER.lines, email: SELLER.email, sub: undefined },
                { title: "Bill to", lines: BILL_TO.lines, email: BILL_TO.email, sub: BILL_TO.name },
              ].map((p) => (
                <div key={p.title}>
                  <p className="text-sm font-bold text-text-primary">{p.title}</p>
                  {p.sub && <p className="mt-1 text-xs text-text-secondary">{p.sub}</p>}
                  {p.lines.map((l) => (
                    <p key={l} className="text-xs text-text-secondary">{l}</p>
                  ))}
                  <p className="mt-1 text-xs text-text-secondary">{p.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-text-primary">Fuel Cost (pass-through)</p>
              <p className="text-sm font-bold text-text-primary">{money(fuelCost)}</p>
            </div>
            <div className="mt-3 flex divide-x divide-divider rounded-lg bg-grey-500/8 py-2">
              <Figure label="Fuel Base Price" value={`$ ${FUEL_BASE_PRICE.toFixed(2)}`} />
              <Figure label="Markup Price" value={`$ ${Number(override).toFixed(2)}`} unit="/gal" boxed />
              <Figure label="Total gallons delivery" value={delivered} unit="gal" boxed />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-divider pt-4">
              <div>
                <p className="text-sm font-bold text-text-primary">Delivery fee</p>
                <p className="text-xs text-text-secondary">Standard scheduled delivery</p>
              </div>
              <span className="rounded-lg bg-grey-500/8 px-3 py-2 text-sm font-semibold text-text-primary">
                Free
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">DEF top-off</p>
                <p className="text-xs text-text-secondary">up to 25 gal</p>
              </div>
              <span className="rounded-lg bg-grey-500/8 px-3 py-2 text-sm font-semibold text-text-primary">
                {defTopOff ? `Yes - ${money(DEF_TOP_OFF_PRICE)}` : "No"}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Florida fuel tax (on-road)</p>
                <p className="text-xs text-text-secondary">
                  ${FL_FUEL_TAX_PER_GAL.toFixed(3)}/gal • pass-through to FL DOR
                </p>
              </div>
              <p className="text-sm text-text-primary">{money(tax)}</p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-divider pt-5">
              <p className="text-base font-bold text-text-primary">Total</p>
              <p className="text-[28px] font-bold leading-none text-text-primary">{money(total)}</p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  /* ------------------------------- step: list ------------------------------ */
  return (
    <Shell
      dialog={cancelDialog}
      title="Start fueling"
      subtitle="Go over each requested equipment to be filled, and add the information."
      footer={
        <>
          <Button variant="soft" size="lg" onClick={() => setConfirmCancel(true)}>
            Cancel Service
          </Button>
          <Button variant="soft" size="lg" className="flex-1" onClick={() => setStep("prep")}>
            Previous Step
          </Button>
          <Button size="lg" className="flex-1" disabled={!allDone} onClick={() => setStep("invoice")}>
            Complete Fueling
            <CheckIcon size={20} />
          </Button>
        </>
      }
    >
      <div ref={topRef} />
      <div className="rounded-[var(--radius-card)] bg-white p-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search equipment" />

        <ul className="mt-4 divide-y divide-divider">
          {shown.map((e) => {
            const skipped = e.units.every((u) => u.skipped);
            return (
              <li key={e.id}>
                <button
                  onClick={() => {
                    setActiveId(e.id);
                    setSel(0);
                    setRunning(false);
                    setStep("unit");
                  }}
                  className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-grey-500/4"
                >
                  <Avatar
                    size={40}
                    src={e.image}
                    fallback={<TractorIcon size={20} className="text-grey-500" />}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">
                      {e.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{e.units.length}</span>
                      <StatusPill done={e.completed} skipped={skipped} />
                    </span>
                  </span>
                  <ChevronRightIcon size={18} className="shrink-0 text-grey-500" />
                </button>
              </li>
            );
          })}
          {shown.length === 0 && (
            <li className="py-10 text-center text-sm text-grey-500">No equipment found.</li>
          )}
        </ul>

        <div className="mt-5 flex divide-x divide-divider border-t border-divider pt-5">
          <div className="flex-1">
            <p className="text-xs text-text-secondary">Total Delivered</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {delivered}
              <span className="ml-1 text-sm font-semibold text-text-primary">
                / up to {requested} gal
              </span>
            </p>
          </div>
          <div className="flex-1 pl-4">
            <p className="text-xs text-text-secondary">Total Cost</p>
            <p className="mt-1 text-2xl font-bold text-primary">{money(delivered * pricePerGal)}</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
