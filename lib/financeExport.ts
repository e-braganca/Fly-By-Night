"use client";

import { jsPDF } from "jspdf";
import { formatLongDate, URGENCY_OPTIONS } from "./data/schedule";
import type { FinanceOrder, financeStats } from "./data/finance";

type Stats = ReturnType<typeof financeStats>;

type ExportContext = {
  orders: FinanceOrder[];
  stats: Stats;
  /** Human-readable description of the active filters, for the file header. */
  period: string;
  scope: string;
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
  "State Tax",
  "County Tax",
  "Subtotal",
  "Card Fee",
  "Total Invoiced",
  "Fuel Cost",
  "Margin",
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
    o.stateTax.toFixed(2),
    o.countyTax.toFixed(2),
    o.subtotal.toFixed(2),
    o.convenienceFee.toFixed(2),
    o.total.toFixed(2),
    o.cost.toFixed(2),
    o.margin.toFixed(2),
  ];
}

/** Summary rows shared by both formats, so the two exports can never disagree. */
function summaryRows(stats: Stats): [string, string][] {
  return [
    ["Total orders", String(stats.orders)],
    ["Total gallons", String(stats.gallons)],
    ["Delivery fees collected", stats.deliveryFees.toFixed(2)],
    ["Convenience fees collected", stats.convenienceFees.toFixed(2)],
    ["Margin (fuel bill + fees, less fuel cost)", stats.margin.toFixed(2)],
    ["Total revenue (excl. sales tax)", stats.revenue.toFixed(2)],
    ["Fuel cost", stats.cost.toFixed(2)],
    ["Gross income", stats.grossIncome.toFixed(2)],
    ["Operating cost", stats.operatingCost.toFixed(2)],
    ["Operating income", stats.operatingIncome.toFixed(2)],
    ["Sales tax owed", stats.taxOwed.toFixed(2)],
    ["Income tax provision", stats.incomeTax.toFixed(2)],
    ["Net income", stats.netIncome.toFixed(2)],
    ["Total invoiced (revenue + sales tax)", stats.invoiced.toFixed(2)],
  ];
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

export function downloadFinanceCsv({ orders, stats, period, scope }: ExportContext) {
  const lines: string[][] = [
    ["Fly by Night Fuel - Finance"],
    ["Period", period],
    ["Scope", scope],
    [],
    [...COLUMNS],
    ...orders.map(rowValues),
    [],
    ["Summary"],
    ...summaryRows(stats),
  ];

  // Excel opens UTF-8 CSVs correctly only with a byte-order mark.
  const body = "﻿" + lines.map((r) => r.map(csvCell).join(",")).join("\r\n");
  triggerDownload(new Blob([body], { type: "text/csv;charset=utf-8" }), fileName("csv"));
}

export function downloadFinancePdf({ orders, stats, period, scope }: ExportContext) {
  // A3 landscape: fourteen columns will not fit an A4 without shrinking the type
  // past readable. The sheet still prints fine scaled down to A4.
  const doc = new jsPDF({ unit: "pt", format: "a3", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const left = 40;
  const right = pageW - 40;

  type RGB = readonly [number, number, number];
  const ink: RGB = [33, 43, 54];
  const grey: RGB = [99, 115, 129];
  const blue: RGB = [57, 96, 213];
  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  // Column x positions and alignment, tuned to the widest realistic value.
  const cols: { w: number; align: "left" | "right" }[] = [
    { w: 40, align: "left" },   // ID
    { w: 112, align: "left" },  // Customer
    { w: 64, align: "left" },   // County
    { w: 78, align: "left" },   // Date
    { w: 58, align: "right" },  // Gallons
    { w: 56, align: "right" },  // Fuel cost /gal
    { w: 52, align: "right" },  // Markup /gal
    { w: 68, align: "right" },  // Fuel bill
    { w: 76, align: "left" },   // Delivery tier
    { w: 54, align: "right" },  // Delivery fee
    { w: 58, align: "right" },  // State tax
    { w: 56, align: "right" },  // County tax
    { w: 72, align: "right" },  // Subtotal
    { w: 56, align: "right" },  // Card fee
    { w: 76, align: "right" },  // Invoiced
    { w: 66, align: "right" },  // Fuel cost
    { w: 62, align: "right" },  // Margin
  ];
  const xs: number[] = [];
  let cursor = left;
  for (const c of cols) {
    xs.push(cursor);
    cursor += c.w;
  }
  const cellX = (i: number) => (cols[i].align === "right" ? xs[i] + cols[i].w - 8 : xs[i]);

  let y = 0;

  function header() {
    y = 52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    setColor(blue);
    doc.text("Fly by Night Fuel", left, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(grey);
    doc.text("Finance", right, y, { align: "right" });

    y += 16;
    doc.setFontSize(9);
    doc.text(`${period}  •  ${scope}`, left, y);

    y += 14;
    doc.setDrawColor(223, 227, 232);
    doc.line(left, y, right, y);

    // Column headings
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setColor(ink);
    COLUMNS.forEach((label, i) => {
      doc.text(label, cellX(i), y, { align: cols[i].align });
    });
    y += 6;
    doc.setDrawColor(223, 227, 232);
    doc.line(left, y, right, y);
    y += 14;
  }

  header();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const o of orders) {
    if (y > pageH - 70) {
      doc.addPage();
      header();
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

  // Summary block
  if (y > pageH - 180) {
    doc.addPage();
    header();
  }
  y += 10;
  doc.setDrawColor(223, 227, 232);
  doc.line(left, y, right, y);
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(ink);
  doc.text("Summary", left, y);
  y += 16;

  doc.setFontSize(9);
  for (const [label, value] of summaryRows(stats)) {
    const isTotal = label.startsWith("Net income");
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    setColor(isTotal ? ink : grey);
    doc.text(label, left, y);
    setColor(ink);
    doc.text(value, left + 260, y, { align: "right" });
    y += 14;
  }

  doc.save(fileName("pdf"));
}

function fileName(ext: string): string {
  return `fly-by-night-finance.${ext}`;
}
