"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  CalendarIcon,
  TrashIcon,
  EyeIcon,
  FilePdfIcon,
} from "@/components/ui/Icon";
import type { ScheduledDelivery } from "@/lib/data/types";
import { URGENCY_OPTIONS, feeLabel, canModifyDelivery } from "@/lib/data/schedule";
import { buildReceipt, money } from "@/lib/data/receipts";

type Tab = "summary" | "invoice";

export function ScheduleDetailModal({
  open,
  onClose,
  delivery,
  onReschedule,
  onCancel,
}: {
  open: boolean;
  onClose: () => void;
  delivery: ScheduledDelivery | null;
  onReschedule: (d: ScheduledDelivery) => void;
  onCancel: (d: ScheduledDelivery) => void;
}) {
  const [tab, setTab] = useState<Tab>("summary");
  if (!delivery) return null;
  const urgency = URGENCY_OPTIONS[delivery.urgency];
  const canEdit = canModifyDelivery(delivery);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Schedule Details"
      headerBorder
      headerActions={
        canEdit ? (
          <div className="flex items-center gap-2">
            <Button variant="soft" size="sm" onClick={() => onReschedule(delivery)}>
              <CalendarIcon size={18} />
              Reschedule Service
            </Button>
            <Button
              variant="errorSoft"
              size="sm"
              onClick={() => onCancel(delivery)}
            >
              <TrashIcon size={18} />
              Cancel
            </Button>
          </div>
        ) : null
      }
    >
      {/* Tabs */}
      <div className="flex gap-6 border-b border-divider px-6">
        {(["summary", "invoice"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "border-grey-900 text-text-primary"
                : "border-transparent text-text-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-6 py-6">
        {tab === "summary" ? (
          <div className="flex flex-col gap-8">
            {/* Address */}
            <div>
              <p className="text-sm text-text-primary">Delivery address</p>
              <p className="text-base font-semibold text-text-primary">
                {delivery.address}.
              </p>
            </div>

            {/* Urgency */}
            <div>
              <p className="mb-3 text-base font-semibold text-text-primary">
                Delivery urgency
              </p>
              <div className="flex items-center gap-3 rounded-2xl bg-grey-200 p-4 shadow-[var(--shadow-card)]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-primary">
                  <CalendarIcon size={24} />
                </span>
                <div className="flex-1">
                  <p className="font-sans text-[17px] font-bold text-text-primary">
                    {urgency.title}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {urgency.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">fee</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {feeLabel(urgency.fee)}
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment table */}
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-2 pb-1 text-sm text-black/60">
                <span>Equipment</span>
                <span className="w-12 text-center">Units</span>
                <span className="w-24 text-right">Gallons max.</span>
                <span className="w-20 text-right">Fuel Type</span>
              </div>
              {delivery.equipment.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-text-primary ${
                    i % 2 === 1 ? "bg-black/[0.04]" : ""
                  }`}
                >
                  <span className="truncate">{row.name}</span>
                  <span className="w-12 text-center">{row.units}</span>
                  <span className="w-24 text-right">{row.gallonsMax} gal. max.</span>
                  <span className="w-20 text-right">{row.fuelType}</span>
                </div>
              ))}
            </div>

            {/* Documents */}
            {delivery.documents?.map((doc, i) => (
              <div key={i}>
                <p className="mb-3 text-[17px] font-semibold text-text-primary">
                  {doc.label}
                </p>
                <div className="flex items-center gap-3">
                  <FilePdfIcon size={32} className="text-error" />
                  <span className="flex-1 truncate text-base text-text-primary">
                    {doc.filename}
                  </span>
                  <Button variant="soft" size="md">
                    <EyeIcon size={18} />
                    Open PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <InvoiceTab delivery={delivery} />
        )}
      </div>
    </Drawer>
  );
}

function InvoiceTab({ delivery }: { delivery: ScheduledDelivery }) {
  if (delivery.status !== "completed") {
    return (
      <p className="rounded-lg border border-primary/16 bg-primary/8 px-4 py-3 text-sm text-primary">
        The invoice will be available once the service is completed.
      </p>
    );
  }

  // Same breakdown as the Receipts page — single source of truth.
  const receipt = buildReceipt(delivery, "paid");

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-secondary">
        Invoice <span className="font-semibold text-text-primary">#{receipt.orderNo}</span>
      </p>
      {receipt.lineItems.map((item, i) => (
        <div key={i} className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">{item.label}</p>
            {item.note && (
              <p className="text-xs text-text-disabled">{item.note}</p>
            )}
          </div>
          <span className="text-sm font-semibold text-text-primary">
            {item.free ? "Free" : money(item.amount)}
          </span>
        </div>
      ))}
      <div className="flex items-baseline justify-between border-t border-divider pt-4">
        <span className="text-base font-semibold text-text-primary">Total</span>
        <span className="text-2xl font-bold text-primary">{money(receipt.total)}</span>
      </div>
    </div>
  );
}
