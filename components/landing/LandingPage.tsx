import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/landing/Button";
import { RequestButton, RequestLink } from "@/components/landing/RequestCta";
import {
  PHONE,
  TEL,
  SMS,
  SIGNIN_URL,
  NAV,
  TRUST,
  SERVICES,
  SEGMENTS,
  STEPS,
  PROMISE_POINTS,
  COVERAGE,
  FAQ,
} from "@/components/landing/content";
import {
  GasStationIcon,
  RainDropIcon,
  MoonIcon,
  FlashIcon,
  CheckBadgeIcon,
  PinIcon,
  NozzleIcon,
  DollarIcon,
  PhoneIcon,
  ChatIcon,
} from "@/components/landing/Icons";

const SERVICE_ICONS = {
  gasStation: GasStationIcon,
  rainDrop: RainDropIcon,
  moon: MoonIcon,
  flash: FlashIcon,
};

const TRUST_ICONS = {
  checkBadge: CheckBadgeIcon,
  pin: PinIcon,
  nozzle: NozzleIcon,
  dollar: DollarIcon,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.28em] text-[var(--l-accent)]">
      {children}
    </div>
  );
}

/** Centered section header used by most sections (Coverage lays out its own). */
function SectionHeading({
  eyebrow,
  children,
  sub,
}: {
  eyebrow: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-[660px] text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-[clamp(30px,4.4vw,44px)] font-bold leading-tight text-[var(--l-heading)]">
        {children}
      </h2>
      {sub && <p className="mt-4 text-[17px] text-[var(--l-muted)]">{sub}</p>}
    </div>
  );
}

