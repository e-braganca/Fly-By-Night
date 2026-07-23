"use client";

import { ScheduleWizard } from "@/components/schedule/ScheduleWizard";
import { customers } from "@/lib/data/customers";
import { formatLongDate } from "@/lib/data/schedule";

export default function AdminSchedulePage() {
  return (
    <ScheduleWizard
      customers={customers}
      cancelHref="/admin/dashboard"
      doneTitle="Delivery scheduled!"
      doneMessage={({ dateISO, win, customerName }) => (
        <>
          The fuel delivery for <span className="font-semibold">{customerName}</span> on{" "}
          <span className="font-semibold">{formatLongDate(dateISO)}</span> ({win}) has been created.
        </>
      )}
      donePrimary={{ label: "View deliveries", href: "/admin/deliveries" }}
      doneSecondary={{ label: "Back to dashboard", href: "/admin/dashboard" }}
    />
  );
}
