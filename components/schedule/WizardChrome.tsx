"use client";

import { Button } from "@/components/ui/Button";
import {
  ChevronLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/ui/Icon";

/** Linear "Step n of N" progress bar shared by both schedule wizards. */
export function WizardProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.5px] text-text-secondary">
        Step {step} of {total}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-primary/24">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Back (icon) + Cancel + Continue footer shared by both schedule wizards. */
export function WizardFooter({
  onBack,
  onCancel,
  onContinue,
  continueLabel,
  continueDisabled,
  final = false,
}: {
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
  continueLabel: string;
  continueDisabled?: boolean;
  /** When true, the Continue button shows a check icon instead of an arrow. */
  final?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        aria-label="Back"
        onClick={onBack}
        className="grid h-12 w-14 place-items-center rounded-lg bg-grey-500/8 text-text-primary transition-colors hover:bg-grey-500/16"
      >
        <ChevronLeftIcon size={22} />
      </button>
      <Button variant="soft" size="lg" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="lg" className="flex-1" disabled={continueDisabled} onClick={onContinue}>
        {continueLabel}
        {final ? <CheckIcon size={20} /> : <ArrowRightIcon size={20} />}
      </Button>
    </div>
  );
}
