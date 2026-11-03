"use client";

import { jsPDF } from "jspdf";
import { formatLongDate, URGENCY_OPTIONS } from "./data/schedule";
import { money } from "./data/receipts";
import type { FinanceOrder, financeStats } from "./data/finance";

type Stats = ReturnType<typeof financeStats>;

type ExportContext = {
  orders: FinanceOrder[];
  stats: Stats;
  /** The active filters as label/value pairs, printed in the report header. */
  filters: [string, string][];
};

const COLUMNS = [
  "ID",
  "Customer",
  "County",
  "Date",
  "Gallons Delivered",
  "Fuel Cost /gal",
  "Markup /gal",
  "Fuel Bill",
  "Delivery Tier",
  "Delivery Fee",
  "Card Fee",
  "Subtotal",
  "State Tax",
  "County Tax",
  "Total Invoiced",
  "Fuel Cost",
  "Margin",
  "Status",
] as const;

function rowValues(o: FinanceOrder): string[] {
  return [
    `#${o.orderNo}`,
    o.customerName,
    o.county,
    formatLongDate(o.dateISO),
    String(o.gallons),
    o.wholesalePerGallon.toFixed(2),
    o.markupPerGallon.toFixed(2),
    o.fuelSubtotal.toFixed(2),
    URGENCY_OPTIONS[o.urgency].title,
    o.deliveryFee.toFixed(2),
    o.convenienceFee.toFixed(2),
    o.subtotal.toFixed(2),
    o.stateTax.toFixed(2),
    o.countyTax.toFixed(2),
    o.total.toFixed(2),
    o.cost.toFixed(2),
    o.margin.toFixed(2),
    o.status === "paid" ? "Paid" : "Not paid",
  ];
}

/** The summary cards, shared by both formats so the two exports — and the
    page's KPI cards — can never disagree. */
function summaryCards(stats: Stats): { label: string; value: number; note?: string }[] {
  return [
    { label: "Total Revenue", value: stats.revenue },
    { label: "Total Fuel Cost", value: stats.fuelCost },
    { label: "Total Stripe Fees", value: stats.stripeFees },
    {
      label: "Total Taxes",
      value: stats.taxes,
      note: `State Tax ${money(stats.stateTax)}     County Tax ${money(stats.countyTax)}`,
    },
    { label: "Total Profit", value: stats.profit },
  ];
}

/** "November 3, 2026, 3:05 PM EST" — when the report was produced, on Florida time. */
function generatedAt(now = new Date()): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.month} ${parts.day}, ${parts.year}, ${parts.hour}:${parts.minute} ${parts.dayPeriod} ${parts.timeZoneName}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has picked the URL up.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* A field is quoted when it contains a comma, quote or newline; inner quotes are
   doubled. Keeps customer names with commas from splitting a row. */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function downloadFinanceCsv({ orders, stats, filters }: ExportContext) {
  const lines: string[][] = [
    ["Fly by Night Fuel - Finance report"],
    ["Generated", generatedAt()],
    ...filters,
    [],
    ["Summary"],
    ...summaryCards(stats).flatMap((c) => [
      [c.label, c.value.toFixed(2)],
      ...(c.label === "Total Taxes"
        ? [
            ["State Tax", stats.stateTax.toFixed(2)],
            ["County Tax", stats.countyTax.toFixed(2)],
          ]
        : []),
    ]),
    [],
    [...COLUMNS],
    ...orders.map(rowValues),
  ];

  // Excel opens UTF-8 CSVs correctly only with a byte-order mark.
  const body = "﻿" + lines.map((r) => r.map(csvCell).join(",")).join("\r\n");
  triggerDownload(new Blob([body], { type: "text/csv;charset=utf-8" }), fileName("csv"));
}

