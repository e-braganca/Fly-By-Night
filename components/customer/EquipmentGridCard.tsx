"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ChevronRightIcon, TractorIcon } from "@/components/ui/Icon";
import type { Equipment } from "@/lib/data/types";
import { unitsLabel, gallonsTotalLabel } from "@/lib/data/equipments";

export function EquipmentGridCard({
  equipment,
  onClick,
}: {
  equipment: Equipment;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-grey-500/8 px-5 py-3 text-left transition-colors hover:bg-grey-500/16"
    >
      <Avatar
        size={48}
        src={equipment.image}
        fallback={<TractorIcon size={22} className="text-grey-500" />}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {equipment.name}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-1">
          <Badge>{unitsLabel(equipment.quantity)}</Badge>
          <Badge>{gallonsTotalLabel(equipment)}</Badge>
          <Badge>{equipment.classification}</Badge>
        </span>
      </span>
      <ChevronRightIcon size={20} className="shrink-0 text-grey-500" />
    </button>
  );
}
