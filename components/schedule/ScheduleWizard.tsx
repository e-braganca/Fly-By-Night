"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { TextField, TextAreaField } from "@/components/ui/Field";
import { EquipmentModal } from "@/components/customer/EquipmentModal";
import { MiniCalendar } from "@/components/schedule/MiniCalendar";
import { WindowPicker, type DeliveryWindow } from "@/components/schedule/WindowPicker";
import { UrgencyPicker } from "@/components/schedule/UrgencyPicker";
import { ServiceAgreement } from "@/components/schedule/ServiceAgreement";
import {
  EquipmentUnitPicker,
  selectedUnitCount,
} from "@/components/schedule/EquipmentUnitPicker";
import {
  ArrowRightIcon,
  CheckIcon,
  PlusIcon,
  LocationIcon,
  UploadIcon,
  TractorIcon,
  FilePdfIcon,
  ChevronDownIcon,
  LockIcon,
  DropletIcon,
  EyeIcon,
} from "@/components/ui/Icon";
import {
  URGENCY_OPTIONS,
  URGENCY_SCHEDULE,
  feeLabel,
  formatLongDate,
  parseISO,
  REFERENCE_TODAY,
} from "@/lib/data/schedule";
import {
  FUEL_TYPES,
  computeCost,
  money,
  OFF_ROAD_MIN,
  OFF_ROAD_PRICE,
  DEF_MAX,
  type FuelTypeId,
} from "@/lib/data/pricing";
import {
  useEquipments,
  useAppStore,
  useBusiness,
  useAgreementSigned,
} from "@/lib/store";
import type { Equipment, UrgencyTier } from "@/lib/data/types";
import type { CustomerAccount } from "@/lib/data/customers";

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

