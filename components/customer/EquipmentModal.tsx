"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { TextField, SelectField, TextAreaField } from "@/components/ui/Field";
import {
  PlusIcon,
  CheckIcon,
  TrashIcon,
  LocationIcon,
  UploadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { unitNumber } from "@/components/schedule/EquipmentUnitPicker";
import { useAppStore } from "@/lib/store";
import type { Equipment, EquipmentClass } from "@/lib/data/types";
import { EQUIPMENT_CLASSES, EQUIPMENT_SUBTYPES } from "@/lib/data/equipments";

type FormState = {
  classification: EquipmentClass | "";
  name: string;
  subtype: string;
  maxTankCapacity: string;
  notes: string;
  image?: string;
};

const empty: FormState = {
  classification: "",
  name: "",
  subtype: "",
  maxTankCapacity: "",
  notes: "",
  image: undefined,
};

const genUnit = (i: number) => `1123456${i}`;

function fromEquipment(e: Equipment): FormState {
  return {
    classification: e.classification,
    name: e.name,
    subtype: e.subtype,
    maxTankCapacity: String(e.maxTankCapacity),
    notes: e.notes ?? "",
    image: e.image,
  };
}

function initialUnits(e?: Equipment | null): string[] {
  if (!e) return [genUnit(1)];
  if (e.unitNumbers && e.unitNumbers.length) return [...e.unitNumbers];
  return Array.from({ length: e.quantity }, (_, i) => unitNumber(e.id, i));
}

export function EquipmentModal({
  open,
  onClose,
  equipment,
  location,
  onRequestDelete,
}: {
  open: boolean;
  onClose: () => void;
  equipment?: Equipment | null;
  location: string;
  onRequestDelete?: (e: Equipment) => void;
}) {
  const isEdit = Boolean(equipment);
  const addEquipment = useAppStore((s) => s.addEquipment);
  const updateEquipment = useAppStore((s) => s.updateEquipment);

  const [form, setForm] = useState<FormState>(empty);
  const [units, setUnits] = useState<string[]>([genUnit(1)]);
  const [sel, setSel] = useState(0);
  const [touched, setTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(equipment ? fromEquipment(equipment) : empty);
      setUnits(initialUnits(equipment));
      setSel(0);
      setTouched(false);
    }
  }, [open, equipment]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const capacityNum = Number(form.maxTankCapacity);
  const errors = {
    classification: !form.classification ? "Required" : "",
    name: !form.name.trim() ? "Required" : "",
    subtype: !form.subtype ? "Required" : "",
    maxTankCapacity:
      !form.maxTankCapacity || Number.isNaN(capacityNum) || capacityNum <= 0
        ? "Enter a valid number"
        : "",
  };
  const valid = !Object.values(errors).some(Boolean);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result as string);
    reader.readAsDataURL(file);
  }

  function setUnitNumber(v: string) {
    setUnits((u) => u.map((n, i) => (i === sel ? v : n)));
  }
  function addUnit() {
    setUnits((u) => {
      const next = [...u, genUnit(u.length + 1)];
      setSel(next.length - 1);
      return next;
    });
  }
  function deleteUnit() {
    setUnits((u) => {
      if (u.length <= 1) return u;
      const next = u.filter((_, i) => i !== sel);
      setSel((s) => Math.min(s, next.length - 1));
      return next;
    });
  }

  function handleSubmit() {
    setTouched(true);
    if (!valid) return;
    const payload = {
      name: form.name.trim(),
      classification: form.classification as EquipmentClass,
      subtype: form.subtype,
      maxTankCapacity: capacityNum,
      quantity: units.length,
      unitNumbers: units,
      notes: form.notes.trim() || undefined,
      image: form.image,
      location,
    };
    if (isEdit && equipment) updateEquipment(equipment.id, payload);
    else addEquipment(payload);
    onClose();
  }

  const showError = (key: keyof typeof errors) => (touched ? errors[key] : "");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit this equipment" : "Add an equipment"}
      headerBorder
      headerActions={
        isEdit && equipment && onRequestDelete ? (
          <button
            aria-label="Delete equipment"
            onClick={() => onRequestDelete(equipment)}
            className="grid h-8 w-8 place-items-center rounded-full text-grey-600 transition-colors hover:bg-error/8 hover:text-error"
          >
            <TrashIcon size={20} />
          </button>
        ) : undefined
      }
      footer={
        <div className="flex gap-3">
          <Button variant="soft" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" disabled={touched && !valid} onClick={handleSubmit}>
            {isEdit ? "Confirm Changes" : "Add Equipment"}
            {isEdit ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
          </Button>
        </div>
      }
    >
      <div className="px-6 py-4">
        {!isEdit && (
          <>
            <p className="mb-4 text-xs text-error">* Mandatory</p>
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/16 bg-primary/8 px-3 py-2.5 text-sm text-primary-darker">
              <LocationIcon size={18} className="shrink-0 text-primary" />
              <span>
                Adding to <span className="font-semibold">{location}</span>
              </span>
            </div>
          </>
        )}

        <div className="flex flex-col gap-4">
          <SelectField
            id="classification"
            label="What's the fuel type?"
            required
            value={form.classification}
            error={showError("classification")}
            onChange={(e) => set("classification", e.target.value as EquipmentClass)}
          >
            <option value="" disabled>
              Select…
            </option>
            {EQUIPMENT_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="name"
              label="Equipment name"
              required
              placeholder="Equipment name"
              value={form.name}
              error={showError("name")}
              onChange={(e) => set("name", e.target.value)}
            />
            <SelectField
              id="subtype"
              label="Equipment subtype"
              required
              value={form.subtype}
              error={showError("subtype")}
              onChange={(e) => set("subtype", e.target.value)}
            >
              <option value="" disabled>
                Select…
              </option>
              {EQUIPMENT_SUBTYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>
          </div>

          <TextField
            id="capacity"
            label="Max tank capacity in gallons per unit"
            required
            type="number"
            min={1}
            placeholder="50"
            value={form.maxTankCapacity}
            error={showError("maxTankCapacity")}
            onChange={(e) => set("maxTankCapacity", e.target.value)}
          />

          <TextAreaField
            id="notes"
            label="Notes"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />

          {/* Image upload */}
          <div className="flex items-center gap-4">
            <Avatar
              size={80}
              src={form.image}
              fallback={<UploadIcon size={22} className="text-grey-500" />}
              className="ring-1 ring-grey-300"
            />
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              <Button variant="soft" size="md" onClick={() => fileRef.current?.click()}>
                {form.image ? "Change Image" : "Add Image"}
              </Button>
              {form.image && (
                <button onClick={() => set("image", undefined)} className="text-sm font-semibold text-error">
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Per-unit pager */}
          <div>
            <p className="mb-2 text-sm font-semibold text-text-primary">
              Quantity of this same equipment
            </p>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous unit"
                disabled={sel === 0}
                onClick={() => setSel((s) => Math.max(0, s - 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-500/8 disabled:opacity-30"
              >
                <ChevronLeftIcon size={18} />
              </button>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {units.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSel(i)}
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-colors ${
                      i === sel
                        ? "bg-primary text-white ring-2 ring-primary/40 ring-offset-2"
                        : "bg-grey-800 text-white hover:bg-grey-900"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  aria-label="Add unit"
                  onClick={addUnit}
                  className="grid h-9 w-9 place-items-center rounded-full bg-grey-500/12 text-grey-700 hover:bg-grey-500/24"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
              <button
                aria-label="Next unit"
                disabled={sel >= units.length - 1}
                onClick={() => setSel((s) => Math.min(units.length - 1, s + 1))}
                className="grid h-9 w-9 place-items-center rounded-full text-grey-700 hover:bg-grey-500/8 disabled:opacity-30"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>
          </div>

          <TextField
            id="unitNumber"
            label="Unit Number"
            value={units[sel] ?? ""}
            onChange={(e) => setUnitNumber(e.target.value)}
          />

          {units.length > 1 && (
            <button
              onClick={deleteUnit}
              className="rounded-lg bg-error/8 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error/16"
            >
              Delete this Unit
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
