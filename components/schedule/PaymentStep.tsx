"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/Field";
import {
  ArrowRightIcon,
  CashIcon,
  CreditCardIcon,
  InfoIcon,
  LockIcon,
} from "@/components/ui/Icon";
import {
  CONVENIENCE_FEE_FLAT,
  CONVENIENCE_FEE_RATE,
  DEF_MAX,
  OFF_ROAD_MIN,
  money,
  type CostBreakdown,
} from "@/lib/data/pricing";
import { REFERENCE_TODAY } from "@/lib/data/schedule";
import {
  cardBrand,
  cardErrors,
  formatCardNumber,
  formatExpiry,
  type CardForm,
  type PaymentMethod,
} from "@/lib/data/payment";

const FEE_TERMS = `${CONVENIENCE_FEE_RATE * 100}% of the fuel and fees plus $${CONVENIENCE_FEE_FLAT}`;

/** Radio card for the pay-now / pay-later choice — same look as the urgency cards. */
function ChoiceCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors ${
        selected
          ? "border-2 border-primary bg-primary-lighter"
          : "border-2 border-transparent bg-white hover:bg-grey-500/8"
      }`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-grey-400"
        }`}
      >
        {selected && <span className="h-3 w-3 rounded-full bg-primary" />}
      </span>
      <Icon size={24} className={selected ? "text-primary" : "text-grey-600"} />
      <div className="flex-1">
        <p className={`text-[17px] font-bold ${selected ? "text-primary-darker" : "text-text-primary"}`}>
          {title}
        </p>
        <p className={`text-sm ${selected ? "text-primary-dark" : "text-text-secondary"}`}>
          {description}
        </p>
      </div>
    </button>
  );
}

function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
    </div>
  );
}

function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? "text-base font-bold text-text-primary" : "text-text-secondary"}>{label}</dt>
      <dd className={strong ? "text-base font-bold text-text-primary" : "font-semibold text-text-primary"}>
        {children}
      </dd>
    </div>
  );
}

const Exempt = () => <span className="text-success-dark">EXEMPT ✓</span>;

/**
 * Second page of the customer request: how the delivery will be paid. A card is
 * optional — the customer can settle on delivery instead — so the choice leads
 * the page and the card form only appears when they pick "Add a card now".
 */
