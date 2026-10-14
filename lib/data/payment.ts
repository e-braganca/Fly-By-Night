/*
  Payment method collected after a delivery request. Card is the only method
  for now, and it's optional: the customer can also settle on delivery.

  Nothing here talks to a processor — the card is validated client-side and only
  its brand + last four digits are kept on the delivery.
*/

export type PaymentMethod = "card" | "on_delivery";

export type CardBrand = "Visa" | "Mastercard" | "American Express" | "Discover";

export type CardForm = {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  zip: string;
  save: boolean;
};

export const EMPTY_CARD: CardForm = {
  name: "",
  number: "",
  expiry: "",
  cvc: "",
  zip: "",
  save: true,
};

/** What the delivery keeps about how it will be paid. */
export type DeliveryPayment =
  | { method: "on_delivery" }
  | { method: "card"; brand: CardBrand | null; last4: string; saved: boolean };

const digits = (s: string) => s.replace(/\D/g, "");

export function cardBrand(number: string): CardBrand | null {
  const d = digits(number);
  if (/^4/.test(d)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "American Express";
  if (/^(6011|65|64[4-9])/.test(d)) return "Discover";
  return null;
}

const isAmex = (number: string) => cardBrand(number) === "American Express";

/** "4242424242424242" → "4242 4242 4242 4242"; Amex groups 4-6-5. */
export function formatCardNumber(raw: string): string {
  const d = digits(raw).slice(0, isAmex(raw) ? 15 : 16);
  if (isAmex(d)) return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(" ");
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "0828" → "08 / 28" */
export function formatExpiry(raw: string): string {
  const d = digits(raw).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

function luhn(d: string): boolean {
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

/** Per-field problems, or an empty object when the card can be used. */
export function cardErrors(card: CardForm, todayISO: string): Partial<Record<keyof CardForm, string>> {
  const errors: Partial<Record<keyof CardForm, string>> = {};
  const number = digits(card.number);
  const amex = isAmex(number);

  if (!card.name.trim()) errors.name = "Enter the name on the card.";

  if (!number) errors.number = "Enter the card number.";
  else if (number.length !== (amex ? 15 : 16) || !luhn(number))
    errors.number = "This card number isn't valid.";

  const [mm, yy] = [digits(card.expiry).slice(0, 2), digits(card.expiry).slice(2, 4)];
  const month = Number(mm);
  if (mm.length < 2 || yy.length < 2 || month < 1 || month > 12) {
    errors.expiry = "Use MM / YY.";
  } else {
    const [ty, tm] = todayISO.split("-").map(Number);
    const year = 2000 + Number(yy);
    if (year < ty || (year === ty && month < tm)) errors.expiry = "This card has expired.";
  }

  if (digits(card.cvc).length !== (amex ? 4 : 3))
    errors.cvc = amex ? "4 digits on the front." : "3 digits on the back.";

  if (digits(card.zip).length !== 5) errors.zip = "Enter a 5-digit ZIP code.";

  return errors;
}

export function deliveryPayment(method: PaymentMethod, card: CardForm): DeliveryPayment {
  if (method === "on_delivery") return { method };
  return {
    method,
    brand: cardBrand(card.number),
    last4: digits(card.number).slice(-4),
    saved: card.save,
  };
}
