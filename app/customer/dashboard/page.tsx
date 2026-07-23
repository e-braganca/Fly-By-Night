"use client";

import { WeekStrip } from "@/components/customer/WeekStrip";
import { StatCards } from "@/components/customer/StatCards";
import { EquipmentsCard } from "@/components/customer/EquipmentsCard";
import { DeliveriesCard } from "@/components/customer/DeliveriesCard";
import { PageContainer } from "@/components/customer/PageContainer";
import { useProfile } from "@/lib/store";

export default function CustomerDashboard() {
  const profile = useProfile();

  return (
    <PageContainer>
      <WeekStrip />

      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-semibold text-text-primary">
          Welcome <span className="font-bold">{profile.firstName} {profile.lastName}</span>
        </h1>
        <StatCards />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <EquipmentsCard />
        <DeliveriesCard />
      </div>
    </PageContainer>
  );
}
