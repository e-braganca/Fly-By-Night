"use client";

import { useRef, useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { Button } from "@/components/ui/Button";
import { TextField, SelectField } from "@/components/ui/Field";
import { UploadIcon, FilePdfIcon, EyeIcon } from "@/components/ui/Icon";
import { useAppStore, useBusiness } from "@/lib/store";
import { BUSINESS_TYPES } from "@/lib/data/settings";

export function BusinessSection() {
  const business = useBusiness();
  const updateBusiness = useAppStore((s) => s.updateBusiness);
  const fileRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(business.businessName);
  const [businessType, setBusinessType] = useState(business.businessType);
  const [taxId, setTaxId] = useState(business.taxId);
  const [certName, setCertName] = useState<string | null>(business.dr97 ?? null);
  const [saved, setSaved] = useState(false);

  function onPickCert(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.files?.[0]?.name ?? null;
    if (!name) return;
    setCertName(name);
    // Persist immediately — the DR-97 is shared across every delivery.
    updateBusiness({ dr97: name });
  }

  function save() {
    updateBusiness({ businessName, businessType, taxId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SettingsCard
      title="Business Information"
      description="Manage your business information you and other people see."
      footer={
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-success-dark">Saved</span>}
          <Button variant="dark" size="md" onClick={save}>
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            id="businessName"
            label="Business Name"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <SelectField
            id="businessType"
            label="Business Type"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          >
            <option value="" disabled>
              Business Type
            </option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>
        </div>

        <TextField
          id="taxId"
          label="Tax ID"
          placeholder="Tax ID"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
        />

        <div>
          <p className="mb-3 text-[17px] font-semibold text-text-primary">
            DR-97 Tax-Exempt Certificate
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={onPickCert}
          />
          {certName ? (
            <div className="flex items-center gap-3 rounded-xl border border-grey-500/16 bg-grey-500/8 px-4 py-3">
              <FilePdfIcon size={32} className="shrink-0 text-error" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{certName}</p>
                <p className="text-xs text-text-secondary">Applies to all deliveries</p>
              </div>
              <Button variant="soft" size="sm" onClick={() => fileRef.current?.click()}>
                <EyeIcon size={16} />
                Replace
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-grey-500/20 bg-grey-500/8 px-5 py-6 text-center transition-colors hover:border-primary/40"
            >
              <UploadIcon size={28} className="text-grey-500" />
              <span className="text-sm text-text-disabled">Upload file</span>
              <span className="text-[10px] font-semibold leading-4 text-text-disabled">
                Click here to upload
              </span>
            </button>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
