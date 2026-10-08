"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateField } from "@/components/ui/FilterField";
import {
  FilterIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@/components/ui/Icon";
import { PAGE_X, PAGE_Y, STICKY_HEADER, PAGE_MAX_WIDE, PAGE_FILL, PAGE_FILL_BODY } from "@/components/ui/layout";
import { money } from "@/lib/data/receipts";
import {
  seedRefuelings,
  computePurchase,
  newPurchaseTimestamp,
  PURCHASE_RANGE,
  type TankRefueling,
} from "@/lib/data/fillTank";

const COLS = "1.2fr 1.2fr 1fr 1fr 1.4fr 64px";

/** Filled input with a unit pinned to its right edge, as in the Figma composer. */
function UnitInput({
  placeholder,
  unit,
  value,
  onChange,
  grow = "flex-1",
}: {
  placeholder: string;
  unit: ReactNode;
  value: string;
  onChange: (v: string) => void;
  /** Share of the row this field takes — the longest placeholder needs more. */
  grow?: string;
}) {
  return (
    <div className={`relative min-w-0 ${grow}`}>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg bg-grey-500/8 pl-4 pr-14 text-sm text-text-primary outline-none placeholder:text-text-disabled focus:ring-2 focus:ring-primary/24"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-primary">
        {unit}
      </span>
    </div>
  );
}

/** A derived figure in the composer: small grey caption over a bold value. */
function Derived({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[96px]">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-lg font-bold text-text-primary">
        {value}
        <span className="text-sm font-normal text-text-secondary">/gal</span>
      </p>
    </div>
  );
}

export default function FillMyTankPage() {
  const [rows, setRows] = useState<TankRefueling[]>(seedRefuelings);
  const [deleteTarget, setDeleteTarget] = useState<TankRefueling | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);

  // Composer
  const [gallons, setGallons] = useState("");
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState("");

  // Filters (revealed by the header button)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fromISO, setFromISO] = useState(PURCHASE_RANGE.from);
  const [toISO, setToISO] = useState(PURCHASE_RANGE.to);

  const g = Number(gallons) || 0;
  const c = Number(cost) || 0;
  const m = Number(markup) || 0;
  const { costPerGallon, sellPrice } = computePurchase(g, c, m);
  const canAdd = g > 0 && c > 0;

  function addPurchase() {
    if (!canAdd) return;
    const stamp = newPurchaseTimestamp();
    setRows((rs) => [
      { id: `r${Date.now()}`, gallons: g, total: c, markup: m, costPerGallon, ...stamp },
      ...rs,
    ]);
    setGallons("");
    setCost("");
    setMarkup("");
    setPage(0);
  }

  const filtered = useMemo(
    () => rows.filter((r) => r.dateISO >= fromISO && r.dateISO <= toISO),
    [rows, fromISO, toISO],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clamped = Math.min(page, pageCount - 1);
  const start = clamped * pageSize;
  const view = filtered.slice(start, start + pageSize);
  const rangeEnd = Math.min(start + pageSize, filtered.length);

  return (
    <div className={`mx-auto flex w-full ${PAGE_MAX_WIDE} ${PAGE_FILL} flex-col gap-6 ${PAGE_X} ${PAGE_Y}`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${STICKY_HEADER}`}>
        <h1 className="flex-1 text-2xl font-bold text-text-primary sm:text-3xl">Fill My Tank</h1>
        <Button
          variant="dark"
          size="lg"
          onClick={() => setFiltersOpen((f) => !f)}
          aria-expanded={filtersOpen}
        >
          <FilterIcon size={18} />
          Filters
        </Button>
      </div>

      {filtersOpen && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[calc(50%-6px)] sm:w-[170px]">
            <DateField label="From" value={fromISO} max={toISO} onChange={setFromISO} />
          </div>
          <div className="w-[calc(50%-6px)] sm:w-[170px]">
            <DateField label="To" value={toISO} min={fromISO} onChange={setToISO} />
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="rounded-[var(--radius-card)] bg-white p-5">
        <h2 className="mb-4 text-base font-bold text-text-primary">Fill your tank now</h2>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
            <UnitInput
              placeholder="Total fuel dispensed"
              unit="gal"
              value={gallons}
              onChange={setGallons}
              grow="flex-[1.5]"
            />
            <UnitInput placeholder="Total Cost" unit="$" value={cost} onChange={setCost} />
            <UnitInput
              placeholder="Markup Price"
              unit="$/gal"
              value={markup}
              onChange={setMarkup}
              grow="flex-[1.2]"
            />
          </div>

          <div className="flex items-center gap-6">
            <Derived label="Cost" value={money(costPerGallon)} />
            <Derived label="Sell price" value={money(sellPrice)} />
          </div>

          <Button size="lg" disabled={!canAdd} onClick={addPurchase} className="xl:w-[220px]">
            Add fuel purchase
            <PlusIcon size={18} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${PAGE_FILL_BODY}`}>
        <div className="min-w-[860px]">
          <div
            className="grid items-center gap-4 px-4 py-3 text-sm font-semibold text-text-secondary"
            style={{ gridTemplateColumns: COLS }}
          >
            <span>Total Gallons Dispensed</span>
            <span>Total Amount Charged</span>
            <span>Cost Per Gallon</span>
            <span>Markup Price</span>
            <span>Transaction Date</span>
            <span />
          </div>

          {view.map((r, i) => (
            <div
              key={r.id}
              className={`grid items-center gap-4 rounded-lg px-4 py-3.5 text-sm text-text-primary ${
                i % 2 === 1 ? "bg-grey-500/8" : ""
              }`}
              style={{ gridTemplateColumns: COLS }}
            >
              <span>{r.gallons} Gallons</span>
              <span>{money(r.total)}</span>
              <span>{money(r.costPerGallon)}</span>
              <span>{money(r.markup)}</span>
              <span>{r.date}</span>
              <span className="flex justify-end">
                <button
                  aria-label={`Delete the ${r.gallons}-gallon purchase from ${r.date}`}
                  onClick={() => setDeleteTarget(r)}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-grey-500/8 text-grey-700 transition-colors hover:bg-error/8 hover:text-error"
                >
                  <TrashIcon size={18} />
                </button>
              </span>
            </div>
          ))}

          {view.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-grey-500">
              No fuel purchases in this range.
            </p>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-5 text-sm text-text-primary">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="appearance-none rounded-md bg-transparent py-1 pl-2 pr-6 outline-none"
            >
              {[5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDownIcon size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-grey-600" />
          </div>
        </div>
        <span>
          {filtered.length === 0 ? 0 : start + 1}-{rangeEnd} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            disabled={clamped === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8 disabled:opacity-40"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <button
            aria-label="Next page"
            disabled={clamped >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8 disabled:opacity-40"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) setRows((rs) => rs.filter((x) => x.id !== deleteTarget.id));
        }}
        title="Delete this fuel purchase?"
        description={
          deleteTarget
            ? `The ${deleteTarget.gallons}-gallon load from ${deleteTarget.date} will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Back"
      />
    </div>
  );
}
