"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, ReceiptIcon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { ReceiptDetailDrawer } from "./ReceiptDetailDrawer";
import { useScheduledDeliveries, useBusiness } from "@/lib/store";
import { buildReceipt } from "@/lib/data/receipts";
import { formatLongDate } from "@/lib/data/schedule";
import type { Receipt } from "@/lib/data/types";

const DASHBOARD_LIMIT = 5;

export function DeliveriesCard() {
  const deliveries = useScheduledDeliveries();
  const business = useBusiness();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const completed = deliveries
    .filter((d) => d.status === "completed" && d.orderNo)
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .slice(0, DASHBOARD_LIMIT);

  return (
    <section className="flex flex-1 flex-col gap-3">
      <SectionHeader
        title="Fuel Deliveries History"
        action={
          <Link href="/customer/receipts">
            <Button variant="dark" size="icon" aria-label="View all receipts">
              <ArrowRightIcon size={18} />
            </Button>
          </Link>
        }
      />

      <div className="rounded-[var(--radius-card)] bg-white px-4 py-2">
        <ul>
          {completed.map((d, i) => {
            const last = i === completed.length - 1;
            const gallons = d.gallonsDelivered ?? d.gallonsScheduled;
            return (
              <li key={d.id} className="flex gap-3">
                {/* timeline rail */}
                <div className="flex flex-col items-center pt-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  {!last && <span className="w-px flex-1 bg-divider" />}
                </div>

                {/* content */}
                <div className="flex-1 pb-2 pt-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatLongDate(d.dateISO)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-primary">
                        {gallons} Gallons
                      </span>
                      <Badge>{d.price}</Badge>
                    </div>
                  </div>

                  <p className="pb-5 text-xs text-grey-500">{d.address}</p>

                  <Button
                    variant="dark"
                    size="sm"
                    onClick={() => setReceipt(buildReceipt(d, "paid", business.businessName))}
                  >
                    <ReceiptIcon size={18} />
                    Service Receipt
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="px-0 pb-2 pt-3">
          <Link href="/customer/receipts" className="block">
            <Button variant="soft" size="md" className="w-full">
              See All
              <ArrowRightIcon size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <ReceiptDetailDrawer
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        receipt={receipt}
      />
    </section>
  );
}
