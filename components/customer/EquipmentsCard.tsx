"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ChevronRightIcon,
  PencilIcon,
  ArrowRightIcon,
  TractorIcon,
} from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { useEquipments } from "@/lib/store";
import { unitsLabel } from "@/lib/data/equipments";

const DASHBOARD_LIMIT = 5;

export function EquipmentsCard() {
  const equipments = useEquipments();
  const visible = equipments.slice(0, DASHBOARD_LIMIT);
  const overflow = Math.max(0, equipments.length - DASHBOARD_LIMIT);

  return (
    <section className="flex flex-1 flex-col gap-3">
      <SectionHeader
        title="Your Equipment"
        action={
          <Link href="/customer/equipments">
            <Button variant="dark" size="icon" aria-label="Manage equipment">
              <PencilIcon size={18} />
            </Button>
          </Link>
        }
      />

      <div className="rounded-[var(--radius-card)] bg-white py-2">
        <ul>
          {visible.map((e) => (
            <li key={e.id}>
              <Link
                href="/customer/equipments"
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-grey-500/8"
              >
                <Avatar
                  size={48}
                  src={e.image}
                  fallback={<TractorIcon size={22} className="text-grey-500" />}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {e.name}
                  </span>
                  <span className="mt-1 inline-block">
                    <Badge>{unitsLabel(e.quantity)}</Badge>
                  </span>
                </span>
                <ChevronRightIcon size={24} className="text-grey-500" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2 px-4 pb-2 pt-3">
          {overflow > 0 && (
            <p className="text-sm font-semibold text-text-primary">
              +{overflow} more
            </p>
          )}
          <Link href="/customer/equipments" className="w-full">
            <Button variant="soft" size="md" className="w-full">
              See All
              <ArrowRightIcon size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
