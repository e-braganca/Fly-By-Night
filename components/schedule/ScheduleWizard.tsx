"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { TextField, TextAreaField } from "@/components/ui/Field";
import { EquipmentModal } from "@/components/customer/EquipmentModal";
import { MiniCalendar } from "@/components/schedule/MiniCalendar";
import { WindowPicker, type DeliveryWindow } from "@/components/schedule/WindowPicker";
import { UrgencyPicker } from "@/components/schedule/UrgencyPicker";
import { WizardProgress, WizardFooter } from "@/components/schedule/WizardChrome";
import { EquipmentForm } from "@/components/schedule/EquipmentForm";
import {
  EquipmentUnitPicker,
  selectedUnitCount,
} from "@/components/schedule/EquipmentUnitPicker";
import {
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  AlertTriangleIcon,
  UploadIcon,
  TractorIcon,
  FilePdfIcon,
} from "@/components/ui/Icon";
import {
  URGENCY_OPTIONS,
  URGENCY_SCHEDULE,
  feeLabel,
  formatLongDate,
  parseISO,
  REFERENCE_TODAY,
} from "@/lib/data/schedule";
import { useEquipments, useAppStore, useBusiness } from "@/lib/store";
import type { Equipment, UrgencyTier } from "@/lib/data/types";
import type { CustomerAccount } from "@/lib/data/customers";

const URGENCY_ICON = { calendar: CalendarIcon, clock: ClockIcon, alert: AlertTriangleIcon };

type StepKind = "customer" | "urgency" | "daytime" | "address" | "equipment";

type AddressForm = {
  zip: string;
  house: string;
  street: string;
  city: string;
  state: string;
  country: string;
  notes: string;
};

const EMPTY_ADDRESS: AddressForm = {
  zip: "",
  house: "",
  street: "",
  city: "",
  state: "",
  country: "United States",
  notes: "",
};

/** Best-effort parse of a "123 Maple Avenue, Sunnyvale, FL" address string. */
function parseAddress(s: string): AddressForm {
  const parts = s.split(",").map((p) => p.trim());
  const line1 = parts[0] ?? "";
  const sp = line1.indexOf(" ");
  return {
    zip: "",
    house: sp > 0 ? line1.slice(0, sp) : line1,
    street: sp > 0 ? line1.slice(sp + 1) : "",
    city: parts[1] ?? "",
    state: parts[2] ?? "",
    country: "United States",
    notes: "",
  };
}

export type ScheduleWizardProps = {
  /** Admin mode: pass the customer directory to enable the customer step. */
  customers?: CustomerAccount[];
  /** Customer mode: show the blue "Let's create your delivery request" intro. */
  showIntro?: boolean;
  /** Address prefill (customer/self mode). */
  defaultAddress?: Partial<AddressForm>;
  /** Where Cancel / backing out of the first step goes. */
  cancelHref: string;
  /** Confirmation screen copy + navigation. */
  doneTitle: string;
  doneMessage: (ctx: {
    dateISO: string;
    win: DeliveryWindow;
    addressLine: string;
    customerName: string | null;
  }) => ReactNode;
  donePrimary: { label: string; href: string };
  doneSecondary: { label: string; href: string };
};

