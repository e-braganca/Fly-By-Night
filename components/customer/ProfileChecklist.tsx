import { checklist } from "@/lib/data/account";

function CheckCircleFilled({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m8 12 2.5 2.5L16 9"
        stroke="#fff"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleOutline({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8 12 2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileChecklist() {
  return (
    <div className="w-full rounded-[var(--radius-card)] bg-primary/8 p-4">
      <h2 className="text-base font-semibold text-text-primary">
        Complete your profile!
      </h2>

      <div className="mt-2 flex gap-2">
        {checklist.map((step, i) => (
          <div key={i} className="flex flex-1 flex-col gap-2">
            {/* segmented progress connector */}
            <span
              className={`h-1 rounded-full ${
                step.done ? "bg-primary" : "bg-primary-lighter"
              }`}
            />
            <div className="flex items-center gap-1 py-2 pr-2">
              <span className={step.done ? "text-primary" : "text-grey-500"}>
                {step.done ? <CheckCircleFilled /> : <CheckCircleOutline />}
              </span>
              <span
                className={`text-sm text-text-primary ${
                  step.done ? "line-through" : ""
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
