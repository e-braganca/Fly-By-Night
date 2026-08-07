/*
  Landing-page copy and links — the single place to edit marketing content.
  Kept separate from the layout so the landing folder can be lifted out into
  its own deploy later without touching the product app.

  Source of truth: Figma "Landing — Fly by Night Fuel" (node 18577:95364).
*/

export const PHONE = "561-602-8026";
export const PHONE_LABEL = `Call Alex: ${PHONE}`;
export const TEL = "tel:5616028026";

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

/** Trust strip — gold Iconly marks on the blue band. */
export const TRUST = [
  { icon: "checkBadge" as const, label: "Licensed & Insured" },
  { icon: "pin" as const, label: "Palm Beach County Local" },
  { icon: "nozzle" as const, label: "State-Certified Metered Delivery" },
  { icon: "dollar" as const, label: "What You See Is What You Pay" },
];

/** The blue promise band that sits under the trust strip. */
export const PRICING_PROMISE = {
  title: "The Fly-by-Night Pricing Promise",
  items: ["No hidden fees", "Zero Delivery Cost", "No contracts required"],
};

/** Service cards — six segments, each with its own photo and quote CTA. */
export const SEGMENTS = [
  {
    img: "/landing/seg-equestrian.jpg",
    alt: "Fly by Night Fuel truck fuelling equipment at a Wellington polo farm",
    eyebrow: "Polo Stables & Farm Equipment",
    title: "Equestrian Estates",
    desc: "Delivering dyed diesel directly to premier equestrian properties. We fuel tractors, stand-alone tanks, generators, and farm equipment with absolute precision, navigating active polo farms safely around world-class horses.",
  },
  {
    img: "/landing/seg-estate.jpg",
    alt: "Fuelling a standby generator at a Palm Beach estate",
    eyebrow: "Palm Beach Estate Generators",
    title: "Palm Beach Estate Generators",
    desc: "Protecting Palm Beach's luxury estates and stand-alone critical systems. When hurricane or storm outages hit, we dispatch our rugged white Dodge 4500 rig to fuel backup generators, cell towers, and critical care facilities, ensuring continuous power.",
  },
  {
    img: "/landing/seg-condo.jpg",
    alt: "Refuelling a high-rise condominium standby generator",
    eyebrow: "High-Rise Standby Generators",
    title: "Luxury Condo Power Systems",
    desc: "Power protection for luxury Palm Beach high-rise condominiums. We dispatch in emergency outages to keep standby generators running, ensuring residents maintain full AC, elevator access, and critical safety power.",
  },
  {
    img: "/landing/seg-hospital.jpg",
    alt: "Fuelling a hospital emergency backup generator at night",
    eyebrow: "Critical Life-Support Power",
    title: "Hospital Emergency Backup",
    desc: "Guaranteed critical fuel delivery for Palm Beach County hospitals, surgical centers, and emergency response clinics. When municipal grids fail, we ensure life-support backup generators stay continuously fueled.",
  },
  {
    img: "/landing/seg-agriculture.jpg",
    alt: "Refuelling a sugar cane harvester in a South Florida field",
    eyebrow: "Heavy Harvesters & Tractors",
    title: "Heavy AG and Farming Support",
    desc: "Keeping South Florida's agriculture running. We bring high-volume off-road diesel directly to the fields, fueling sugar cane harvesters, heavy tractors, and field equipment on-site so your operations never miss a beat.",
  },
  {
    img: "/landing/seg-construction.jpg",
    alt: "Fuelling an excavator on a commercial construction site",
    eyebrow: "Excavators & Heavy Equipment",
    title: "Construction Support",
    desc: "Fueling excavators, bulldozers, and site equipment on local developments and commercial construction projects. We keep the job moving while your crew stays focused on the build. Transparent pricing, direct tank transfers, and zero hidden delivery fees.",
  },
];

/** Shared footer label on every service card. */
export const SEGMENT_FOOTER_LABEL = "On-Demand Dispatch";
export const SEGMENT_CTA = "Get Quote";

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

/** Safety & compliance band. The credential names render in accent bold. */
export const COMPLIANCE = {
  eyebrow: "Safety Compliance",
  title: "Commercial safety standards",
  desc: "Fuel dispatch requires absolute compliance. We maintain elite safety certifications to guarantee a clean, secure, and compliant transfer every time.",
  cardTitle: "COMPLIANCE & CREDENTIALS",
  cardSubtitle: "PALM BEACH COUNTY, FL",
  /** Rendered as one paragraph; `strong` spans are highlighted in accent. */
  credentials: [
    { text: "We maintain elite safety certifications to guarantee a clean, secure, and compliant transfer every time: " },
    { text: "HAZMAT Certified Operator", strong: true },
    { text: " (Alex Morrison), " },
    { text: "Registered Commercial Rig", strong: true },
    { text: " (2023 Dodge 4500 & 1000g Trailer), and " },
    { text: "Fully Insured Transfers", strong: true },
    { text: " with comprehensive commercial liability and environmental policies." },
  ],
};

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

/** Meet-the-owner block. */
export const OWNER = {
  photo: "/landing/alex.jpg",
  name: "Alex Morrison",
  role: "Owner & Operator",
  badges: ["CDL Holder", "HAZMAT Certified"],
  eyebrow: "Meet the Owner",
  headingLead: "The man behind",
  headingAccent: "the dispatch",
  byline: "ALEX MORRISON · OWNER / OPERATOR",
  bio: [
    "As a resident of Palm Beach County, I'm committed to serving this community and meeting the needs of the companies that keep it running and growing to its fullest potential.",
    "I've spent the last fifteen years in agricultural dealerships as a mechanic, parts man, and salesman. After that, I toured the country telling stories of the hard working, red-blooded Americans that keep this place going — on stages around the country.",
    "Now I want to bring all my training, certifications, and skills to you in the great state of Florida.",
    "I've worked on and fueled up thousands of machines over the years, and now I'm ready to bring that same energy and success to your business. Let us know how we can help fuel your business forward today.",
  ],
  tail: "The name's a joke. Showing up on time, metering it right, and charging you fair — that part's dead serious.",
};
