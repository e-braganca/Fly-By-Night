"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { XCircleIcon, SwapIcon } from "@/components/ui/Icon";
import type { AdminDelivery } from "@/lib/data/admin";

export function EmptySlot() {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed border-grey-500/30 bg-white/40">
      <p className="text-lg font-medium text-text-disabled">Empty delivery slot</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminDelivery["status"] }) {
  if (status === "Completed") return <Badge tone="success">Completed</Badge>;
  if (status === "Next")
    return (
      <Badge tone="primary" className="!bg-primary !text-white">
        Next
      </Badge>
    );
  return <Badge>Scheduled</Badge>;
}

export function AdminDeliveryCard({
  delivery,
  onCancel,
  onMakeNext,
}: {
  delivery: AdminDelivery;
  onCancel?: (d: AdminDelivery) => void;
  onMakeNext?: (d: AdminDelivery) => void;
}) {
  const completed = delivery.status === "Completed";
  const chipTone = completed ? "primary" : "neutral";

  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-white px-4 pb-4 pt-3">
      {/* Address */}
      <div>
        <p className="text-xl font-semibold leading-tight text-text-primary">
          {delivery.street}
        </p>
        <p className="text-xl leading-tight text-text-primary">{delivery.city}</p>
      </div>

      {/* Chips + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Badge tone={chipTone}>{delivery.gallons}</Badge>
          <Badge tone={chipTone}>{delivery.units} Units</Badge>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="soft"
          size="md"
          className="flex-1"
          disabled={completed}
          onClick={() => onCancel?.(delivery)}
        >
          <XCircleIcon size={20} />
          Cancel
        </Button>
        {delivery.status === "Scheduled" && (
          <Button
            size="md"
            className="flex-1"
            onClick={() => onMakeNext?.(delivery)}
          >
            <SwapIcon size={20} />
            Make Next
          </Button>
        )}
      </div>
    </div>
  );
}
