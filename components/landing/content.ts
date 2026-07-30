/*
  Landing-page copy and links — the single place to edit marketing content.
  Kept separate from the layout so the landing folder can be lifted out into
  its own deploy later without touching the product app.
*/

export const PHONE = "561-602-8026";
export const TEL = "tel:5616028026";
export const SMS =
  "sms:5616028026&body=Hi%2C%20I%27d%20like%20to%20schedule%20a%20fuel%20delivery.";

/* The landing is the app's front door, so both actions are internal routes.
   They stay two distinct entry points:
   - REQUEST_URL signs the user in and drops them straight into the request
     wizard (Service Agreement first).
   - SIGNIN_URL is the plain sign-in / register path to their dashboard. */
export const REQUEST_URL = "/login?next=schedule";
export const SIGNIN_URL = "/login";

/* Alternative request flow, reached by loading the landing as `/?v=2`: skip
   sign-in entirely and go straight to the wizard, which then collects name +
   email in place of an account. Lets both flows be demoed from one deploy. */
export const REQUEST_URL_GUEST = "/customer-schedule?v=2";

/** Which request flow this visitor gets, from the landing's own `?v=`. */
export function requestUrlFor(variant: string | null): string {
  return variant === "2" ? REQUEST_URL_GUEST : REQUEST_URL;
}

export const NAV = [
  { href: "#services", label: "Services" },
  { href: "#serve", label: "Who We Serve" },
  { href: "#how", label: "How It Works" },
  { href: "#coverage", label: "Coverage" },
];

/** Trust strip — gold Iconly marks, not bullets. */
export const TRUST = [
  { icon: "checkBadge" as const, label: "Licensed & Insured" },
  { icon: "pin" as const, label: "Palm Beach County Local" },
  { icon: "nozzle" as const, label: "State-Certified Metered Delivery" },
  { icon: "dollar" as const, label: "What You See Is What You Pay" },
];

export const SERVICES = [
  {
    icon: "gasStation" as const,
    title: "Off-Road Dyed Diesel",
    desc: "Red-dyed ULSD is delivered and metered on-site for use in equipment, storage tanks, generators, and off-highway applications.",
  },
  {
    icon: "rainDrop" as const,
    title: "DEF Top-Off",
    desc: "On-site Diesel Exhaust Fluid service at a flat per-visit rate. We keep your SCR systems topped and running clean.",
  },
  {
    icon: "moon" as const,
    title: "After-Hours & Emergency",
    desc: "Down and out of fuel? Emergency call-out with a 4-hour turnaround, plus scheduled evening and weekend windows.",
  },
  {
    icon: "flash" as const,
    title: "Generator & Standby",
    desc: "Ensure continuous power supply with standby generator fueling for estates, facilities, and critical sites before, during, and after the storm.",
  },
];

export const SEGMENTS = [
  {
    img: "/landing/construction.jpg",
    alt: "Fly by Night Fuel tanker fueling a CAT excavator at a construction site",
    title: "Construction & Site Iron",
    desc: "Excavators, dozers, loaders, light towers, compactors — wet-hosed at the jobsite so the fleet never waits on a fuel run.",
  },
  {
    img: "/landing/standby.jpg",
    alt: "Technician fueling a Kohler standby generator from a Fly by Night Fuel tanker",
    title: "Standby & Prime Power",
    desc: "Gensets for estates, ALFs, data centers, and critical facilities. Keep-full programs and storm plans — run-time never in question.",
  },
  {
    img: "/landing/agriculture.jpg",
    alt: "Fly by Night Fuel tanker refueling a John Deere combine at sunset",
    title: "Agriculture & Estates",
    desc: "Ag pumps, groundskeeping fleets, barns, and backup power across the county's growing corridor and estate country.",
  },
  {
    img: "/landing/fleets.jpg",
    alt: "Fly by Night Fuel tanker filling an on-site bulk tank at a manufacturing plant",
    title: "Fleets & Bulk Tanks",
    desc: "Off-road fleets, equipment yards, and on-site bulk tanks, a cardlock alternative that rolls to you and meters every gallon.",
  },
];

export const STEPS = [
  {
    num: "1",
    title: "Schedule",
    desc: "Book in the app or call dispatch. Tell us the fuel, the gallons, the site, and when — standard, after-hours, or 4-hour emergency.",
  },
  {
    num: "2",
    title: "We Deliver",
    desc: "We roll to your location and dispense through a state-certified meter, right into your tank or equipment. You get the exact gallons.",
  },
  {
    num: "3",
    title: "Transparent Invoice",
    desc: "One honest per-gallon price, no hidden fees. Payment on delivery, with a clean PDF invoice every single time.",
  },
];

export const PROMISE_POINTS = [
  "Today's delivered per-gallon price, quoted before we roll",
  "Metered at your site — you pay for exactly what's dispensed",
  "Clear fees for after-hours and emergency, disclosed up front",
  "PDF invoice on every delivery for clean books",
];

/** `hot` chips are the home-base cities, drawn in the accent colour. */
export const COVERAGE = [
  { label: "Royal Palm Beach", hot: true },
  { label: "Wellington", hot: true },
  { label: "Loxahatchee", hot: false },
  { label: "West Palm Beach", hot: false },
  { label: "Jupiter", hot: false },
  { label: "Boca Raton", hot: false },
  { label: "Delray Beach", hot: false },
  { label: "Belle Glade", hot: false },
  { label: "Lake Worth", hot: false },
  { label: "Boynton Beach", hot: false },
  { label: "Greenacres", hot: false },
  { label: "Palm Beach Gardens", hot: false },
  { label: "Riviera Beach", hot: false },
  { label: "+ surrounding areas", hot: false },
];

export const FAQ = [
  {
    q: "What's the minimum order?",
    a: "No minimum. We'll fill a single machine or a 500-gallon tank — same on-time service either way. Volume accounts get sharper per-gallon pricing.",
  },
  {
    q: "How do I know I'm getting the right gallons?",
    a: "Every delivery is dispensed through a state-certified meter on the truck. You watch the meter, you get the ticket — what's dispensed is what's billed, and a clean PDF invoice lands on every delivery.",
  },
  {
    q: "What about pricing — any surprise fees?",
    a: "One honest delivered per-gallon rate, quoted before we roll. After-hours and emergency surcharges are disclosed up front. What you see is what you pay — no mystery line items after the fact.",
  },
  {
    q: "Can you handle emergencies and storm season?",
    a: "Yes. 4-hour emergency call-out, plus keep-full programs and hurricane fuel plans so your standby power has run-time when the grid drops and the majors stop answering the phone.",
  },
  {
    q: "Are you licensed and compliant?",
    a: "Licensed and insured, operating as Fueling Around LLC. Off-road dyed diesel is sold for lawful off-highway use, delivered under Florida fuel and environmental compliance.",
  },
  {
    q: "Small account or one-off — will you still show up?",
    a: "We're owner-operated and local. Volume accounts get sharper per-gallon pricing, but the single-machine job and the one-tank top-off get the same on-time service.",
  },
];
