"use client";

import { jsPDF } from "jspdf";
import type { Receipt } from "./data/types";
import { money } from "./data/receipts";
import { formatLongDate } from "./data/schedule";

/** Generate and download a PDF for a receipt. */
export function downloadReceiptPdf(receipt: Receipt) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const left = 48;
  const right = pageW - 48;
  let y = 64;

  const ink = [33, 43, 54] as const; // #212B36
  const grey = [99, 115, 129] as const; // #637381
  const blue = [57, 96, 213] as const; // #3960D5

  // Brand header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...blue);
  doc.text("Fly by Night Fuel", left, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...grey);
  doc.text("Receipt", right, y, { align: "right" });

  y += 30;
  doc.setDrawColor(223, 227, 232);
  doc.line(left, y, right, y);

  // Meta
  y += 28;
  doc.setFontSize(11);
  const meta: [string, string][] = [
    ["Invoice number", `#${receipt.orderNo}`],
    ["Date of issue", formatLongDate(receipt.dateISO)],
    ["Date due", formatLongDate(receipt.dateISO)],
  ];
  for (const [label, value] of meta) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ink);
    doc.text(label, left, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grey);
    doc.text(value, left + 110, y);
    y += 18;
  }

  // Parties
  y += 16;
  const colR = left + (right - left) / 2;
  const partyBlock = (x: number, title: string, name: string, lines: string[], email: string) => {
    let py = y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...ink);
    doc.text(title, x, py);
    py += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grey);
    if (name !== title) {
      doc.text(name, x, py);
      py += 14;
    }
    for (const l of lines) {
      doc.text(l, x, py);
      py += 14;
    }
    doc.text(email, x, py);
  };
  partyBlock(left, receipt.seller.name, receipt.seller.name, receipt.seller.lines, receipt.seller.email);
  partyBlock(colR, "Bill to", receipt.billTo.name, receipt.billTo.lines, receipt.billTo.email);

  y += 120;
  doc.setDrawColor(223, 227, 232);
  doc.line(left, y, right, y);

  // Line items
  y += 30;
  for (const item of receipt.lineItems) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text(item.label, left, y);
    doc.text(item.free ? "Free" : money(item.amount), right, y, { align: "right" });
    if (item.note) {
      y += 15;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...grey);
      doc.text(item.note, left, y);
    }
    y += 26;
  }

  // Total
  y += 6;
  doc.setDrawColor(223, 227, 232);
  doc.line(left, y, right, y);
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ink);
  doc.text("Total", left, y);
  doc.setFontSize(20);
  doc.setTextColor(...blue);
  doc.text(money(receipt.total), right, y, { align: "right" });

  doc.save(`receipt-${receipt.orderNo}.pdf`);
}
