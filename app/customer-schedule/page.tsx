"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScheduleWizard } from "@/components/schedule/ScheduleWizard";
import { formatLongDate } from "@/lib/data/schedule";

/*
  Two request flows run side by side so they can be demoed against each other:

  - default (no param) — the visitor signed in first, so pricing shows straight
    away and Place Order books the delivery.
  - ?v=2 — reached straight from the landing with no account. Name + email are
    collected with the agreement, nothing below (pricing included) unlocks until
    they're confirmed, and Place Order creates the account first.
*/

function Wizard() {
  const guest = useSearchParams().get("v") === "2";

  return (
    <ScheduleWizard
      variant={guest ? "guest" : "default"}
      defaultAddress={{
        zip: "33401",
        house: "123",
        street: "Ocean Blvd",
        city: "West Palm Beach",
        state: "Florida",
      }}
      // A guest has no dashboard to go back to yet.
      cancelHref={guest ? "/" : "/customer/deliveries"}
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

export default function CustomerSchedulePage() {
  // `useSearchParams` bails a prerendered route out to client rendering, so it
  // has to sit under a Suspense boundary or the production build fails.
  return (
    <Suspense fallback={<div className="min-h-dvh bg-neutral" />}>
      <Wizard />
    </Suspense>
  );
}
