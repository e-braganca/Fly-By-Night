import { week } from "@/lib/data/account";

export function WeekStrip() {
  return (
    <div className="mx-auto flex w-full max-w-[600px] justify-between px-4 pb-3">
      {week.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-text-primary">
            {d.label}
          </span>

          {d.state === "next" ? (
            <div className="flex flex-col items-center">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {d.date}
              </span>
              <span className="mt-1 text-center text-[9px] font-bold uppercase leading-[1.1] tracking-wide text-primary">
                Next
                <br />
                Delivery
              </span>
            </div>
          ) : (
            <span
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border text-xs ${
                d.state === "today"
                  ? "border-solid border-grey-700 text-text-primary"
                  : "border border-dashed border-grey-500 text-grey-500"
              }`}
            >
              {d.date}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
