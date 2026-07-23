"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { TextField, SelectField, TextAreaField } from "@/components/ui/Field";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UploadIcon,
} from "@/components/ui/Icon";
import { useAppStore } from "@/lib/store";
import { EQUIPMENT_CLASSES, EQUIPMENT_SUBTYPES } from "@/lib/data/equipments";
import type { EquipmentClass } from "@/lib/data/types";

const genUnit = (i: number) => `1123456${i}`;

/** Inline "Add an equipment" form (rendered on the page, not a drawer), with a
    per-unit pager. On save it writes the equipment to the store. */
export function EquipmentForm({
  location,
  onSaved,
  onCancel,
}: {
  location: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const addEquipment = useAppStore((s) => s.addEquipment);
  const fileRef = useRef<HTMLInputElement>(null);

  const [classification, setClassification] = useState<EquipmentClass>("Off-road");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [units, setUnits] = useState<string[]>([genUnit(1)]);
  const [sel, setSel] = useState(0);
  const [touched, setTouched] = useState(false);

  const capacityNum = Number(capacity);
  const valid = name.trim().length > 0 && capacity !== "" && !Number.isNaN(capacityNum) && capacityNum > 0;

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
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

  function save() {
    setTouched(true);
    if (!valid) return;
    addEquipment({
      name: name.trim(),
      classification,
      subtype: EQUIPMENT_SUBTYPES[0],
      maxTankCapacity: capacityNum,
      quantity: units.length,
      unitNumbers: units,
      notes: notes.trim() || undefined,
      image,
      location,
    });
    onSaved();
  }

  const showError = (cond: boolean) => (touched && cond ? "Required" : "");

  return (
    <div className="flex flex-col gap-4">
      <SelectField
        id="fuelType"
        label="What's the fuel type?"
        required
        value={classification}
        onChange={(e) => setClassification(e.target.value as EquipmentClass)}
      >
        {EQUIPMENT_CLASSES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </SelectField>

      <TextField
        id="name"
        label="Equipment name"
        required
        placeholder="Equipment name"
        value={name}
        error={showError(!name.trim())}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        id="capacity"
        label="Max tank capacity in gallons per unit"
        required
        type="number"
        min={1}
        placeholder="50"
        value={capacity}
        error={showError(capacity === "" || capacityNum <= 0)}
        onChange={(e) => setCapacity(e.target.value)}
      />

      <TextAreaField
        id="notes"
        label="Notes"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Image */}
      <div className="flex items-center gap-4">
        <Avatar
          size={80}
          src={image}
          fallback={<UploadIcon size={22} className="text-grey-500" />}
          className="ring-1 ring-grey-300"
        />
        <div className="flex flex-1 flex-col gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          <Button variant="soft" size="md" onClick={() => fileRef.current?.click()}>
            {image ? "Change Image" : "Add Image"}
          </Button>
          {image && (
            <button onClick={() => setImage(undefined)} className="text-sm font-semibold text-error">
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Per-unit pager */}
      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">Quantity of this same equipment</p>
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

      {/* Footer (matches the design: Equipments list / Add new equipment) */}
      <div className="mt-2 flex gap-2">
        <Button variant="soft" size="lg" onClick={onCancel}>
          <ChevronLeftIcon size={18} />
          Equipments list
        </Button>
        <Button size="lg" className="flex-1" disabled={touched && !valid} onClick={save}>
          <PlusIcon size={18} />
          Add new equipment
        </Button>
      </div>
    </div>
  );
}
