"use client";

import { useState } from "react";
import { WeekStrip } from "@/components/customer/WeekStrip";
import { StatCards } from "@/components/customer/StatCards";
import { ProfileChecklist } from "@/components/customer/ProfileChecklist";
import { EquipmentsCard } from "@/components/customer/EquipmentsCard";
import { DeliveriesCard } from "@/components/customer/DeliveriesCard";
import { PageContainer } from "@/components/customer/PageContainer";
import { useProfile } from "@/lib/store";

export default function CustomerDashboard() {
  const [onboarding, setOnboarding] = useState(false);
  const profile = useProfile();

  return (
    <PageContainer>
      {/* Demo state toggle (not part of the design) */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg bg-white p-1 text-xs font-semibold shadow-[var(--shadow-card)]">
          <button
            onClick={() => setOnboarding(false)}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              !onboarding ? "bg-primary text-white" : "text-text-secondary"
            }`}
          >
            Returning
          </button>
          <button
            onClick={() => setOnboarding(true)}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              onboarding ? "bg-primary text-white" : "text-text-secondary"
            }`}
          >
            New / onboarding
          </button>
        </div>
      </div>

      <WeekStrip />

      <div className="flex flex-col gap-3">
        <h1 className="text-lg font-semibold text-text-primary">
          Welcome <span className="font-bold">{profile.firstName} {profile.lastName}</span>
        </h1>
        {onboarding ? <ProfileChecklist /> : <StatCards />}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <EquipmentsCard />
        <DeliveriesCard />
      </div>
    </PageContainer>
  );
}
