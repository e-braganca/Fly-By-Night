"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard, StatNumber, StatMoney } from "@/components/ui/StatCard";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from "@/components/ui/Icon";
import { ReceiptDetailDrawer } from "@/components/customer/ReceiptDetailDrawer";
import { PAGE_X, PAGE_Y, STICKY_HEADER } from "@/components/ui/layout";
import { money } from "@/lib/data/receipts";
import { formatLongDate } from "@/lib/data/schedule";
import {
  ordersInPeriod,
  financeStats,
  FINANCE_PERIODS,
  type FinancePeriod,
  type FinanceOrder,
} from "@/lib/data/finance";

const COLS = "60px 2fr 1.1fr 0.9fr 1fr 1fr 128px";

function PeriodToggle({
  value,
  onChange,
}: {
  value: FinancePeriod;
  onChange: (p: FinancePeriod) => void;
}) {
  return (
    <div className="flex shrink-0 rounded-lg bg-grey-500/8 p-1">
      {FINANCE_PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`h-9 rounded-md px-4 text-sm font-semibold transition-colors ${
            value === p.key
              ? "bg-white text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminFinancePage() {
  const [period, setPeriod] = useState<FinancePeriod>("month");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);
  const [receipt, setReceipt] = useState<FinanceOrder | null>(null);

  const orders = useMemo(() => ordersInPeriod(period), [period]);
  const stats = useMemo(() => financeStats(orders), [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace("#", "");
    const base = q
      ? orders.filter(
          (o) =>
            String(o.orderNo).includes(q) ||
            o.customerName.toLowerCase().includes(q),
        )
      : orders;
    return [...base].sort((a, b) =>
      sortAsc ? a.orderNo - b.orderNo : b.orderNo - a.orderNo,
    );
  }, [orders, query, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * pageSize;
  const rows = filtered.slice(start, start + pageSize);
  const rangeEnd = Math.min(start + pageSize, filtered.length);

  function resetPaging() {
    setPage(0);
  }

  return (
    <div className={`mx-auto flex w-full max-w-[1200px] flex-col gap-6 ${PAGE_X} ${PAGE_Y}`}>
      <div className={STICKY_HEADER}>
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Finance</h1>
      </div>

      {/* Search + period toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              resetPaging();
            }}
            placeholder="Search for a receipt"
          />
        </div>
        <PeriodToggle
          value={period}
          onChange={(p) => {
            setPeriod(p);
            resetPaging();
          }}
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Orders">
          <StatNumber>{stats.orders}</StatNumber>
        </StatCard>
        <StatCard label="Total Gross Income">
          <StatMoney value={money(stats.grossIncome)} />
        </StatCard>
        <StatCard label="Fuel Profit">
          <StatMoney value={money(stats.fuelProfit)} />
        </StatCard>
        <StatCard label="Delivery Fee Profit">
          <StatMoney value={money(stats.deliveryFeeProfit)} />
        </StatCard>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Header */}
          <div
            className="grid items-center gap-4 px-4 py-3 text-sm font-semibold text-text-secondary"
            style={{ gridTemplateColumns: COLS }}
          >
            <button
              onClick={() => setSortAsc((s) => !s)}
              className="flex items-center gap-1 text-left"
            >
              ID
              <ChevronDownIcon
                size={16}
                className={`transition-transform ${sortAsc ? "rotate-180" : ""}`}
              />
            </button>
            <span>Customer</span>
            <span>Total Gallons Delivery</span>
            <span>Cost Per Gallon</span>
            <span>Total Invoiced</span>
            <span>Date</span>
            <span />
          </div>

          {/* Rows */}
          {rows.map((o, i) => (
            <div
              key={o.orderNo}
              className={`grid items-center gap-4 rounded-lg px-4 py-3.5 text-sm text-text-primary ${
                i % 2 === 1 ? "bg-grey-500/8" : ""
              }`}
              style={{ gridTemplateColumns: COLS }}
            >
              <span className="font-semibold text-info">#{o.orderNo}</span>
              <span className="truncate">{o.customerName}</span>
              <span>{o.gallons} Gallons</span>
              <span>{money(o.costPerGallon)}</span>
              <span>{money(o.total)}</span>
              <span>{formatLongDate(o.dateISO)}</span>
              <span>
                <Button size="sm" onClick={() => setReceipt(o)}>
                  See Receipt
                  <ChevronRightIcon size={16} />
                </Button>
              </span>
            </div>
          ))}

          {rows.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-grey-500">
              No receipts found.
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
                resetPaging();
              }}
              className="appearance-none rounded-md bg-transparent py-1 pl-2 pr-6 outline-none"
            >
              {[5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              size={16}
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-grey-600"
            />
          </div>
        </div>
        <span>
          {filtered.length === 0 ? 0 : start + 1}-{rangeEnd} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            disabled={clampedPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8 disabled:opacity-40"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <button
            aria-label="Next page"
            disabled={clampedPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-grey-700 transition-colors hover:bg-grey-500/8 disabled:opacity-40"
          >
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      <ReceiptDetailDrawer
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        receipt={receipt?.receipt ?? null}
      />
    </div>
  );
}
