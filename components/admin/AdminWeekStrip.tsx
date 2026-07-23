import { adminWeek } from "@/lib/data/admin";

export type BoardDay = "today" | "tomorrow";

export function AdminWeekStrip({
  selected,
  onSelect,
}: {
  selected: BoardDay;
  onSelect: (day: BoardDay) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[600px] justify-between px-4 pb-3">
      {adminWeek.map((d) => {
        // Today (THU) and tomorrow (FRI) are navigable.
        const day: BoardDay | null =
          d.state === "today" ? "today" : d.state === "tomorrow" ? "tomorrow" : null;
        const isSelected = day !== null && day === selected;
        const clickable = day !== null;

        return (
          <button
            key={d.label}
            type="button"
            disabled={!clickable}
            onClick={() => day && onSelect(day)}
            className={`flex flex-col items-center gap-2 rounded-lg px-1 py-1 transition-colors ${
              clickable ? "cursor-pointer hover:bg-grey-500/8" : "cursor-default"
            }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-text-primary">
              {d.label}
            </span>

            <span
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isSelected
                  ? "bg-primary text-white"
                  : clickable
                    ? "bg-grey-400 text-text-primary ring-2 ring-transparent hover:ring-primary/24"
                    : d.state === "disabled"
                      ? "border border-dashed border-grey-500 text-grey-500"
                      : "bg-grey-500/12 text-grey-500"
              }`}
            >
              {d.date}
            </span>

            {d.caption && (
              <span
                className={`text-center text-[9px] font-bold uppercase leading-[1.1] tracking-wide ${
                  isSelected ? "text-primary" : "text-ink"
                }`}
              >
                {d.caption.split(" ").map((w, i) => (
                  <span key={i} className="block">
                    {w}
                  </span>
                ))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