export function ScheduleWizard({
  customers,
  showIntro = false,
  defaultAddress,
  cancelHref,
  doneTitle,
  doneMessage,
  donePrimary,
  doneSecondary,
}: ScheduleWizardProps) {
  const router = useRouter();
  const equipments = useEquipments();
  const addScheduledDelivery = useAppStore((s) => s.addScheduledDelivery);
  const business = useBusiness();
  const updateBusiness = useAppStore((s) => s.updateBusiness);
  const certRef = useRef<HTMLInputElement>(null);

  // Step sequence + progress grouping (urgency + daytime share the "Schedule" step).
  const steps: StepKind[] = customers
    ? ["customer", "urgency", "daytime", "address", "equipment"]
    : ["urgency", "daytime", "address", "equipment"];
  const GROUP: Record<StepKind, number> = customers
    ? { customer: 1, urgency: 2, daytime: 2, address: 3, equipment: 4 }
    : { customer: 0, urgency: 1, daytime: 1, address: 2, equipment: 3 };
  const totalSteps = (customers ? 4 : 3) + 1; // + summary

  const firstPos = showIntro ? -1 : 0;
  const [pos, setPos] = useState(firstPos);
  const [done, setDone] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editEquip, setEditEquip] = useState<Equipment | null>(null);
  const [deselected, setDeselected] = useState<Set<string>>(new Set());

  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<UrgencyTier | null>(null);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [win, setWin] = useState<DeliveryWindow | null>(null);
  const [cert, setCert] = useState<string | null>(business.dr97 ?? null);
  const [addr, setAddr] = useState<AddressForm>({ ...EMPTY_ADDRESS, ...defaultAddress });

  const kind: StepKind | null = pos >= 0 && pos < steps.length ? steps[pos] : null;
  const isSummary = pos === steps.length;
  const equipAdding = kind === "equipment" && adding;

  const addressLine = `${addr.house} ${addr.street}, ${addr.city}, ${addr.state}`;
  const rule = tier ? URGENCY_SCHEDULE[tier] : null;
  const refMonth = parseISO(REFERENCE_TODAY);
  const chosen = equipments
    .map((e) => ({ e, count: selectedUnitCount(e, deselected) }))
    .filter((x) => x.count > 0);
  const totalGallons = chosen.reduce((s, x) => s + x.count * x.e.maxTankCapacity, 0);
  // Zip is optional (customer directory addresses don't include it).
  const addrValid = [addr.house, addr.street, addr.city, addr.state, addr.country].every(
    (v) => v.trim().length > 0,
  );

  function stepValid(k: StepKind): boolean {
    switch (k) {
      case "customer": return Boolean(customer);
      case "urgency": return Boolean(tier);
      case "daytime": return Boolean(dateISO && win);
      case "address": return addrValid;
      case "equipment": return chosen.length > 0;
    }
  }
  const canContinue = kind ? stepValid(kind) : true;

  const set = <K extends keyof AddressForm>(k: K, v: string) =>
    setAddr((a) => ({ ...a, [k]: v }));

  // Auto-fill City / State from a US ZIP via the free Zippopotam.us API
  // (no key, CORS-enabled). A ZIP maps to city + state only — the street and
  // house number are still typed by hand. Fails silently to manual entry.
  const zipReq = useRef(0);
  const [zipStatus, setZipStatus] = useState<"idle" | "loading" | "error">("idle");

  function onZipChange(raw: string) {
    const zip = raw.replace(/\D/g, "").slice(0, 5);
    set("zip", zip);
    if (zip.length < 5) {
      setZipStatus("idle");
      return;
    }
    const reqId = ++zipReq.current;
    setZipStatus("loading");
    fetch(`https://api.zippopotam.us/us/${zip}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { places?: { "place name": string; state: string }[] }) => {
        if (reqId !== zipReq.current) return; // a newer lookup superseded this one
        const place = data.places?.[0];
        if (!place) {
          setZipStatus("error");
          return;
        }
        setAddr((a) => ({
          ...a,
          city: place["place name"],
          state: place.state,
          country: "United States",
        }));
        setZipStatus("idle");
      })
      .catch(() => {
        if (reqId === zipReq.current) setZipStatus("error");
      });
  }

  function chooseTier(t: UrgencyTier) {
    setTier(t);
    setDateISO(null); // changing urgency invalidates the picked date/window
    setWin(null);
  }

  function chooseCustomer(c: CustomerAccount | null) {
    setCustomer(c);
    if (c) setAddr(parseAddress(c.address)); // prefill delivery location
  }

  function finish() {
    if (!tier || !dateISO) return;
    addScheduledDelivery({
      dateISO,
      status: "scheduled",
      isEditable: true,
      address: addressLine,
      urgency: tier,
      gallonsScheduled: totalGallons,
      equipment: chosen.map(({ e, count }) => ({
        name: e.name,
        units: count,
        gallonsMax: e.maxTankCapacity,
        fuelType: e.classification,
      })),
      notes: addr.notes.trim() || undefined,
      documents: cert ? [{ label: "DR-97 Tax-Exempt Certificate", filename: cert, url: "#" }] : undefined,
    });
    setDone(true);
  }

  function next() {
    if (isSummary) finish();
    else setPos((p) => p + 1);
  }
  function back() {
    if (pos <= firstPos) router.push(cancelHref);
    else setPos((p) => p - 1);
  }

  function onPickCert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCert(file.name);
    // The DR-97 is account-level: uploading here also updates the profile.
    updateBusiness({ dr97: file.name });
  }

  /* ---- Intro (blue, customer mode) ---- */
  if (pos === -1) {
    return (
      <div className="flex min-h-dvh flex-col bg-primary px-6 text-white">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Image src="/brand/emblem.svg" alt="" width={72} height={72} className="mb-6" />
          <h1 className="text-[28px] font-bold">Let&apos;s create your delivery request</h1>
          <p className="mt-3 text-white/80">To proceed you will need to provide information about your:</p>
          <ul className="mt-6 flex flex-col gap-3 text-left">
            {["Schedule", "Delivery Location", "Equipment"].map((s) => (
              <li key={s} className="flex items-center gap-2 font-semibold">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-primary">
                  <CheckIcon size={14} />
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto flex w-full max-w-[600px] gap-3 py-8">
          <Button variant="soft" size="lg" className="!bg-white/16 !text-white" onClick={() => router.push(cancelHref)}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1 !bg-white !text-primary !shadow-none" onClick={next}>
            Continue
            <ArrowRightIcon size={20} />
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Request Summary (blue) ---- */
  if (!done && isSummary && tier && dateISO) {
    const UrgencyIcon = URGENCY_ICON[URGENCY_OPTIONS[tier].icon];
    return (
      <div className="h-dvh overflow-hidden bg-primary text-white">
        <div className="mx-auto flex h-full w-full max-w-[600px] flex-col px-5 py-8 sm:px-8">
          <div className="flex flex-none flex-col items-center pt-2 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full ring-2 ring-white/40">
              <Image src="/brand/emblem.svg" alt="" width={40} height={40} />
            </span>
            <h1 className="mt-4 text-[32px] font-bold">Request Summary</h1>
          </div>

          {/* Scrollable body — keeps the footer pinned on screen at any height */}
          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
          {customer && (
            <div>
              <p className="text-sm text-white/70">Customer</p>
              <div className="mt-1 flex items-center gap-3">
                {customer.logo && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
                    <Image src={customer.logo} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                  </span>
                )}
                <p className="font-semibold">{customer.name}</p>
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-white/70">Delivery address</p>
            <p className="font-semibold">{addressLine}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Scheduled for</p>
            <p className="font-semibold">{formatLongDate(dateISO)} · {win}</p>
          </div>

          <div>
            <p className="mb-2 text-sm text-white/70">Delivery urgency</p>
            <div className="flex items-center gap-3 rounded-2xl bg-white/12 p-4">
              <UrgencyIcon size={22} className="shrink-0 text-white" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{URGENCY_OPTIONS[tier].title}</p>
                <p className="truncate text-sm text-white/70">{URGENCY_OPTIONS[tier].description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">fee</p>
                <p className="font-semibold">{feeLabel(URGENCY_OPTIONS[tier].fee)}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-[1.6fr_0.6fr_1fr_0.9fr] gap-2 border-b border-white/16 pb-2 text-xs text-white/70">
              <span>Equipment</span>
              <span>Units</span>
              <span>Gallons max.</span>
              <span>Fuel Type</span>
            </div>
            <div>
              {chosen.map(({ e, count }, i) => (
                <div
                  key={e.id}
                  className={`grid grid-cols-[1.6fr_0.6fr_1fr_0.9fr] items-center gap-2 rounded-lg px-2 py-2.5 text-sm ${
                    i % 2 === 1 ? "bg-white/8" : ""
                  }`}
                >
                  <span className="truncate font-semibold">{e.name}</span>
                  <span>{count}</span>
                  <span className="text-white/80">{e.maxTankCapacity} gal. max.</span>
                  <span className="text-white/80">{e.classification}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="font-semibold">DR-97 Tax-Exempt Certificate</p>
              <span className="text-sm text-white/70">{cert ? "On file" : "Optional"}</span>
            </div>
            <input ref={certRef} type="file" className="hidden" onChange={onPickCert} />
            {cert ? (
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/12 p-4">
                <FilePdfIcon size={28} className="shrink-0 text-white" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{cert}</p>
                  <p className="text-xs text-white/70">Applies to all your deliveries</p>
                </div>
                <button
                  onClick={() => certRef.current?.click()}
                  className="shrink-0 text-sm font-semibold text-white underline underline-offset-2"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                onClick={() => certRef.current?.click()}
                className="mt-2 flex w-full flex-col items-center gap-1 rounded-2xl bg-white/12 py-6 text-sm transition-colors hover:bg-white/16"
              >
                <UploadIcon size={22} className="text-white" />
                <span className="font-semibold">Upload file</span>
                <span className="text-xs text-white/70">Click here to upload</span>
              </button>
            )}
          </div>

          </div>

          <div className="flex flex-none gap-2 pt-4">
            <button
              aria-label="Back"
              onClick={() => setPos(steps.length - 1)}
              className="grid h-10 w-12 shrink-0 place-items-center rounded-lg bg-white/16 text-white transition-colors hover:bg-white/24"
            >
              <ArrowRightIcon size={20} className="rotate-180" />
            </button>
            <Button variant="soft" size="lg" className="!bg-white/16 !text-white" onClick={() => router.push(cancelHref)}>
              Cancel
            </Button>
            <Button size="lg" className="flex-1 !bg-white !text-primary !shadow-none" onClick={finish}>
              Place Order
              <ArrowRightIcon size={20} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Confirmation (blue) ---- */
  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-primary px-6 text-center text-white">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-white/16">
          <CheckIcon size={40} />
        </span>
        <h1 className="mt-6 text-3xl font-semibold">{doneTitle}</h1>
        <p className="mt-2 max-w-md text-white/80">
          {dateISO && win
            ? doneMessage({ dateISO, win, addressLine, customerName: customer?.name ?? null })
            : null}
        </p>
        <div className="mt-8 flex gap-3">
          <Button variant="soft" size="lg" className="!bg-white/16 !text-white" onClick={() => router.push(doneSecondary.href)}>
            {doneSecondary.label}
          </Button>
          <Button size="lg" className="!bg-white !text-primary !shadow-none" onClick={() => router.push(donePrimary.href)}>
            {donePrimary.label}
          </Button>
        </div>
      </div>
    );
  }

  const filteredCustomers = (() => {
    if (!customers) return [];
    const q = query.trim().toLowerCase();
    return q ? customers.filter((c) => c.name.toLowerCase().includes(q)) : customers;
  })();

  return (
    <div className="h-dvh overflow-hidden bg-neutral">
      <div className="mx-auto flex h-full w-full max-w-[600px] flex-col px-5 py-6 sm:px-8 sm:py-8">
        {/* Fixed header */}
        <div className="flex flex-none flex-col gap-5">
          <WizardProgress step={kind ? GROUP[kind] : totalSteps} total={totalSteps} />
          <div>
            <h1 className="text-[32px] font-semibold leading-tight text-text-primary">
              {kind === "customer" && "Who is the customer?"}
              {kind === "urgency" && "How urgent is the delivery?"}
              {kind === "daytime" && "When do you want the delivery?"}
              {kind === "address" && "Fuel Delivery Location"}
              {kind === "equipment" && (adding ? "Add an equipment" : "Your Equipment")}
            </h1>
            <p className="mt-1 text-base text-text-secondary">
              {kind === "customer" && "Please select one of the customers to proceed."}
              {kind === "urgency" && "Please select how urgent is this fuel delivery."}
              {kind === "daytime" && "Select the date and time slot for the delivery."}
              {kind === "address" && "Please provide the address for fuel delivery before adding vehicles."}
              {kind === "equipment" && (adding ? "Provide the equipment details and its units." : "Please add and select the equipment you plan to fuel.")}
            </p>
          </div>
        </div>

        {/* Scrolling body */}
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          {kind === "customer" && (
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
              <SearchInput value={query} onChange={setQuery} placeholder="Search..." />
              <div className="flex flex-col gap-4">
                {filteredCustomers.map((c) => {
                  const selected = customer?.id === c.id;
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      {c.logo ? (
                        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-grey-200">
                          <Image src={c.logo} alt="" width={38} height={38} className="h-9 w-9 object-contain" />
                        </span>
                      ) : (
                        <Avatar size={40} fallback={<TractorIcon size={20} className="text-grey-500" />} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-primary">{c.name}</p>
                        <p className="truncate text-xs text-text-secondary">{c.address}</p>
                      </div>
                      <Button
                        variant={selected ? "primary" : "soft"}
                        size="sm"
                        className={selected ? "" : "!bg-primary/8 !text-primary-dark"}
                        onClick={() => chooseCustomer(selected ? null : c)}
                      >
                        {selected ? "Unselect" : "Select"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {kind === "urgency" && <UrgencyPicker value={tier} onChange={chooseTier} />}

          {kind === "daytime" && (
            <div className="flex flex-col gap-5">
              <MiniCalendar
                selectedISO={dateISO}
                onSelect={setDateISO}
                initialView={{ y: refMonth.y, m: refMonth.m }}
                minISO={REFERENCE_TODAY}
                isEnabled={rule?.allowsDay}
              />
              <WindowPicker value={win} onChange={setWin} enabled={rule?.windows} />
            </div>
          )}

          {kind === "address" && (
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
              <div>
                <TextField
                  id="zip"
                  label="Zip Code"
                  inputMode="numeric"
                  placeholder="e.g. 33401"
                  value={addr.zip}
                  onChange={(e) => onZipChange(e.target.value)}
                />
                {zipStatus === "loading" && (
                  <p className="mt-1 text-xs text-text-secondary">Looking up city &amp; state…</p>
                )}
                {zipStatus === "error" && (
                  <p className="mt-1 text-xs text-warning-dark">
                    Couldn&apos;t find that ZIP — enter city &amp; state manually.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField id="house" label="House Number" value={addr.house} onChange={(e) => set("house", e.target.value)} />
                <TextField id="street" label="Street Name" value={addr.street} onChange={(e) => set("street", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField id="city" label="City" value={addr.city} onChange={(e) => set("city", e.target.value)} />
                <TextField id="state" label="State" value={addr.state} onChange={(e) => set("state", e.target.value)} />
              </div>
              <TextField id="country" label="Country" value={addr.country} onChange={(e) => set("country", e.target.value)} />
              <TextAreaField
                id="notes"
                label="Access Notes"
                placeholder="Please also provide information on how to access the equipments."
                value={addr.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          )}

          {kind === "equipment" && adding && (
            <EquipmentForm
              location={addressLine}
              onSaved={() => setAdding(false)}
              onCancel={() => setAdding(false)}
            />
          )}

          {kind === "equipment" && !adding && (
            <div className="flex flex-col gap-4">
              {equipments.length === 0 ? (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-grey-500/8 py-6 text-sm font-semibold text-text-secondary transition-colors hover:bg-grey-500/16"
                >
                  Add an equipment
                  <PlusIcon size={18} />
                </button>
              ) : (
                <>
                  <EquipmentUnitPicker
                    equipments={equipments}
                    deselected={deselected}
                    onChange={setDeselected}
                    onEdit={(e) => setEditEquip(e)}
                  />
                  <button
                    onClick={() => setAdding(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-grey-400 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/8"
                  >
                    <PlusIcon size={18} />
                    Add an equipment
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Fixed bottom: location alert (equipment step) + footer */}
        <div className="flex flex-none flex-col gap-3 pt-4">
          {kind === "equipment" && !adding && (
            <div className="flex items-center gap-2 rounded-xl bg-primary/8 px-3 py-3 text-sm text-primary-darker">
              <LocationIcon size={18} className="shrink-0 text-primary" />
              <span>
                Delivery to <span className="font-semibold">{addressLine}</span>. All equipments should
                be at the same location.
              </span>
            </div>
          )}
          {!equipAdding && (
            <WizardFooter
              onBack={back}
              onCancel={() => router.push(cancelHref)}
              onContinue={next}
              continueLabel="Continue"
              continueDisabled={!canContinue}
            />
          )}
        </div>
      </div>

      {/* Editing an existing equipment reuses the drawer. */}
      <EquipmentModal
        open={Boolean(editEquip)}
        equipment={editEquip}
        onClose={() => setEditEquip(null)}
        location={addressLine}
      />
    </div>
  );
}
