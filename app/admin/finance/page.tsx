"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { SelectField, DateField } from "@/components/ui/FilterField";
import { StatCard, StatNumber, StatMoney } from "@/components/ui/StatCard";
import { Menu } from "@/components/ui/Menu";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  DownloadIcon,
  FilePdfIcon,
} from "@/components/ui/Icon";
import { ReceiptDetailDrawer } from "@/components/customer/ReceiptDetailDrawer";
import { PAGE_X, PAGE_Y, STICKY_HEADER, PAGE_MAX_WIDE, PAGE_FILL, PAGE_FILL_BODY } from "@/components/ui/layout";
import { money } from "@/lib/data/receipts";
import { downloadFinanceCsv, downloadFinancePdf } from "@/lib/financeExport";
import { formatLongDate, URGENCY_OPTIONS, feeLabel } from "@/lib/data/schedule";
import { customers, COUNTIES, type County } from "@/lib/data/customers";
import { FL_STATE_TAX_RATE } from "@/lib/data/pricing";
import {
  financeOrders,
  filterOrders,
  financeStats,
  LEDGER_RANGE,
  formatTaxRate,
  type FinanceOrder,
} from "@/lib/data/finance";

/* Who the order is, then the arithmetic in the order it happens — the same
   build-up as the finance sheet:

     gallons x (fuel cost + markup) = fuel bill
     + delivery fee + state tax + county tax = subtotal
     + card fee = total invoiced
     fuel bill + delivery fee - fuel cost = margin

   Wide on purpose: the point is to see every step side by side. */
const COLS = [
  "56px",            // ID
  "minmax(130px,1.4fr)", // Customer
  "0.85fr",          // County
  "1fr",             // Date
  "0.85fr",          // Gallons
  "0.8fr",           // Fuel cost /gal
  "0.75fr",          // Markup /gal
  "0.95fr",          // Fuel bill
  "0.95fr",          // Delivery fee
  "0.9fr",           // State tax
  "0.9fr",           // County tax
  "0.95fr",          // Subtotal
  "0.9fr",           // Card fee
  "1fr",             // Total invoiced
  "0.95fr",          // Fuel cost
  "0.95fr",          // Margin
  "128px",           // CTA
].join(" ");

/** What the margin on one order is made of: the markup on the fuel, plus the
    delivery fee, which carries no fuel cost of its own. */
function MarginBreakdown({
  gallons,
  markupPerGallon,
  fuelMargin,
  deliveryFee,
  tier,
  margin,
}: {
  gallons: number;
  markupPerGallon: number;
  fuelMargin: number;
  deliveryFee: number;
  tier: string;
  margin: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold">Where this margin comes from</p>

      <div className="flex justify-between gap-6">
        <span className="text-grey-400">
          Fuel markup
          <br />
          <span className="text-[11px]">
            {gallons} gal x {money(markupPerGallon)}
          </span>
        </span>
        <span className="font-semibold">{money(fuelMargin)}</span>
      </div>

      <div className="flex justify-between gap-6">
        <span className="text-grey-400">
          Delivery fee
          <br />
          <span className="text-[11px]">{tier}</span>
        </span>
        <span className="font-semibold">{money(deliveryFee)}</span>
      </div>

      <div className="mt-0.5 flex justify-between gap-6 border-t border-white/16 pt-1.5">
        <span>Margin</span>
        <span className="font-bold">{money(margin)}</span>
      </div>

      <p className="mt-0.5 text-[11px] text-grey-400">
        Sales tax and the card fee are excluded — neither is ours to keep.
      </p>
    </div>
  );
}

