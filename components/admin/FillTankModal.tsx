"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { DropletIcon, CheckIcon } from "@/components/ui/Icon";
import { money } from "@/lib/data/receipts";
import { computeRefueling, type TankRefueling } from "@/lib/data/fillTank";
import { formatTransactionDate } from "@/lib/data/fillTank";
import type { EquipmentClass } from "@/lib/data/types";

const FUEL_TYPES: EquipmentClass[] = ["Off-road", "On-road"];

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `r_${crypto.randomUUID()}`;
  return `r_${Math.floor(Math.random() * 1e9)}`;
}

function Field({
  label,
  value,
  onChange,
  adornment,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  adornment: ReactNode;
}) {
  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[53px] w-full rounded-lg bg-grey-500/8 px-3 pr-12 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/24"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grey-600">
          {adornment}
        </span>
      </div>
    </div>
  );
}

export function FillTankModal({
  open,
  onClose,
  onSave,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (r: TankRefueling) => void;
  /** When set, the drawer edits this record instead of creating a new one. */
  editing?: TankRefueling | null;
}) {
  const [gallons, setGallons] = useState("");
  const [cost, setCost] = useState("");
  const [taxes, setTaxes] = useState("");
  const [fuelType, setFuelType] = useState<EquipmentClass>("Off-road");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setGallons(String(editing.gallons));
      setCost(String(editing.costPerGallon));
      setTaxes(String(editing.taxPct));
      setFuelType(editing.fuelType);
    } else {
      setGallons("");
      setCost("");
      setTaxes("");
      setFuelType("Off-road");
    }
  }, [open, editing]);

  const g = Number(gallons) || 0;
  const c = Number(cost) || 0;
  const t = Number(taxes) || 0;
  const { fuelCost, taxAmount, total } = computeRefueling(g, c, t);
  const valid = g > 0 && c > 0;

  function save() {
    if (!valid) return;
    onSave({
      id: editing?.id ?? newId(),
      gallons: g,
      costPerGallon: c,
      taxPct: t,
      taxAmount,
      total,
      fuelType,
      // Keep the original timestamp on edit; stamp "now" for a new entry.
      date: editing?.date ?? formatTransactionDate(new Date()),
    });
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Edit refueling" : "Fill your tank now"}
      footer={
        <div className="flex gap-2">
          <Button variant="soft" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" disabled={!valid} onClick={save}>
            {editing ? "Save changes" : "Complete Fueling"}
            <CheckIcon size={20} />
          </Button>
        </div>
      }
    >
      <div className="px-6 py-2">
        <p className="text-base text-text-secondary">
          Please inform the amount of fuel dispensed and the cost per gallon.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-6 py-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">
            Fuel type
          </label>
          <div className="inline-flex rounded-lg bg-grey-500/8 p-1">
            {FUEL_TYPES.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFuelType(opt)}
                className={`h-9 rounded-md px-4 text-sm font-semibold transition-colors ${
                  fuelType === opt
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <Field
          label="Total amount of fuel dispensed"
          value={gallons}
          onChange={setGallons}
          adornment={<DropletIcon size={20} />}
        />
        <Field
          label="Cost per gallon"
          value={cost}
          onChange={setCost}
          adornment={<span className="text-lg font-semibold">$</span>}
        />
        <Field
          label="Taxes"
          value={taxes}
          onChange={setTaxes}
          adornment={<span className="text-lg font-semibold">%</span>}
        />
      </div>

      {/* Summary */}
      <div className="mx-6 flex flex-col gap-3 border-y border-divider py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-text-primary">Total Fuel Cost</p>
            <p className="text-sm text-text-disabled">
              {g} gal x {money(c)}
            </p>
          </div>
          <span className="text-base font-semibold text-text-primary">{money(fuelCost)}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-text-primary">Total tax</p>
            <p className="text-sm text-text-disabled">{t}%</p>
          </div>
          <span className="text-base font-semibold text-text-primary">{money(taxAmount)}</span>
        </div>
      </div>

      {/* Grand total */}
      <div className="mx-6 my-5 flex items-center justify-between rounded-2xl bg-neutral p-4">
        <span className="text-lg font-semibold text-text-primary">Total Cost</span>
        <span className="text-lg font-bold text-primary">{money(total)}</span>
      </div>
    </Drawer>
  );
}