export function PaymentStep({
  cost,
  gallons,
  taxExempt,
  method,
  onMethodChange,
  card,
  onCardChange,
  onBack,
  onPlace,
}: {
  cost: CostBreakdown;
  gallons: number;
  taxExempt: boolean;
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  card: CardForm;
  onCardChange: (c: CardForm) => void;
  onBack: () => void;
  onPlace: () => void;
}) {
  // Errors stay quiet until the customer first tries to place the order.
  const [tried, setTried] = useState(false);

  const payingByCard = method === "card";
  const errors = payingByCard ? cardErrors(card, REFERENCE_TODAY) : {};
  const shown = tried ? errors : {};
  const brand = cardBrand(card.number);
  const amex = brand === "American Express";

  const set = <K extends keyof CardForm>(k: K, v: CardForm[K]) => onCardChange({ ...card, [k]: v });

  function place() {
    setTried(true);
    if (Object.keys(errors).length === 0) onPlace();
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-5 pb-16 pt-8 sm:px-8">
      <div className="flex flex-col items-center text-center">
        <Image src="/brand/logo-horizontal.svg" alt="Fly by Night Fuel" width={180} height={48} priority className="h-11 w-auto" />
        <h1 className="mt-5 text-[26px] font-bold text-text-primary">Payment method</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Adding a card is optional — nothing is charged until the delivery is invoiced.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 id="pay-choice" className="text-xl font-bold text-text-primary">
            How would you like to pay?
          </h2>
          <div role="radiogroup" aria-labelledby="pay-choice" className="flex flex-col gap-3">
            <ChoiceCard
              icon={CreditCardIcon}
              title="Add a card now"
              description="Saved securely and charged automatically once the delivery is invoiced."
              selected={payingByCard}
              onClick={() => onMethodChange("card")}
            />
            <ChoiceCard
              icon={CashIcon}
              title="Pay on delivery"
              description="Settle the invoice when the fuel is delivered. You can add a card later."
              selected={!payingByCard}
              onClick={() => onMethodChange("on_delivery")}
            />
          </div>
        </section>

        {payingByCard && (
          <section className="flex flex-col gap-4">
            <Heading
              title="Card details"
              description="Visa, Mastercard, American Express and Discover are accepted."
            />
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-5">
              <TextField
                id="card-name"
                label="Name on card"
                autoComplete="cc-name"
                value={card.name}
                onChange={(e) => set("name", e.target.value)}
                error={shown.name}
              />
              <div className="relative">
                <TextField
                  id="card-number"
                  label="Card number"
                  autoComplete="cc-number"
                  inputMode="numeric"
                  placeholder="1234 1234 1234 1234"
                  value={card.number}
                  onChange={(e) => set("number", formatCardNumber(e.target.value))}
                  error={shown.number}
                />
                <span className="pointer-events-none absolute right-3 top-[38px] flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  {brand && <span>{brand === "American Express" ? "Amex" : brand}</span>}
                  <CreditCardIcon size={20} className="text-grey-500" />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  id="card-expiry"
                  label="Expiry date"
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  placeholder="MM / YY"
                  value={card.expiry}
                  onChange={(e) => set("expiry", formatExpiry(e.target.value))}
                  error={shown.expiry}
                />
                <TextField
                  id="card-cvc"
                  label="CVC"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  placeholder={amex ? "1234" : "123"}
                  value={card.cvc}
                  onChange={(e) => set("cvc", e.target.value.replace(/\D/g, "").slice(0, amex ? 4 : 3))}
                  error={shown.cvc}
                />
              </div>
              <TextField
                id="card-zip"
                label="Billing ZIP code"
                autoComplete="postal-code"
                inputMode="numeric"
                value={card.zip}
                onChange={(e) => set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                error={shown.zip}
              />
              <div className="flex items-center gap-3 text-text-primary">
                <Checkbox
                  checked={card.save}
                  onChange={(v) => set("save", v)}
                  aria-label="Save this card for future deliveries"
                />
                <span className="cursor-pointer select-none" onClick={() => set("save", !card.save)}>
                  Save this card for future deliveries
                </span>
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs text-text-secondary">
              <LockIcon size={16} className="mt-px shrink-0 text-grey-600" />
              Payments are processed securely by our payment provider. We never see or store your full card number.
            </p>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <Heading
            title="Order summary"
            description="An estimate from your request. The invoice uses the gallons actually delivered."
          />
          <div className="flex items-start gap-3 rounded-xl border border-info/24 bg-info/8 px-4 py-3 text-sm text-[#006c9c]">
            <InfoIcon size={20} className="mt-px shrink-0 text-info" />
            <span>
              {payingByCard
                ? `Card payments carry a processing fee of ${FEE_TERMS}. Sales tax applies to it, and it's included in the total below.`
                : `Paying by card at delivery adds a processing fee of ${FEE_TERMS}, plus sales tax on it, to the invoice.`}
            </span>
          </div>
          <dl className="flex flex-col gap-3 rounded-2xl bg-white p-5 text-sm">
            <Row label={`Fuel — ${gallons} gal`}>{money(cost.fuel)}</Row>
            {cost.smallOrder > 0 && (
              <Row label={`Small-order fee (under ${OFF_ROAD_MIN} gal)`}>{money(cost.smallOrder)}</Row>
            )}
            {cost.urgency > 0 && <Row label="Delivery speed">{money(cost.urgency)}</Row>}
            {cost.def > 0 && <Row label={`DEF top-off (up to ${DEF_MAX} gal)`}>{money(cost.def)}</Row>}
            {/* The card fee is figured on the fuel and fees, then taxed with them. */}
            {payingByCard && (
              <Row label={`Card processing fee (${CONVENIENCE_FEE_RATE * 100}% + $${CONVENIENCE_FEE_FLAT})`}>
                {money(cost.cardFee)}
              </Row>
            )}
            <div className="border-t border-divider" />
            <Row label="Subtotal">{money(cost.taxable)}</Row>
            <Row label="Florida sales tax (6%)">{taxExempt ? <Exempt /> : money(cost.stateTax)}</Row>
            <Row label="Palm Beach County surtax (0.5%)">{taxExempt ? <Exempt /> : money(cost.countyTax)}</Row>
            <div className="border-t border-divider" />
            <Row label="Estimated total" strong>
              {money(cost.total)}
            </Row>
          </dl>
        </section>

        <div className="flex gap-3">
          <Button variant="soft" size="lg" onClick={onBack}>
            Back to request
          </Button>
          <Button size="lg" className="flex-1" onClick={place}>
            Place Order
            <ArrowRightIcon size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
