"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  EyeIcon,
  CalendarIcon,
  TrashIcon,
} from "@/components/ui/Icon";
import type { ScheduledDelivery } from "@/lib/data/types";
import {
  formatLongDate,
  groupOf,
  canModifyDelivery,
  GROUP_LABELS,
  type ScheduleGroup,
} from "@/lib/data/schedule";

const ORDER: ScheduleGroup[] = ["upcoming", "done_this_month", "previously"];

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-divider" />
      <span className="text-xs font-medium text-primary">{label}</span>
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
}

function ListItem({
  d,
  last,
  onDetails,
  onReschedule,
  onCancel,
}: {
  d: ScheduledDelivery;
  last: boolean;
  onDetails: (d: ScheduledDelivery) => void;
  onReschedule: (d: ScheduledDelivery) => void;
  onCancel: (d: ScheduledDelivery) => void;
}) {
  const upcoming = d.status === "scheduled";
  const locked = !canModifyDelivery(d);

  return (
    <div className="flex gap-3" data-month={d.dateISO.slice(0, 7)}>
      {/* rail */}
      <div className="flex flex-col items-center pt-1.5">
        <span
          className={`h-3 w-3 rounded-full ${
            upcoming ? "border-2 border-primary bg-white" : "bg-primary"
          }`}
        />
        {!last && <span className="w-px flex-1 bg-divider" />}
      </div>

      {/* content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary">
            {formatLongDate(d.dateISO)}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-primary">
              {d.gallonsScheduled} Gallons{upcoming ? " Scheduled" : ""}
            </span>
            {upcoming ? (
              <Badge>
                <span className="sm:hidden">Pending</span>
                <span className="hidden sm:inline">Pending Service</span>
              </Badge>
            ) : (
              <Badge tone="primary" className="!bg-primary !text-white">
                {d.price}
              </Badge>
            )}
          </div>
        </div>

        {d.notes && (
          <p className="mt-1 text-xs text-text-disabled">
            <span className="font-sans font-bold text-text-primary">Notes:</span>{" "}
            {d.notes}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="dark" size="sm" onClick={() => onDetails(d)}>
            <EyeIcon size={18} />
            Details
          </Button>
          {upcoming && (
            <>
              <Button
                variant="soft"
                size="sm"
                disabled={locked}
                onClick={() => onReschedule(d)}
              >
                <CalendarIcon size={18} />
                Reschedule Service
              </Button>
              <Button
                variant="errorSoft"
                size="sm"
                disabled={locked}
                onClick={() => onCancel(d)}
              >
                <TrashIcon size={18} />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScheduleTimeline({
  deliveries,
  onDetails,
  onReschedule,
  onCancel,
}: {
  deliveries: ScheduledDelivery[];
  onDetails: (d: ScheduledDelivery) => void;
  onReschedule: (d: ScheduledDelivery) => void;
  onCancel: (d: ScheduledDelivery) => void;
}) {
  const groups: Record<ScheduleGroup, ScheduledDelivery[]> = {
    upcoming: [],
    done_this_month: [],
    previously: [],
  };
  for (const d of deliveries) groups[groupOf(d)].push(d);
  for (const key of ORDER) {
    groups[key].sort((a, b) =>
      key === "upcoming"
        ? a.dateISO.localeCompare(b.dateISO)
        : b.dateISO.localeCompare(a.dateISO),
    );
  }

  const visibleGroups = ORDER.filter((g) => groups[g].length > 0);

  if (visibleGroups.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-grey-500">
        No scheduled deliveries yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {visibleGroups.map((g) => (
        <div key={g} className="flex flex-col gap-2">
          <GroupHeader label={GROUP_LABELS[g]} />
          {groups[g].map((d, i) => (
            <ListItem
              key={d.id}
              d={d}
              last={i === groups[g].length - 1}
              onDetails={onDetails}
              onReschedule={onReschedule}
              onCancel={onCancel}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
