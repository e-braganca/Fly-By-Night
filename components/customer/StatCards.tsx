import { StatCard, StatNumber, StatUnit } from "@/components/ui/StatCard";
import { customer } from "@/lib/data/account";

export function StatCards() {
  return (
    <div className="flex w-full gap-3">
      <StatCard label="Refueling this week">
        <span className="flex items-baseline gap-0.5">
          <StatNumber>{customer.refuelingThisWeek}</StatNumber>
          <StatUnit>gallons</StatUnit>
        </span>
      </StatCard>
      <StatCard label="Last refueling date">
        <StatUnit>{customer.lastRefuelingDate}</StatUnit>
      </StatCard>
    </div>
  );
}
