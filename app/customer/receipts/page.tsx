"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard, StatNumber, StatMoney } from "@/components/ui/StatCard";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from "@/components/ui/Icon";
import { PageContainer } from "@/components/customer/PageContainer";
import { PageHeader } from "@/components/customer/PageHeader";
import { ReceiptDetailDrawer } from "@/components/customer/ReceiptDetailDrawer";
import { useScheduledDeliveries, useBusiness } from "@/lib/store";
import {
  receiptsFromDeliveries,
  money,
  RECEIPT_STATUS_LABEL,
} from "@/lib/data/receipts";
import { formatLongDate, parseISO, REFERENCE_TODAY } from "@/lib/data/schedule";
import type { Receipt } from "@/lib/data/types";

const COLS = "1.3fr 1.2fr 1fr 1fr 1fr auto auto";

export default function ReceiptsPage() {
  const deliveries = useScheduledDeliveries();
  const business = useBusiness();
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Receipt | null>(null);

  const receipts = useMemo(
    () => receiptsFromDeliveries(deliveries, business.businessName),
    [deliveries, business.businessName],
  );

  const refMonth = parseISO(REFERENCE_TODAY);
  const stats = useMemo(() => {
    const thisMonth = receipts.filter((r) => {
      const { y, m } = parseISO(r.dateISO);
      return y === refMonth.y && m === refMonth.m;
    });
    const spent = thisMonth.reduce((s, r) => s + r.total, 0);
    const avg =
      receipts.length > 0
        ? receipts.reduce((s, r) => s + r.costPerGallon, 0) / receipts.length
        : 0;
    return { orders: thisMonth.length, spent, avg };
  }, [receipts, refMonth.y, refMonth.m]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace("#", "");
    return q
      ? receipts.filter((r) => String(r.orderNo).includes(q))
      : receipts;
  }, [receipts, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const start = clampedPage * pageSize;
  const rows = filtered.slice(start, start + pageSize);
  const rangeEnd = Math.min(start + pageSize, filtered.length);

  return (
    <PageContainer maxWidth={1200}>
      <PageHeader title="Receipts" />

      {/* Search */}
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setPage(0);
        }}
        placeholder="Search by order ID"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Total spent in Refueling this month"
          className="col-span-2 md:col-span-1"
        >
          <StatMoney value={money(stats.spent)} />
        </StatCard>
        <StatCard label="Orders This month">
          <StatNumber>{stats.orders}</StatNumber>
        </StatCard>
        <StatCard label="Average Fuel Cost per gallon">
          <StatMoney value={money(stats.avg)} />
        </StatCard>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          {/* Header */}
          <div
            className="grid items-center gap-4 px-4 py-3 text-sm font-semibold text-text-secondary"
            style={{ gridTemplateColumns: COLS }}
          >
            <span>Order ID</span>
            <span>Total Gallons Delivery</span>
            <span>Cost Per Gallon</span>
            <span>Total Invoiced</span>
            <span>Date</span>
            <span className="w-[115px]">Status</span>
            <span className="w-[120px]" />
          </div>

          {/* Rows */}
          {rows.map((r, i) => (
            <div
              key={r.orderNo}
              className={`grid items-center gap-4 rounded-lg px-4 py-3.5 text-sm text-text-primary ${
                i % 2 === 1 ? "bg-grey-500/8" : ""
              }`}
              style={{ gridTemplateColumns: COLS }}
            >
              <span className="font-semibold text-info">#{r.orderNo}</span>
              <span>{r.totalGallons} Gallons</span>
              <span>{money(r.costPerGallon)}</span>
              <span>{money(r.total)}</span>
              <span>{formatLongDate(r.dateISO)}</span>
              <span className="w-[115px]">
                <Badge tone={r.status === "paid" ? "success" : "warning"}>
                  {RECEIPT_STATUS_LABEL[r.status]}
                </Badge>
              </span>
              <span className="w-[120px]">
                <Button size="sm" onClick={() => setSelected(r)}>
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
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        receipt={selected}
      />
    </PageContainer>
  );
}
