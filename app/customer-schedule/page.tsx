"use client";

import { ScheduleWizard } from "@/components/schedule/ScheduleWizard";
import { formatLongDate } from "@/lib/data/schedule";

export default function CustomerSchedulePage() {
  return (
    <ScheduleWizard
      showIntro
      defaultAddress={{
        zip: "33401",
        house: "123",
        street: "Ocean Blvd",
        city: "West Palm Beach",
        state: "Florida",
      }}
      cancelHref="/customer/deliveries"
      doneTitle="Delivery request sent!"
      doneMessage={({ dateISO, win, addressLine }) => (
        <>
          Your fuel delivery for <span className="font-semibold">{formatLongDate(dateISO)}</span> ({win})
          at <span className="font-semibold">{addressLine}</span> has been requested.
        </>
      )}
      donePrimary={{ label: "View deliveries", href: "/customer/deliveries" }}
      doneSecondary={{ label: "Back to dashboard", href: "/customer/dashboard" }}
    />
  );
}