export function downloadFinancePdf({ orders, stats, filters }: ExportContext) {
  // A3 landscape: eighteen columns will not fit an A4 without shrinking the type
  // past readable. The sheet still prints fine scaled down to A4.
  const doc = new jsPDF({ unit: "pt", format: "a3", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 40;
  const right = pageW - 40;

  type RGB = readonly [number, number, number];
  const ink: RGB = [33, 43, 54]; // #212B36
  const grey: RGB = [99, 115, 129]; // grey-600
  const faint: RGB = [145, 158, 171]; // grey-500
  const blue: RGB = [57, 96, 213]; // primary
  const onBlue: RGB = [213, 221, 246]; // primary-lighter, for captions on blue
  const white: RGB = [255, 255, 255];
  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  // Column x positions and alignment, tuned to the widest realistic value.
  const cols: { w: number; align: "left" | "right" }[] = [
    { w: 40, align: "left" },   // ID
    { w: 96, align: "left" },   // Customer
    { w: 60, align: "left" },   // County
    { w: 74, align: "left" },   // Date
    { w: 58, align: "right" },  // Gallons
    { w: 56, align: "right" },  // Fuel cost /gal
    { w: 52, align: "right" },  // Markup /gal
    { w: 64, align: "right" },  // Fuel bill
    { w: 70, align: "left" },   // Delivery tier
    { w: 54, align: "right" },  // Delivery fee
    { w: 56, align: "right" },  // Card fee
    { w: 68, align: "right" },  // Subtotal
    { w: 58, align: "right" },  // State tax
    { w: 56, align: "right" },  // County tax
    { w: 72, align: "right" },  // Invoiced
    { w: 64, align: "right" },  // Fuel cost
    { w: 62, align: "right" },  // Margin
    { w: 50, align: "left" },   // Status
  ];
  const xs: number[] = [];
  let cursor = left;
  for (const c of cols) {
    xs.push(cursor);
    cursor += c.w;
  }
  const cellX = (i: number) => (cols[i].align === "right" ? xs[i] + cols[i].w - 8 : xs[i]);

  let y = 0;

  /** Title, generation time and the filters behind the numbers. */
  function reportHeader() {
    y = 48;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(grey);
    doc.text("Fly by Night Fuel", left, y);

    y += 28;
    doc.setFontSize(22);
    setColor(ink);
    doc.text("Finance report", left, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(grey);
    doc.text(`Generated ${generatedAt()}`, right, y, { align: "right" });

    // "Customer: All   County: All   Date from: …" — grey label, bold value.
    y += 24;
    let x = left;
    for (const [label, value] of filters) {
      doc.setFont("helvetica", "normal");
      setColor(grey);
      doc.text(`${label}: `, x, y);
      x += doc.getTextWidth(`${label}: `);
      doc.setFont("helvetica", "bold");
      setColor(ink);
      doc.text(value, x, y);
      x += doc.getTextWidth(value) + 22;
    }
  }

  /** The five summary cards; the last, Total Profit, filled blue. */
  function summary() {
    const gap = 14;
    const h = 70;
    const top = y + 18;
    const cards = summaryCards(stats);
    const w = (right - left - gap * (cards.length - 1)) / cards.length;
    cards.forEach((c, i) => {
      const x = left + i * (w + gap);
      const highlight = i === cards.length - 1;
      if (highlight) {
        doc.setFillColor(blue[0], blue[1], blue[2]);
        doc.roundedRect(x, top, w, h, 8, 8, "F");
      } else {
        doc.setDrawColor(223, 227, 232);
        doc.setLineWidth(1);
        doc.roundedRect(x, top, w, h, 8, 8, "S");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(highlight ? onBlue : faint);
      doc.text(c.label, x + 14, top + 20);

      doc.setFontSize(18);
      setColor(highlight ? white : blue);
      doc.text(money(c.value), x + 14, top + 44);

      if (c.note) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        setColor(highlight ? onBlue : grey);
        doc.text(c.note, x + 14, top + 60);
      }
    });
    y = top + h;
  }

  /** Column headings; repeated at the top of every page the table runs onto. */
  function tableHeader() {
    y += 28;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(ink);
    COLUMNS.forEach((label, i) => {
      doc.text(label, cellX(i), y, { align: cols[i].align });
    });
    y += 6;
    doc.setDrawColor(223, 227, 232);
    doc.setLineWidth(0.5);
    doc.line(left, y, right, y);
    y += 14;
  }

  /** Later pages keep a slim header so a loose sheet still says what it is. */
  function continuationHeader() {
    y = 48;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(grey);
    doc.text("Fly by Night Fuel  •  Finance report", left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(filters.map(([l, v]) => `${l}: ${v}`).join("   "), right, y, { align: "right" });
  }

  reportHeader();
  summary();
  tableHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const o of orders) {
    if (y > pageH - 50) {
      doc.addPage();
      continuationHeader();
      tableHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }
    const values = rowValues(o);
    values.forEach((v, i) => {
      setColor(i === 0 ? blue : ink);
      // Customer names can overrun their column — clip rather than overlap.
      const text =
        cols[i].align === "left" && i > 0
          ? (doc.splitTextToSize(v, cols[i].w - 6)[0] as string)
          : v;
      doc.text(text, cellX(i), y, { align: cols[i].align });
    });
    y += 16;
  }

  doc.save(fileName("pdf"));
}

function fileName(ext: string): string {
  return `fly-by-night-finance.${ext}`;
}
