"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropletIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@/components/ui/Icon";
import { FillTankModal } from "@/components/admin/FillTankModal";
import { PAGE_X, PAGE_Y, STICKY_HEADER } from "@/components/ui/layout";
import { money } from "@/lib/data/receipts";
import { seedRefuelings, fillTankKpis, type TankRefueling } from "@/lib/data/fillTank";

const COLS = "1.2fr 1fr 1fr 1.1fr 1.2fr 84px";

function KpiValue({ value, unit }: { value: string; unit?: string }) {
  return (
    <span>
      <span className="text-xl font-semibold text-primary">{value}</span>
      {unit && <span className="text-sm text-text-primary"> {unit}</span>}
    </span>
  );
}

export default function FillMyTankPage() {
  const [rows, setRows] = useState<TankRefueling[]>(seedRefuelings);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TankRefueling | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TankRefueling | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: TankRefueling) {
    setEditing(row);
    setOpen(true);
  }

  function saveRow(r: TankRefueling) {
    setRows((rs) =>
      rs.some((x) => x.id === r.id)
        ? rs.map((x) => (x.id === r.id ? r : x)) // update
        : [r, ...rs], // create
    );
    if (!editing) setPage(0);
  }

  function deleteRow(id: string) {
    setRows((rs) => rs.filter((x) => x.id !== id));
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const clamped = Math.min(page, pageCount - 1);
  const start = clamped * pageSize;
  const view = rows.slice(start, start + pageSize);
  const rangeEnd = Math.min(start + pageSize, rows.length);

  return (
    <div className={`mx-auto flex w-full max-w-[1200px] flex-col gap-6 ${PAGE_X} ${PAGE_Y}`}>
      {/* Header (sticky) */}
      <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${STICKY_HEADER}`}>
        <h1 className="flex-1 text-2xl font-bold text-text-primary sm:text-3xl">Fill My Tank</h1>
        <Button size="md" onClick={openCreate}>
          <DropletIcon size={20} />
          Fill Tank Now
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Last week price avg.">
          <KpiValue value={money(fillTankKpis.priceAvgPerGal)} unit="/gal" />
        </StatCard>
        <StatCard label="Last week total fuel cost">
          <KpiValue value={money(fillTankKpis.totalFuelCost)} />
        </StatCard>
        <StatCard label="Last week fuel avg.">
          <KpiValue value={String(fillTankKpis.fuelAvgGallons)} unit="gallons" />
        </StatCard>
        <StatCard label="Last week total fuel">
          <KpiValue value={fillTankKpis.totalFuelGallons.toLocaleString("en-US")} unit="gallons" />
        </StatCard>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          <div
            className="grid items-center gap-4 px-4 py-3 text-sm font-semibold text-text-secondary"
            style={{ gridTemplateColumns: COLS }}
          >
            <span>Total Gallons Dispensed</span>
            <span>Cost Per Gallon</span>
            <span>Fuel Type</span>
            <span>Total Amount Charged</span>
            <span>Transaction Date</span>
            <span className="text-right">Actions</span>
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
              <span>{money(r.costPerGallon)}</span>
              <span>
                <Badge tone={r.fuelType === "On-road" ? "info" : "neutral"}>
                  {r.fuelType}
                </Badge>
              </span>
              <span>{money(r.total)}</span>
              <span>{r.date}</span>
              <span className="flex items-center justify-end gap-1">
                <button
                  aria-label="Edit refueling"
                  onClick={() => openEdit(r)}
                  className="grid h-8 w-8 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8"
                >
                  <PencilIcon size={18} />
                </button>
                <button
                  aria-label="Delete refueling"
                  onClick={() => setDeleteTarget(r)}
                  className="grid h-8 w-8 place-items-center rounded-full text-error transition-colors hover:bg-error/8"
                >
                  <TrashIcon size={18} />
                </button>
              </span>
            </div>
          ))}

          {view.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-grey-500">
              No refuelings logged yet.
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
          {rows.length === 0 ? 0 : start + 1}-{rangeEnd} of {rows.length}
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

      <FillTankModal
        open={open}
        editing={editing}
        onClose={() => setOpen(false)}
        onSave={saveRow}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteRow(deleteTarget.id)}
        title="Delete this refueling?"
        description={
          deleteTarget
            ? `The ${deleteTarget.gallons}-gallon entry from ${deleteTarget.date} will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Back"
      />
    </div>
  );
}
