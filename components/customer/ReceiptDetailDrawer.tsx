"use client";

import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { DownloadIcon } from "@/components/ui/Icon";
import type { Receipt, ReceiptParty } from "@/lib/data/types";
import { money } from "@/lib/data/receipts";
import { formatLongDate } from "@/lib/data/schedule";
import { downloadReceiptPdf } from "@/lib/receiptPdf";

function Party({ title, party }: { title: string; party: ReceiptParty }) {
  return (
    <div className="flex-1">
      <p className="font-sans text-sm font-bold text-text-primary">{title}</p>
      {title !== party.name && (
        <p className="mt-1 text-xs text-text-secondary">{party.name}</p>
      )}
      {party.lines.map((l, i) => (
        <p key={i} className={`text-xs text-text-secondary ${i === 0 && title === party.name ? "mt-1" : ""}`}>
          {l}
        </p>
      ))}
      <p className="mt-1 text-xs text-text-secondary">{party.email}</p>
    </div>
  );
}

function MetaRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex gap-4 text-xs">
      <span className="w-28 shrink-0 font-sans font-bold text-text-primary">
        {label}
      </span>
      <span className={bold ? "font-sans font-bold text-text-primary" : "text-text-secondary"}>
        {value}
      </span>
    </div>
  );
}

export function ReceiptDetailDrawer({
  open,
  onClose,
  receipt,
}: {
  open: boolean;
  onClose: () => void;
  receipt: Receipt | null;
}) {
  return (
    <Drawer
      open={open && Boolean(receipt)}
      onClose={onClose}
      title="Receipt Detail"
      headerBorder
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => receipt && downloadReceiptPdf(receipt)}
        >
          <DownloadIcon size={20} />
          Download as PDF
        </Button>
      }
    >
      {receipt && (
        <>
          {/* Summary */}
          <div className="flex flex-col gap-6 border-b border-divider px-6 py-6">
            <div className="flex flex-col gap-1.5">
              <MetaRow label="Invoice number" value={`#${receipt.orderNo}`} bold />
              <MetaRow label="Date of issue" value={formatLongDate(receipt.dateISO)} />
              <MetaRow label="Date due" value={formatLongDate(receipt.dateISO)} />
            </div>
            <div className="flex gap-5">
              <Party title={receipt.seller.name} party={receipt.seller} />
              <Party title="Bill to" party={receipt.billTo} />
            </div>
          </div>

          {/* Line items */}
          <div className="flex flex-col gap-6 px-6 py-6">
            {receipt.lineItems.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-text-primary">
                    {item.label}
                  </span>
                  <span className="text-base font-semibold text-text-primary">
                    {item.free ? "Free" : money(item.amount)}
                  </span>
                </div>
                {item.note && (
                  <p className="mt-0.5 text-sm text-text-disabled">{item.note}</p>
                )}
              </div>
            ))}

            <div className="flex items-baseline justify-between pt-2">
              <span className="text-[17px] font-semibold text-text-primary">Total</span>
              <span className="text-[32px] font-bold text-text-primary">
                {money(receipt.total)}
              </span>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