/** Marketing front door — the app's entry point at `/`. */
export function LandingPage() {
  const logo = "/brand/logo-horizontal.svg";
  const vertical = "/brand/vertical.svg";

  return (
    <div
      data-landing-theme="light"
      className="min-h-dvh overflow-x-clip bg-[var(--l-page)] font-sans text-[var(--l-text)]"
      style={{ lineHeight: 1.6 }}
    >
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-50 border-b border-[var(--l-border)] bg-[color-mix(in_srgb,var(--l-page)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1344px] items-center justify-between gap-4 px-6 py-3">
          <a href="#top" className="flex shrink-0 items-center gap-3">
            <Image src={logo} alt="Fly by Night Fuel" width={139} height={38} priority className="h-9 w-auto" />
          </a>

          <nav className="hidden items-center gap-7 text-[14.5px] font-medium lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--l-muted)] transition-colors hover:text-[var(--l-accent)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Two distinct entry points: sign in, or jump into the request flow. */}
          <div className="flex items-center gap-3">
            <a
              href={TEL}
              className="hidden font-display text-[17px] font-bold tracking-wide text-[var(--l-accent)] xl:inline"
            >
              {PHONE}
            </a>
            {/* Wrapped, not classed: `hidden` on the Button itself would fight
                its base `inline-flex` (same utility layer, order decides).
                Below `sm` this collapses and the footer carries sign-in. */}
            <span className="hidden sm:inline-flex">
              <Button href={SIGNIN_URL} variant="outline" size="md">
                Access Account
              </Button>
            </span>
            <RequestButton size="md">Request Delivery</RequestButton>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section id="top" className="relative overflow-hidden px-6 pb-[70px] pt-[84px] text-center">
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--l-hero-glow)" }} />

        <div className="relative mx-auto max-w-[1140px]">
          <Image
            src={vertical}
            alt="Fly by Night Fuel"
            width={460}
            height={427}
            priority
            className="mx-auto mb-2 block h-auto w-full max-w-[360px] sm:max-w-[460px]"
            style={{ filter: "drop-shadow(0 16px 36px rgba(0,0,0,.28))" }}
          />
          <div className="mx-auto mt-6 max-w-[560px] text-[clamp(18px,2.6vw,24px)] font-semibold text-[var(--l-heading)]">
            The name&apos;s a joke. The <b className="text-[var(--l-accent)]">service</b> is serious.
          </div>
          <p className="mx-auto mt-4 max-w-[600px] text-[17px] text-[var(--l-muted)]">
            Bulk off-road diesel and DEF, wet-hosed straight to your equipment, bulk tanks, and gensets
            across Palm Beach County. Certified meter at the truck, keep-full scheduling, and 4-hour
            emergency call-out.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <RequestButton size="lg">
              <GasStationIcon size={22} />
              Request a Delivery
            </RequestButton>
            {/* Icons inherit the button's text colour (accent on outline). */}
            <Button href={TEL} size="lg" variant="outline">
              <PhoneIcon size={18} />
              Call {PHONE}
            </Button>
            <Button href={SMS} size="lg" variant="outline">
              <ChatIcon size={20} />
              Message Us
            </Button>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <div className="border-y border-[var(--l-border)] bg-[var(--l-surface)]">
        <div className="mx-auto flex max-w-[1140px] flex-wrap justify-center gap-x-12 gap-y-3.5 px-6 py-5">
          {TRUST.map((t) => {
            const Icon = TRUST_ICONS[t.icon];
            return (
              <div
                key={t.label}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--l-heading)]"
              >
                <Icon size={22} className="shrink-0 text-secondary" />
                {t.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== SERVICES ===== */}
      <section id="services" className="px-6 py-[78px]">
        <div className="mx-auto max-w-[1140px]">
          <SectionHeading
            eyebrow="What We Deliver"
            sub="No trips to the pump, no downtime waiting on fuel. We roll to your equipment, tanks, and generators and fill them where they sit."
          >
            Fuel, brought to <span className="text-[var(--l-accent)]">your</span> site
          </SectionHeading>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {SERVICES.map((c) => {
              const Icon = SERVICE_ICONS[c.icon];
              return (
                <div
                  key={c.title}
                  className="rounded-[var(--radius-card)] border border-[var(--l-border)] bg-[var(--l-surface)] p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-[var(--l-accent)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--l-accent-soft)] text-[var(--l-accent)]">
                    <Icon size={32} />
                  </div>
                  <h3 className="mb-2 text-[19px] font-semibold tracking-[0.01em] text-[var(--l-heading)]">
                    {c.title}
                  </h3>
                  <p className="text-[14.5px] text-[var(--l-muted)]">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHO WE FUEL ===== */}
      <section id="serve" className="bg-[var(--l-surface)] px-6 py-[78px]">
        <div className="mx-auto max-w-[1140px]">
          <SectionHeading
            eyebrow="Who We Fuel"
            sub="If it burns diesel and downtime costs you money, we keep it running."
          >
            The iron that <span className="text-[var(--l-accent)]">can&apos;t sit idle</span>
          </SectionHeading>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {SEGMENTS.map((c) => (
              <div
                key={c.title}
                className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--l-border)] bg-[var(--l-page)] transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-[var(--l-accent)]"
              >
                <div className="relative h-[200px] overflow-hidden bg-[var(--l-surface-2)]">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 270px"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-1.5 text-[16.5px] font-semibold tracking-[0.01em] text-[var(--l-heading)]">
                    {c.title}
                  </h3>
                  <p className="text-[13.5px] text-[var(--l-muted)]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="px-6 py-[78px]">
        <div className="mx-auto max-w-[1140px]">
          <SectionHeading eyebrow="How It Works">
            Three steps. No <span className="text-[var(--l-accent)]">surprises</span>.
          </SectionHeading>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-[var(--radius-card)] border border-[var(--l-border)] bg-[var(--l-surface)] p-6"
              >
                <div className="font-display text-[44px] font-bold leading-none text-[var(--l-accent)] opacity-40">
                  {step.num}
                </div>
                <h3 className="mb-2 mt-1.5 text-[19px] font-semibold tracking-[0.01em] text-[var(--l-heading)]">
                  {step.title}
                </h3>
                <p className="text-[14.5px] text-[var(--l-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="border-y border-[var(--l-border)] bg-[var(--l-surface-2)] px-6 py-[78px]">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-[50px] gap-y-9">
          <div className="w-[300px] shrink-0 rounded-[18px] border-2 border-[var(--l-accent)] bg-[var(--l-surface)] px-8 py-7 text-center">
            <div className="mb-2 font-display text-[11px] tracking-[0.28em] text-[var(--l-accent)]">
              OUR PROMISE
            </div>
            <div className="font-display text-[46px] font-bold leading-none text-[var(--l-accent)]">
              No Hidden Fees
            </div>
            <div className="mt-2.5 text-[13px] text-[var(--l-muted)]">
              One delivered per-gallon price. That&apos;s it.
            </div>
          </div>
          <div className="max-w-[650px] flex-1 basis-[420px]">
            <h2 className="mb-3.5 font-display text-[clamp(28px,4vw,40px)] font-bold text-[var(--l-heading)]">
              What you see is <span className="text-[var(--l-accent)]">what you pay</span>
            </h2>
            <p className="text-base text-[var(--l-muted)]">
              Fuel prices move every day — ours are honest about it. You get that day&apos;s delivered rate
              up front, metered proof at the tank, and no mystery line items after the fact.
            </p>
            <ul className="mt-4 grid list-none gap-2.5 p-0">
              {PROMISE_POINTS.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px]">
                  <span className="font-extrabold text-[var(--l-accent)]">✓</span>
                  <span className="text-[var(--l-text)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== COVERAGE ===== */}
      <section id="coverage" className="px-6 py-[78px]">
        <div className="mx-auto grid max-w-[1140px] items-start gap-9 lg:[grid-template-columns:506fr_557fr] lg:gap-12">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--l-border)] bg-[var(--l-surface)]">
            <Image
              src="/landing/coverage-map.png"
              alt="Fly by Night Fuel service area across Palm Beach County, Florida"
              width={506}
              height={515}
              sizes="(max-width: 1024px) 100vw, 506px"
              className="block h-auto w-full"
            />
          </div>
          <div>
            <Eyebrow>Service Area</Eyebrow>
            <h2 className="font-display text-[clamp(30px,4.4vw,44px)] font-bold leading-tight text-[var(--l-heading)]">
              Rolling all over{" "}
              <span className="text-[var(--l-accent)]">Palm Beach County</span>
            </h2>
            <p className="mt-4 text-[17px] text-[var(--l-muted)]">
              Countywide off-road fuel and DEF, coast to Lake Okeechobee. If you&apos;re on this list (or
              just off it), call dispatch and we&apos;ll get you covered.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              {COVERAGE.map((chip) => (
                <div
                  key={chip.label}
                  className={`rounded-full border bg-[var(--l-surface)] px-6 py-3 text-[15px] font-semibold ${
                    chip.hot
                      ? "border-[var(--l-accent)] text-[var(--l-accent)]"
                      : "border-[var(--l-border)] text-[var(--l-heading)]"
                  }`}
                >
                  {chip.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-[var(--l-surface)] px-6 py-[78px]">
        <div className="mx-auto max-w-[1140px]">
          <SectionHeading eyebrow="Common Questions">
            Straight answers, <span className="text-[var(--l-accent)]">no runaround</span>
          </SectionHeading>
          <div className="mx-auto max-w-[820px]">
            {FAQ.map((qa) => (
              <div
                key={qa.q}
                className="mb-3.5 rounded-[14px] border border-[var(--l-border)] bg-[var(--l-page)] px-6 py-5"
              >
                <h3 className="mb-2 flex gap-2.5 text-[17px] font-semibold tracking-[0.01em] text-[var(--l-heading)]">
                  <span className="font-display font-bold text-[var(--l-accent)]">Q</span>
                  {qa.q}
                </h3>
                <p className="text-[15px] text-[var(--l-muted)]">{qa.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="bg-[var(--l-surface-2)] px-6 py-[78px]">
        <div className="mx-auto grid max-w-[1140px] items-center gap-11 md:[grid-template-columns:440fr_656fr]">
          <div className="text-center">
            <Image
              src={vertical}
              alt="Fly by Night Fuel"
              width={440}
              height={409}
              sizes="(max-width: 768px) 80vw, 440px"
              className="mx-auto h-auto w-full max-w-[320px] md:max-w-[440px]"
              style={{ filter: "drop-shadow(0 14px 34px rgba(0,0,0,.28))" }}
            />
          </div>
          <div>
            <Eyebrow>Owner-Operated · Local</Eyebrow>
            <h2 className="mb-2 font-display text-[clamp(28px,4vw,40px)] font-bold leading-tight text-[var(--l-heading)]">
              A local operator who actually answers
            </h2>
            <div className="mb-4 font-display text-[14px] tracking-[0.14em] text-[var(--l-accent)]">
              ALEX MORRISON · OWNER / OPERATOR
            </div>
            <p className="mb-3.5 text-base text-[var(--l-muted)]">
              Fly By Night Fuel is the mobile-fueling brand of Fueling Around LLC — a Palm Beach County
              operation built on reliability and straight pricing. When water and power get scarce and the
              big guys stop answering, we&apos;re the ones still rolling.
            </p>
            <p className="mb-3.5 text-base text-[var(--l-muted)]">
              The name&apos;s a joke. Showing up on time, metering it right, and charging you fair — that
              part&apos;s dead serious.
            </p>
            <RequestButton size="lg" className="mt-2">
              Get Fuel Scheduled
            </RequestButton>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--l-border)] bg-[var(--l-surface-deep)] px-6 pb-7 pt-12">
        <div className="mx-auto max-w-[1140px]">
          <div className="grid gap-8 md:[grid-template-columns:2fr_1fr_1fr]">
            <div>
              <div className="mb-3.5">
                <Image src={logo} alt="Fly by Night Fuel" width={161} height={44} className="h-11 w-auto" />
              </div>
              <p className="max-w-[320px] text-sm text-[var(--l-muted)]">
                Mobile off-road diesel &amp; DEF delivery across Palm Beach County. Metered, transparent,
                and on time — the name&apos;s a joke, the service is serious.
              </p>
            </div>
            <div>
              <h4 className="mb-3.5 font-display text-[13px] tracking-[0.14em] text-[var(--l-accent)]">
                COMPANY
              </h4>
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="mb-2.5 block text-[14.5px] text-[var(--l-muted)] transition-colors hover:text-[var(--l-accent)]"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h4 className="mb-3.5 font-display text-[13px] tracking-[0.14em] text-[var(--l-accent)]">
                DISPATCH
              </h4>
              <a
                href={TEL}
                className="mb-2.5 block text-[14.5px] text-[var(--l-muted)] transition-colors hover:text-[var(--l-accent)]"
              >
                {PHONE}
              </a>
              <RequestLink className="mb-2.5 block text-[14.5px] text-[var(--l-muted)] transition-colors hover:text-[var(--l-accent)]">
                Request a Delivery
              </RequestLink>
              {/* Keeps sign-in reachable where the nav link collapses (mobile). */}
              <Link
                href={SIGNIN_URL}
                className="mb-2.5 block text-[14.5px] text-[var(--l-muted)] transition-colors hover:text-[var(--l-accent)]"
              >
                Access Account
              </Link>
              <span className="mb-2.5 block text-[14.5px] text-[var(--l-muted)]">
                Palm Beach County, FL
              </span>
              <span className="mb-2.5 block text-[14.5px] text-[var(--l-muted)]">
                Licensed &amp; Insured
              </span>
            </div>
          </div>
          <div className="mt-9 border-t border-[var(--l-border)] pt-5 text-center text-[12.5px] leading-[1.7] text-[var(--l-muted)]">
            Fueling Around LLC d/b/a Fly By Night Fuel · Off-road dyed diesel is sold for off-highway use
            only.
            <br />© 2026 Fueling Around LLC · Palm Beach County, Florida · Dispatch {PHONE}
          </div>
        </div>
      </footer>
    </div>
  );
}
