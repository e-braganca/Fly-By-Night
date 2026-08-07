import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/landing/Button";
import { RequestButton, RequestLink } from "@/components/landing/RequestCta";
import {
  PHONE,
  PHONE_LABEL,
  TEL,
  SIGNIN_URL,
  NAV,
  TRUST,
  PRICING_PROMISE,
  SEGMENTS,
  SEGMENT_FOOTER_LABEL,
  SEGMENT_CTA,
  STEPS,
  PROMISE_POINTS,
  COVERAGE,
  COMPLIANCE,
  FAQ,
  OWNER,
} from "@/components/landing/content";
import {
  CheckBadgeIcon,
  PinIcon,
  NozzleIcon,
  DollarIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@/components/landing/Icons";

const TRUST_ICONS = {
  checkBadge: CheckBadgeIcon,
  pin: PinIcon,
  nozzle: NozzleIcon,
  dollar: DollarIcon,
};

/** Small uppercase kicker above a section title. */
function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--l-accent)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Centered section header: eyebrow, two-tone title, optional description. */
function SectionHeading({
  eyebrow,
  lead,
  accent,
  sub,
  subWidth = "max-w-[800px]",
}: {
  eyebrow: string;
  lead: string;
  accent?: string;
  sub?: string;
  subWidth?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <div className="flex flex-col items-center gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="max-w-[760px] text-[clamp(30px,4.4vw,40px)] font-bold leading-[1.2] text-[var(--l-heading)]">
          {lead}
          {accent && (
            <>
              {" "}
              <span className="text-[var(--l-accent)]">{accent}</span>
            </>
          )}
        </h2>
      </div>
      {sub && (
        <p className={`${subWidth} text-[17px] leading-[1.6] text-[var(--l-muted)]`}>{sub}</p>
      )}
    </div>
  );
}