/** Section wrapper: numbered-free titled block used down the scrolling page. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export type ScheduleWizardProps = {
  /**
   * `default` — the signed-in flow: the visitor authenticated first, so pricing
   * is visible from the start and Place Order books the delivery.
   * `guest` — reached straight from the landing without an account. The
   * agreement step also collects name + email, nothing below it (pricing
   * included) is revealed until those are confirmed, and Place Order asks them
   * to create an account before the booking goes through.
   */
  variant?: "default" | "guest";
  /** Admin mode: pass the customer directory to enable the customer step. */
  customers?: CustomerAccount[];
  /** Address prefill (customer/self mode). */
  defaultAddress?: Partial<AddressForm>;
  /** Where Cancel goes. */
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
  variant = "default",
  customers,
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
  const agreementSigned = useAgreementSigned();
  const signAgreement = useAppStore((s) => s.signAgreement);
  const certRef = useRef<HTMLInputElement>(null);

  const isCustomer = !customers;
  const isGuest = variant === "guest";
  // A guest hasn't signed anything yet, so they always get the full agreement.
  // Captured once so checking the box doesn't swap it out mid-flow.
  const [firstTime] = useState(isGuest || (isCustomer && !agreementSigned));
  const [accepted, setAccepted] = useState(
    isGuest ? false : !isCustomer || agreementSigned,
  );
  const [reviewing, setReviewing] = useState(false);

  /* Guest flow: who they are, collected alongside the agreement. Confirming
     these is what unlocks the rest of the form — and the pricing. */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [showAccountPw, setShowAccountPw] = useState(false);

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

  // What & how much — the product and quantity drive the live price.
  const [fuelType, setFuelType] = useState<FuelTypeId | null>(null);
  const [gallonsInput, setGallonsInput] = useState("");
  // Tax status — a valid DR-13/DR-97 on file exempts the order from FL sales tax.
  const [taxExempt, setTaxExempt] = useState<boolean | null>(
    business.dr97 ? true : null,
  );

  /* Guests must accept AND confirm their details; signed-in users just accept. */
  const guestDetailsValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(guestEmail.trim());
  const canConfirmDetails = accepted && guestDetailsValid;
  const gated = isGuest ? !detailsConfirmed : isCustomer && !accepted;
  /* Nothing is priced for a guest until we know who's asking. */
  const showPrices = !isGuest || detailsConfirmed;

  const addressLine = `${addr.house} ${addr.street}, ${addr.city}, ${addr.state}`;
  const rule = tier ? URGENCY_SCHEDULE[tier] : null;
  const refMonth = parseISO(REFERENCE_TODAY);
  const chosen = equipments
    .map((e) => ({ e, count: selectedUnitCount(e, deselected) }))
    .filter((x) => x.count > 0);
  const capacityGallons = chosen.reduce((s, x) => s + x.count * x.e.maxTankCapacity, 0);

  const isDef = fuelType === "def";
  const rawGallons = Math.max(0, Math.floor(Number(gallonsInput) || 0));
  // DEF is a flat service call capped at a 25-gallon top-off.
  const gallons = isDef ? Math.min(DEF_MAX, rawGallons) : rawGallons;
  const orderGallons = gallons;
  const cost = computeCost({
    fuelType,
    gallons,
    taxExempt: taxExempt === true,
    urgencyFee: tier ? URGENCY_OPTIONS[tier].fee : 0,
  });
  const quantityOk = gallons > 0;

  // Zip is optional (customer directory addresses don't include it).
  const addrValid = [addr.house, addr.street, addr.city, addr.state, addr.country].every(
    (v) => v.trim().length > 0,
  );
  const canPlace = Boolean(
    fuelType &&
      quantityOk &&
      tier &&
      dateISO &&
      win &&
      addrValid &&
      chosen.length > 0 &&
      (isGuest ? detailsConfirmed : isCustomer ? accepted : customer),
  );

  const set = <K extends keyof AddressForm>(k: K, v: string) =>
    setAddr((a) => ({ ...a, [k]: v }));

  // Auto-fill City / State from a US ZIP via the free Zippopotam.us API.
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
        if (reqId !== zipReq.current) return;
        const place = data.places?.[0];
        if (!place) {
          setZipStatus("error");
          return;
        }
        setAddr((a) => ({ ...a, city: place["place name"], state: place.state, country: "United States" }));
        setZipStatus("idle");
      })
      .catch(() => {
        if (reqId === zipReq.current) setZipStatus("error");
      });
  }

  function chooseTier(t: UrgencyTier) {
    setTier(t);
    setDateISO(null);
    setWin(null);
  }

  function chooseCustomer(c: CustomerAccount | null) {
    setCustomer(c);
    if (c) setAddr(parseAddress(c.address));
  }

  function acceptAgreement(v: boolean) {
    setAccepted(v);
    // A guest has no account to attach the signature to yet — it's recorded
    // when they create one in `createAccountAndPlace`. Writing to the store
    // here would also churn this component mid-flow and drop local state.
    if (v && !isGuest) signAgreement();
  }

  function onPickCert(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCert(file.name);
    setTaxExempt(true);
    updateBusiness({ dr97: file.name });
  }

  function finish() {
    if (!tier || !dateISO) return;
    addScheduledDelivery({
      dateISO,
      status: "scheduled",
      isEditable: true,
      address: addressLine,
      urgency: tier,
      gallonsScheduled: orderGallons,
      price: money(cost.total),
      equipment: chosen.map(({ e, count }) => ({
        name: e.name,
        units: count,
        gallonsMax: e.maxTankCapacity,
        fuelType: e.classification,
      })),
      notes: addr.notes.trim() || undefined,
      documents: cert
        ? [{ label: "DR-97 Tax-Exempt Certificate", filename: cert, url: "#" }]
        : undefined,
    });
    setDone(true);
  }

  /** Guest flow: the account is created as part of placing the first order. */
  function createAccountAndPlace() {
    if (accountPassword.length === 0) return;
    signAgreement();
    setAccountOpen(false);
    finish();
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
    <div className="min-h-dvh bg-neutral">
      <div className="mx-auto w-full max-w-[640px] px-5 pb-16 pt-8 sm:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/logo-horizontal.svg" alt="Fly by Night Fuel" width={180} height={48} priority className="h-11 w-auto" />
          <h1 className="mt-5 text-[26px] font-bold text-text-primary">Request a delivery</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Fill in the details below to schedule your fuel delivery.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          {/* Customer selection (admin) */}
          {customers && (
            <Section title="Who is the customer?" description="Select the customer this delivery is for.">
              <div className="flex flex-col gap-4 rounded-2xl bg-white p-5">
                <SearchInput value={query} onChange={setQuery} placeholder="Search customers…" />
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
            </Section>
          )}

          {/* Service Agreement — first time: full + gate; returning: review box */}
          {isCustomer && firstTime && (
            <Section
              title="Service Agreement & Terms"
              description="Please review and accept the agreement before requesting a delivery."
            >
              <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="max-h-[380px] overflow-y-auto rounded-xl border border-grey-500/16 p-4">
                  <ServiceAgreement />
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <span className="pt-0.5">
                    <Checkbox checked={accepted} onChange={acceptAgreement} aria-label="Accept the Service Agreement" />
                  </span>
                  <span className="text-sm text-text-primary">
                    I have read and agree to the{" "}
                    <span className="font-semibold">Service Agreement, Terms &amp; Conditions</span>, and I am
                    authorized to bind the customer. No delivery is made until this is accepted.
                  </span>
                </label>

                {/* Guest flow: we don't know who this is yet, so collect it here.
                    Confirming unlocks the rest of the form and the pricing. */}
                {isGuest && (
                  <div className="mt-5 border-t border-divider pt-5">
                    <p className="text-sm font-semibold text-text-primary">Who are we quoting?</p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      We&apos;ll show your price once we know who&apos;s asking.
                    </p>
                    <div className="mt-4 flex flex-col gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                          id="guest-first-name"
                          label="First name"
                          required
                          placeholder="Zoe"
                          value={firstName}
                          disabled={detailsConfirmed}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                        <TextField
                          id="guest-last-name"
                          label="Last name"
                          required
                          placeholder="Harris"
                          value={lastName}
                          disabled={detailsConfirmed}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                      <TextField
                        id="guest-email"
                        label="Email address"
                        required
                        type="email"
                        placeholder="zoe@company.com"
                        value={guestEmail}
                        disabled={detailsConfirmed}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </div>

                    {detailsConfirmed ? (
                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-success/8 px-4 py-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success/16 text-success-dark">
                          <CheckIcon size={16} />
                        </span>
                        <p className="min-w-0 flex-1 text-sm text-text-primary">
                          Thanks, <span className="font-semibold">{firstName}</span> — your pricing is
                          unlocked below.
                        </p>
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() => setDetailsConfirmed(false)}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="mt-4 w-full"
                        disabled={!canConfirmDetails}
                        onClick={() => setDetailsConfirmed(true)}
                      >
                        Confirm my details
                        <ArrowRightIcon size={20} />
                      </Button>
                    )}
                    {!accepted && guestDetailsValid && (
                      <p className="mt-2 text-xs font-medium text-secondary-dark">
                        Accept the Service Agreement above to continue.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}
          {isCustomer && !firstTime && (
            <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/16 text-success-dark">
                  <CheckIcon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">Service Agreement accepted</p>
                  <p className="text-xs text-text-secondary">Applies to all your deliveries.</p>
                </div>
                <button
                  onClick={() => setReviewing((r) => !r)}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary hover:bg-primary/8"
                >
                  Review
                  <ChevronDownIcon size={16} className={`transition-transform ${reviewing ? "rotate-180" : ""}`} />
                </button>
              </div>
              {reviewing && (
                <div className="mt-4 max-h-[380px] overflow-y-auto rounded-xl border border-grey-500/16 p-4">
                  <ServiceAgreement />
                </div>
              )}
            </div>
          )}

          {/* Everything below is gated until the agreement is accepted */}
          <div
            className={gated ? "pointer-events-none select-none opacity-40" : ""}
            aria-disabled={gated}
          >
            {gated && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-secondary-lighter px-4 py-3 text-sm font-semibold text-secondary-dark">
                <LockIcon size={18} className="shrink-0" />
                {isGuest
                  ? "Accept the agreement and confirm your details above to see pricing and continue."
                  : "Accept the Service Agreement above to continue."}
              </div>
            )}

            <div className="flex flex-col gap-8">
              <Section
                title="What are we bringing?"
                description="Pick the product for this delivery."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {FUEL_TYPES.map((f) => {
                    const selected = fuelType === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFuelType(f.id);
                          if (f.id === "def" && rawGallons > DEF_MAX) {
                            setGallonsInput(String(DEF_MAX));
                          }
                        }}
                        className={`flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                          selected
                            ? "border-primary bg-primary/8"
                            : "border-transparent bg-white hover:border-grey-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                              selected ? "bg-primary text-white" : "bg-primary/8 text-primary"
                            }`}
                          >
                            <DropletIcon size={20} />
                          </span>
                          {showPrices && (
                            <span className="text-right">
                              <span className="block text-lg font-bold text-text-primary">
                                {money(f.price)}
                              </span>
                              <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                                {f.badge}
                              </span>
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{f.name}</p>
                          <p className="mt-0.5 text-xs text-text-secondary">{f.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section
                title="How much?"
                description={
                  isDef
                    ? `DEF Top-Off is a flat service call — enter the top-off amount (up to ${DEF_MAX} gallons).`
                    : showPrices
                      ? "200-gallon minimum on off-road fuel. Your price appears the moment you type."
                      : "200-gallon minimum on off-road fuel."
                }
              >
                <div className="flex flex-col gap-3 rounded-2xl bg-white p-5">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label
                        htmlFor="gallons"
                        className="mb-1.5 block text-sm font-semibold text-text-primary"
                      >
                        Gallons {isDef && <span className="text-text-secondary">(max {DEF_MAX})</span>}
                      </label>
                      <input
                        id="gallons"
                        inputMode="numeric"
                        placeholder="0"
                        value={gallonsInput}
                        max={isDef ? DEF_MAX : undefined}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                          if (isDef) {
                            const n = Math.min(DEF_MAX, Number(digits) || 0);
                            setGallonsInput(n ? String(n) : "");
                          } else {
                            setGallonsInput(digits);
                          }
                        }}
                        disabled={!fuelType}
                        className="w-full rounded-lg border border-grey-300 bg-white px-3 py-2.5 text-2xl font-bold text-text-primary outline-none transition-colors placeholder:text-text-disabled focus:border-primary disabled:opacity-50"
                      />
                    </div>
                    {showPrices && (
                      <div className="pb-2 text-right">
                        <p className="text-2xl font-bold text-primary">{money(cost.fuel)}</p>
                        <p className="text-xs text-text-secondary">
                          {isDef
                            ? `flat service · up to ${DEF_MAX} gal`
                            : `${gallons} gal × ${money(OFF_ROAD_PRICE)}/gal`}
                        </p>
                      </div>
                    )}
                  </div>
                  {isDef && (
                    <p className="text-xs text-text-secondary">
                      Billed per visit regardless of the exact quantity dispensed, up to {DEF_MAX} gallons.
                    </p>
                  )}
                  {!isDef && cost.belowMinimum && (
                    <div className="flex items-start gap-2 rounded-xl bg-secondary-lighter px-3 py-2.5 text-xs font-medium text-secondary-dark">
                      <span aria-hidden>⚠</span>
                      <span>
                        {showPrices ? (
                          <>
                            Below the {OFF_ROAD_MIN}-gallon minimum — a $150 small-order fee
                            applies (per your Service Agreement §4).
                          </>
                        ) : (
                          <>
                            Below the {OFF_ROAD_MIN}-gallon minimum — a small-order fee applies
                            (per Service Agreement §4).
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </Section>

              <Section title="How urgent is the delivery?" description="Choose how quickly you need this fuel delivery.">
                <UrgencyPicker value={tier} onChange={chooseTier} showFee={showPrices} />
              </Section>

              <Section title="When do you want the delivery?" description="Select the date and time slot for the delivery.">
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
              </Section>

              <Section title="Fuel Delivery Location" description="Where should we deliver the fuel?">
                <div className="flex flex-col gap-4 rounded-2xl bg-white p-5">
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
                    placeholder="Please also provide information on how to access the equipment."
                    value={addr.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </div>
              </Section>

              <Section
                title="Your Equipment"
                description="Add and select the equipment you plan to fuel."
              >
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
                      <div className="flex items-center gap-2 rounded-xl bg-primary/8 px-3 py-3 text-sm text-primary-darker">
                        <LocationIcon size={18} className="shrink-0 text-primary" />
                        <span>
                          Delivery to <span className="font-semibold">{addressLine}</span>. All equipment
                          should be at the same location.
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Section>

              <Section
                title="Tax status"
                description="Off-road dyed diesel is subject to Florida sales tax unless you have a valid exemption certificate on file (DR-13 resale or DR-97 agricultural)."
              >
                <input ref={certRef} type="file" className="hidden" onChange={onPickCert} />
                <div className="flex flex-col gap-3">
                  <div
                    className={`rounded-2xl border-2 p-4 transition-colors ${
                      taxExempt === true
                        ? "border-primary bg-primary/8"
                        : "border-transparent bg-white hover:border-grey-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setTaxExempt(true)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                          taxExempt === true ? "border-primary bg-primary text-white" : "border-grey-400"
                        }`}
                      >
                        {taxExempt === true && <CheckIcon size={12} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-text-primary">
                          Yes — I have a DR-13 or DR-97
                        </span>
                        <span className="mt-0.5 block text-xs text-text-secondary">
                          Upload it once and we&apos;ll apply your exemption to every order.
                        </span>
                      </span>
                    </button>

                    {taxExempt === true &&
                      (cert ? (
                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-neutral p-4">
                          <FilePdfIcon size={30} className="shrink-0 text-error" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-text-primary">{cert}</p>
                            <p className="text-xs text-text-secondary">
                              On file — applies to all your deliveries
                            </p>
                          </div>
                          <Button variant="soft" size="sm" onClick={() => certRef.current?.click()}>
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => certRef.current?.click()}
                          className="mt-3 flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-grey-400 bg-neutral py-6 text-sm transition-colors hover:bg-grey-500/8"
                        >
                          <UploadIcon size={22} className="text-grey-500" />
                          <span className="font-semibold text-text-primary">
                            📎 Tap to upload your certificate (PDF or photo)
                          </span>
                          <span className="text-xs text-text-secondary">DR-13 resale or DR-97 agricultural</span>
                        </button>
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setTaxExempt(false)}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                      taxExempt === false
                        ? "border-primary bg-primary/8"
                        : "border-transparent bg-white hover:border-grey-300"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                        taxExempt === false ? "border-primary bg-primary text-white" : "border-grey-400"
                      }`}
                    >
                      {taxExempt === false && <CheckIcon size={12} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-text-primary">No certificate</span>
                      <span className="mt-0.5 block text-xs text-text-secondary">
                        Standard Florida sales tax (6.5%) will apply to taxable fuel.
                      </span>
                    </span>
                  </button>
                </div>
              </Section>

            </div>
          </div>

          {/* Summary + actions */}
          <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-bold text-text-primary">Request summary</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Fuel type</dt>
                <dd className="text-right font-semibold text-text-primary">
                  {fuelType ? FUEL_TYPES.find((f) => f.id === fuelType)?.name : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Quantity</dt>
                <dd className="text-right font-semibold text-text-primary">
                  {fuelType && gallons > 0
                    ? isDef
                      ? `${gallons} gal · flat service`
                      : `${gallons} gal`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Delivery address</dt>
                <dd className="text-right font-semibold text-text-primary">{addrValid ? addressLine : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Scheduled for</dt>
                <dd className="text-right font-semibold text-text-primary">
                  {dateISO && win ? `${formatLongDate(dateISO)} · ${win}` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Urgency</dt>
                <dd className="text-right font-semibold text-text-primary">
                  {tier
                    ? showPrices
                      ? `${URGENCY_OPTIONS[tier].title} · ${feeLabel(URGENCY_OPTIONS[tier].fee)}`
                      : URGENCY_OPTIONS[tier].title
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Equipment</dt>
                <dd className="text-right font-semibold text-text-primary">
                  {chosen.length ? `${chosen.length} · up to ${capacityGallons} gal` : "—"}
                </dd>
              </div>
            </dl>

            {/* Cost breakdown — withheld from a guest until they identify themselves */}
            {showPrices && fuelType && quantityOk && (
              <dl className="mt-4 flex flex-col gap-2 border-t border-divider pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">
                    {isDef ? "DEF Top-Off — flat service" : `Fuel — ${gallons} gal`}
                  </dt>
                  <dd className="font-semibold text-text-primary">{money(cost.fuel)}</dd>
                </div>
                {cost.smallOrder > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Small-order fee (under {OFF_ROAD_MIN} gal)</dt>
                    <dd className="font-semibold text-text-primary">{money(cost.smallOrder)}</dd>
                  </div>
                )}
                {cost.urgency > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Delivery speed</dt>
                    <dd className="font-semibold text-text-primary">{money(cost.urgency)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-text-secondary">FL sales tax (6.5%)</dt>
                  <dd className="font-semibold text-text-primary">
                    {taxExempt === true ? (
                      <span className="text-success-dark">EXEMPT ✓</span>
                    ) : (
                      money(cost.tax)
                    )}
                  </dd>
                </div>
                <div className="mt-1 flex justify-between gap-4 border-t border-divider pt-3">
                  <dt className="text-base font-bold text-text-primary">Total</dt>
                  <dd className="text-base font-bold text-text-primary">{money(cost.total)}</dd>
                </div>
              </dl>
            )}

            {!showPrices && (
              <p className="mt-4 rounded-xl bg-secondary-lighter px-4 py-3 text-xs font-medium text-secondary-dark">
                Confirm your details above to see your price.
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Button variant="soft" size="lg" onClick={() => router.push(cancelHref)}>
                Cancel
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={!canPlace}
                onClick={() => (isGuest ? setAccountOpen(true) : finish())}
              >
                Place Order
                <ArrowRightIcon size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Adding / editing an equipment both use the same modal. */}
      <EquipmentModal
        open={adding || Boolean(editEquip)}
        equipment={editEquip}
        onClose={() => {
          setAdding(false);
          setEditEquip(null);
        }}
        location={addressLine}
      />

      {/* Guest flow: the order is what prompts them to create the account. */}
      <Modal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        title="Create your account to place your order"
        footer={
          <div className="flex w-full gap-3">
            <Button variant="soft" size="lg" onClick={() => setAccountOpen(false)}>
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={accountPassword.length === 0}
              onClick={createAccountAndPlace}
            >
              Create account &amp; place order
              <ArrowRightIcon size={20} />
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <p className="text-sm text-text-secondary">
            We&apos;ll use these to send your delivery ticket and invoice. Just pick a password
            and your order is in.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="account-first-name"
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              id="account-last-name"
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <TextField
            id="account-email"
            label="Email address"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
          <div className="relative">
            <TextField
              id="account-password"
              label="Password"
              type={showAccountPw ? "text" : "password"}
              placeholder="Choose a password"
              autoComplete="new-password"
              value={accountPassword}
              onChange={(e) => setAccountPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showAccountPw ? "Hide password" : "Show password"}
              onClick={() => setShowAccountPw((s) => !s)}
              className="absolute right-2 top-[30px] grid h-9 w-9 place-items-center rounded-full text-grey-600 hover:bg-grey-500/8"
            >
              <EyeIcon size={20} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