export default function AdminFinancePage() {
  const [customerId, setCustomerId] = useState<string>("all");
  const [county, setCounty] = useState<County | "all">("all");
  const [fromISO, setFromISO] = useState(LEDGER_RANGE.from);
  const [toISO, setToISO] = useState(LEDGER_RANGE.to);
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);
  const [receipt, setReceipt] = useState<FinanceOrder | null>(null);

  const filtered = useMemo(() => {
    const base = filterOrders(financeOrders, {
      customerId,
      county,
      fromISO,
      toISO,
      query,
    });
    return [...base].sort((a, b) =>
      sortAsc ? a.orderNo - b.orderNo : b.orderNo - a.orderNo,
    );
  }, [customerId, county, fromISO, toISO, query, sortAsc]);

  // The KPI cards describe the filtered period, not just the visible page.
  const stats = useMemo(() => financeStats(filtered), [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * pageSize;
  const rows = filtered.slice(start, start + pageSize);
  const rangeEnd = Math.min(start + pageSize, filtered.length);

  /* Exports cover the whole filtered period, not just the page on screen, and
     carry a header saying which filters produced them. */
  const exportContext = () => ({
    orders: filtered,
    stats,
    period: `${formatLongDate(fromISO)} to ${formatLongDate(toISO)}`,
    scope: [
      customerId === "all"
        ? "All customers"
        : (customers.find((c) => c.id === customerId)?.name ?? "Customer"),
      county === "all" ? "All counties" : `${county} County`,
      query.trim() ? `Search: "${query.trim()}"` : null,
    ]
      .filter(Boolean)
      .join("  •  "),
  });

  /** Any filter change puts the table back on page one. */
  function onFilter<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setPage(0);
    };
  }

  return (
    <div className={`mx-auto flex w-full ${PAGE_MAX_WIDE} ${PAGE_FILL} flex-col gap-6 ${PAGE_X} ${PAGE_Y}`}>
      <div className={STICKY_HEADER}>
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">Finance</h1>
        <p className="mt-1 text-base text-text-secondary">
          Every delivery invoiced in the period, and what it left on the table
          once fuel, running costs and sales tax are out.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-[180px]">
          <SelectField
            label="Customer"
            value={customerId}
            onChange={onFilter(setCustomerId)}
            options={[
              { value: "all", label: "All" },
              ...customers.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>
        <div className="w-full sm:w-[150px]">
          <SelectField
            label="County"
            value={county}
            onChange={onFilter<County | "all">(setCounty)}
            options={[
              { value: "all", label: "All" },
              ...COUNTIES.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
        <div className="w-[calc(50%-6px)] sm:w-[150px]">
          <DateField
            label="Date - From"
            value={fromISO}
            max={toISO}
            onChange={onFilter(setFromISO)}
          />
        </div>
        <div className="w-[calc(50%-6px)] sm:w-[150px]">
          <DateField
            label="Date - To"
            value={toISO}
            min={fromISO}
            onChange={onFilter(setToISO)}
          />
        </div>

        <div className="min-w-[200px] flex-1 self-end">
          <SearchInput
            value={query}
            onChange={onFilter(setQuery)}
            placeholder="Search for a receipt"
          />
        </div>

        <Menu
          items={[
            {
              label: "Export as CSV",
              icon: <DownloadIcon size={18} />,
              onSelect: () => downloadFinanceCsv(exportContext()),
            },
            {
              label: "Export as PDF",
              icon: <FilePdfIcon size={18} />,
              onSelect: () => downloadFinancePdf(exportContext()),
            },
          ]}
          trigger={({ toggle }) => (
            <Button size="lg" onClick={toggle} className="self-end">
              Actions
              <MoreVerticalIcon size={18} />
            </Button>
          )}
        />
      </div>

      {/* KPI cards — revenue walked down to net income, left to right. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Orders" labelLines={2}>
          <StatNumber>{stats.orders}</StatNumber>
        </StatCard>
        <StatCard label="Period Total Revenue" labelLines={2}>
          <StatMoney value={money(stats.revenue)} subtleCents />
        </StatCard>
        <StatCard label="Period Gross Income" labelLines={2}>
          <StatMoney value={money(stats.grossIncome)} subtleCents />
        </StatCard>
        <StatCard label="Period Operating Income" labelLines={2}>
          <StatMoney value={money(stats.operatingIncome)} subtleCents />
        </StatCard>
        <StatCard label="Period Tax Owned" labelLines={2}>
          <StatMoney value={money(stats.taxOwed)} subtleCents />
        </StatCard>
        <StatCard label="Period Net Income" labelLines={2}>
          <StatMoney value={money(stats.netIncome)} subtleCents />
        </StatCard>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto ${PAGE_FILL_BODY}`}>
        <div className="min-w-[1960px]">
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
            <span>County</span>
            <span>Date</span>
            <span>Gallons Delivered</span>
            <span>Fuel Cost /gal</span>
            <span>Markup /gal</span>
            <span>Fuel Bill</span>
            <span>Delivery Fee</span>
            <span>State Tax</span>
            <span>County Tax</span>
            <span>Subtotal</span>
            <span>Card Fee</span>
            <span>Total Invoiced</span>
            <span>Fuel Cost</span>
            <span>Margin</span>
            <span>See receipt</span>
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
              <span>{o.county}</span>
              <span>{formatLongDate(o.dateISO)}</span>
              <span>{o.gallons} gal</span>
              <span className="text-grey-600">{money(o.wholesalePerGallon)}</span>
              <span className="text-grey-600">{money(o.markupPerGallon)}</span>
              <span>{money(o.fuelSubtotal)}</span>
              <span className="leading-tight">
                {feeLabel(o.deliveryFee)}
                <br />
                <span className="text-grey-500">{URGENCY_OPTIONS[o.urgency].title}</span>
              </span>
              <span className="leading-tight">
                {money(o.stateTax)}
                <br />
                <span className="text-grey-500">{formatTaxRate(FL_STATE_TAX_RATE)}</span>
              </span>
              <span className="leading-tight">
                {money(o.countyTax)}
                <br />
                <span className="text-grey-500">
                  {formatTaxRate(o.taxRate - FL_STATE_TAX_RATE)}
                </span>
              </span>
              <span>{money(o.subtotal)}</span>
              <span>{money(o.convenienceFee)}</span>
              <span className="font-semibold">{money(o.total)}</span>
              <span className="text-grey-600">{money(o.cost)}</span>
              <span>
                <Tooltip
                  content={
                    <MarginBreakdown
                      gallons={o.gallons}
                      markupPerGallon={o.markupPerGallon}
                      fuelMargin={o.fuelSubtotal - o.cost}
                      deliveryFee={o.deliveryFee}
                      tier={URGENCY_OPTIONS[o.urgency].title}
                      margin={o.margin}
                    />
                  }
                >
                  <span className="block leading-tight font-semibold text-success-dark underline decoration-dotted underline-offset-4">
                    {money(o.margin)}
                    <br />
                    <span className="font-normal text-grey-500 no-underline">
                      {o.fuelSubtotal + o.deliveryFee > 0
                        ? `${Math.round((o.margin / (o.fuelSubtotal + o.deliveryFee)) * 100)}%`
                        : "—"}
                    </span>
                  </span>
                </Tooltip>
              </span>
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