/** Marketing front door — the app's entry point at `/`. */
export function LandingPage() {
  const logo = "/brand/logo-horizontal.svg";

  return (
    <div
      data-landing-theme="light"
      className="min-h-dvh overflow-x-clip bg-[var(--l-page)] font-sans text-[var(--l-text)]"
    >
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-50 border-b border-[var(--l-border)] bg-[var(--l-surface)]">
        <div className="mx-auto flex max-w-[1344px] items-center justify-between gap-4 px-6 py-3.5">
          <a href="#top" className="flex shrink-0 items-center gap-3">
            <Image src={logo} alt="Fly by Night Fuel" width={139} height={38} priority className="h-[38px] w-auto" />
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
          <div className="flex items-center gap-4">
            <a
              href={TEL}
              className="hidden text-base font-semibold text-[var(--l-accent)] xl:inline"
            >
              {PHONE_LABEL}
            </a>
            {/* Wrapped, not classed: `hidden` on the Button itself would fight
                its base `inline-flex` (same utility layer, order decides).
                Below `sm` this collapses and the footer carries sign-in. */}
            <span className="hidden sm:inline-flex">
              <Button href={SIGNIN_URL} variant="outline" size="md">
                Sign In / Register
              </Button>
            </span>
            <RequestButton size="md">Order Fuel</RequestButton>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section id="top" className="px-6 pb-[70px] pt-16">
        <div className="mx-auto flex max-w-[1140px] flex-col items-center gap-6">
          <Image
            src="/landing/hero-emblem.jpg"
            alt="Fly by Night Fuel"
            width={469}
            height={427}
            priority
            sizes="(max-width: 640px) 88vw, 469px"
            className="h-auto w-full max-w-[360px] sm:max-w-[469px]"
          />
          <h1 className="max-w-[660px] text-center text-[clamp(38px,6.4vw,64px)] font-bold leading-[0.97] tracking-[-0.01em] text-[var(--l-heading)]">
            Diesel delivered.
            <br />
            <span className="text-[var(--l-accent)]">Day or night.</span>
          </h1>
          <p className="max-w-[600px] text-center text-[17px] leading-[1.6] text-[var(--l-muted)]">
            Off-road dyed diesel and DEF delivered directly to your tractors, generators, and heavy
            equipment across Palm Beach County. Licensed, insured, and on-call when the rest of the
            industry has gone home.
          </p>
          <div className="mt-2 flex w-full flex-wrap justify-center gap-3.5">
            <RequestButton size="lg" className="w-full sm:w-[250px]">
              <NozzleIcon size={20} />
              Order Fuel
            </RequestButton>
            <Button href={TEL} size="lg" variant="outline" className="w-full sm:w-[250px]">
              <PhoneIcon size={18} />
              {PHONE_LABEL}
            </Button>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <div className="bg-[var(--l-accent)] px-6 py-5">
        <div className="mx-auto flex max-w-[1344px] flex-wrap items-center justify-center gap-x-[46px] gap-y-3.5">
          {TRUST.map((t) => {
            const Icon = TRUST_ICONS[t.icon];
            return (
              <div
                key={t.label}
                className="flex items-center gap-2 text-sm font-semibold text-white"
              >
                <Icon size={22} className="shrink-0 text-secondary" />
                {t.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== PRICING PROMISE ===== */}
      <div className="bg-[var(--l-accent)] px-6 py-6">
        <div className="mx-auto w-full max-w-[832px] rounded-xl bg-[#dfe3e8] px-6 py-6 text-center shadow-[0_20px_25px_rgba(0,0,0,0.25)]">
          <p className="font-mono text-[20px] font-extrabold tracking-[0.05em] text-[var(--l-accent)]">
            {PRICING_PROMISE.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-base font-medium tracking-[0.025em] text-[var(--l-text)]">
            {PRICING_PROMISE.items.map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>•</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SERVICES ===== */}
      <section id="services" className="bg-[var(--l-surface)] px-6 py-[78px]">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-[46px]">
          <SectionHeading
            eyebrow="Our Services"
            lead="All services,"
            accent="one professional dispatch"
            sub="We specialize in commercial fuel delivery for high-value properties, emergency storm prep, agricultural fields, and heavy construction sites. No shortcuts, no compromises."
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {SEGMENTS.map((c) => (
              <article
                key={c.title}
                className="flex flex-col overflow-hidden rounded-2xl border border-[var(--l-border)] bg-[var(--l-page)]"
              >
                <div className="relative h-[200px] shrink-0 overflow-hidden">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 359px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-[7px] p-5">
                  <div>
                    <p className="text-[10px] font-medium uppercase leading-[1.4] tracking-[0.05em] text-[var(--l-accent)]">
                      {c.eyebrow}
                    </p>
                    <h3 className="text-xl font-semibold leading-[1.5] text-[var(--l-heading)]">
                      {c.title}
                    </h3>
                  </div>
                  <p className="text-base leading-[1.4] text-[var(--l-muted)]">{c.desc}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-[10px] font-medium uppercase leading-[1.4] tracking-[0.05em] text-[var(--l-heading)]">
                      {SEGMENT_FOOTER_LABEL}
                    </span>
                    <RequestButton size="sm" variant="outline">
                      {SEGMENT_CTA}
                      <ArrowRightIcon size={16} />
                    </RequestButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="px-6 py-[78px]">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-[46px]">
          <SectionHeading eyebrow="How It Works" lead="Three steps. No" accent="surprises." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl border border-[var(--l-border)] bg-[var(--l-surface)] p-[26px]"
              >
                <div className="text-[44px] font-bold leading-none text-[var(--l-accent)] opacity-40">
                  {step.num}
                </div>
                <h3 className="mb-2 mt-2 text-[19px] font-semibold text-[var(--l-heading)]">
                  {step.title}
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-[var(--l-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="border-y border-[var(--l-border)] bg-[var(--l-surface-2)] px-6 py-[78px]">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-[50px] gap-y-9">
          <div className="w-[300px] shrink-0 rounded-[18px] border-2 border-[var(--l-accent)] bg-[var(--l-surface)] px-9 py-7 text-center">
            <div className="font-mono text-[11px] tracking-[0.28em] text-[var(--l-accent)]">
              OUR PROMISE
            </div>
            <div className="mt-2 text-[46px] font-bold leading-none text-[var(--l-accent)]">
              No Hidden Fees
            </div>
            <div className="mt-2.5 text-[13px] text-[var(--l-muted)]">
              One delivered per-gallon price. That&apos;s it.
            </div>
          </div>
          <div className="max-w-[650px] flex-1 basis-[420px]">
            <h2 className="mb-3.5 text-[clamp(28px,4vw,36px)] font-bold leading-[1.2] text-[var(--l-heading)]">
              What you see is{" "}
              <span className="text-[var(--l-accent)]">what you pay</span>
            </h2>
            <p className="text-base leading-[1.6] text-[var(--l-muted)]">
              Fuel prices move every day — ours are honest about it. You get that day&apos;s delivered
              rate up front, metered proof at the tank, and no mystery line items after the fact.
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
        <div className="mx-auto flex max-w-[1000px] flex-col gap-7">
          <div className="grid items-start gap-7 lg:[grid-template-columns:459fr_513fr]">
            <Image
              src="/landing/coverage-map.png"
              alt="Fly by Night Fuel service area across Palm Beach County, Florida"
              width={459}
              height={339}
              sizes="(max-width: 1024px) 100vw, 459px"
              className="h-auto w-full rounded-2xl"
            />
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-3">
                <Eyebrow>Service Area</Eyebrow>
                <h2 className="text-[clamp(30px,4.4vw,40px)] font-bold leading-[1.2] text-[var(--l-heading)]">
                  Rolling all over
                  <br />
                  <span className="text-[var(--l-accent)]">Palm Beach County</span>
                </h2>
              </div>
              <p className="text-[17px] leading-[1.6] text-[var(--l-muted)]">
                Countywide off-road fuel and DEF, coast to Lake Okeechobee. If you&apos;re on this
                list (or just off it), call dispatch and we&apos;ll get you covered.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3.5">
            {COVERAGE.map((chip) => (
              <div
                key={chip.label}
                className={`rounded-[30px] bg-[var(--l-surface)] px-6 py-3 text-[15px] font-semibold ${
                  chip.hot
                    ? "border-[1.5px] border-[var(--l-accent)] text-[var(--l-accent)]"
                    : "border border-[var(--l-border)] text-[var(--l-heading)]"
                }`}
              >
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SAFETY & COMPLIANCE ===== */}
      <section className="bg-[var(--l-surface)] px-6 py-16">
        <div className="mx-auto flex max-w-[1216px] flex-col items-center">
          <SectionHeading
            eyebrow={COMPLIANCE.eyebrow}
            lead={COMPLIANCE.title}
            sub={COMPLIANCE.desc}
            subWidth="max-w-[768px]"
          />
          <div className="mt-8 w-full max-w-[768px] rounded-2xl border border-[var(--l-accent-card-border)] bg-[var(--l-page)] p-10 text-center shadow-[0_25px_50px_rgba(0,0,0,0.08)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-[var(--l-accent-tile-border)] bg-[var(--l-accent-tile)] text-[var(--l-accent)]">
              <ShieldCheckIcon size={32} />
            </div>
            <p className="mt-6 font-mono text-xl font-bold tracking-[-0.025em] text-[var(--l-text)]">
              {COMPLIANCE.cardTitle}
            </p>
            <p className="mt-1 font-mono text-xs tracking-[0.05em] text-[var(--l-accent)]">
              {COMPLIANCE.cardSubtitle}
            </p>
            <p className="mx-auto mt-6 max-w-[672px] font-mono text-sm leading-[1.625] text-[var(--l-text)]">
              {COMPLIANCE.credentials.map((part, i) =>
                part.strong ? (
                  <strong key={i} className="font-bold text-[var(--l-accent)]">
                    {part.text}
                  </strong>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-[var(--l-surface)] px-6 pb-[78px] pt-12">
        <div className="mx-auto flex max-w-[1140px] flex-col gap-[46px]">
          <SectionHeading eyebrow="Common Questions" lead="Straight answers," accent="no runaround" />
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-3.5">
            {FAQ.map((qa) => (
              <div
                key={qa.q}
                className="rounded-[14px] border border-[var(--l-border)] bg-[var(--l-page)] px-[22px] py-5"
              >
                <h3 className="mb-2 flex gap-2.5 text-[17px] font-semibold text-[var(--l-heading)]">
                  <span className="font-bold text-[var(--l-accent)]">Q</span>
                  {qa.q}
                </h3>
                <p className="text-[15px] leading-[1.6] text-[var(--l-muted)]">{qa.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MEET THE OWNER ===== */}
      <section className="bg-[var(--l-surface-2)] px-6 py-[78px]">
        <div className="mx-auto grid max-w-[1140px] items-start gap-11 md:[grid-template-columns:359fr_737fr]">
          <div className="flex flex-col items-center gap-2">
            <Image
              src={OWNER.photo}
              alt={`${OWNER.name}, owner and operator`}
              width={359}
              height={442}
              sizes="(max-width: 768px) 80vw, 359px"
              className="h-auto w-full rounded-3xl object-cover"
            />
            <p className="text-[32px] font-semibold leading-[1.3] text-[var(--l-heading)]">
              {OWNER.name}
            </p>
            <Eyebrow className="tracking-[0.05em]">{OWNER.role}</Eyebrow>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {OWNER.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-[30px] border border-[var(--l-border)] bg-[var(--l-surface)] px-6 py-3 text-[15px] font-semibold text-[var(--l-heading)]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <Eyebrow>{OWNER.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(28px,4vw,36px)] font-bold leading-[1.2] text-[var(--l-heading)]">
              {OWNER.headingLead}
              <br />
              <span className="text-[var(--l-accent)]">{OWNER.headingAccent}</span>
            </h2>
            <p className="text-[13px] font-semibold tracking-[0.05em] text-[var(--l-accent)]">
              {OWNER.byline}
            </p>
            {OWNER.bio.map((para) => (
              <p key={para} className="text-base leading-[1.6] text-[var(--l-muted)]">
                {para}
              </p>
            ))}
            <p className="text-base leading-[1.6] text-[var(--l-muted)]">{OWNER.tail}</p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[var(--l-surface-deep)] px-6 pb-7 pt-12">
        <div className="mx-auto max-w-[1140px]">
          <div className="grid gap-8 md:[grid-template-columns:2fr_1fr_1fr]">
            <div>
              <div className="mb-3.5">
                <Image src={logo} alt="Fly by Night Fuel" width={161} height={44} className="h-11 w-auto" />
              </div>
              <p className="max-w-[320px] text-sm leading-[1.6] text-[var(--l-muted)]">
                Mobile off-road diesel &amp; DEF delivery across Palm Beach County. Metered,
                transparent, and on time — the name&apos;s a joke, the service is serious.
              </p>
            </div>
            <div>
              <h4 className="mb-3.5 text-[13px] font-semibold tracking-[0.14em] text-[var(--l-accent)]">
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
              <h4 className="mb-3.5 text-[13px] font-semibold tracking-[0.14em] text-[var(--l-accent)]">
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
                Sign In / Register
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
            Fueling Around LLC d/b/a Fly By Night Fuel · Off-road dyed diesel is sold for off-highway
            use only.
            <br />© 2026 Fueling Around LLC · Palm Beach County, Florida · Dispatch {PHONE}
          </div>
        </div>
      </footer>
    </div>
  );
}
