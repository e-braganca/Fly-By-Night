"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

/*
  Shared chrome for the auth screens (Login, Sign Up, Email Verification).
  All of them use the same layout in Figma: a decorative corner wash, a
  centred max-width-SM column, the horizontal logo, then a heading +
  description followed by the screen's own content.
*/

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-neutral">
      {/* decorative wash */}
      <div className="pointer-events-none absolute -right-40 -top-80 h-[1145px] w-[1145px] rounded-full bg-gradient-to-b from-primary/10 to-transparent" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[600px] flex-col items-center justify-center px-8 py-12">
        <div className="flex w-full flex-col items-center gap-6 rounded-xl px-6 pb-16 pt-12 sm:px-16">
          {/* Logo */}
          <div className="w-full pb-3">
            <Image
              src="/brand/logo-horizontal.svg"
              alt="Fly by Night Fuel"
              width={153}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </div>

          {/* Header */}
          <div className="w-full pb-3">
            <h1 className="text-[32px] font-semibold leading-[1.5] text-text-primary">
              {title}
            </h1>
            {description && (
              <p className="text-base text-text-secondary">{description}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

/** Filled 53px input used by every auth form. */
export function FilledInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  adornment,
  autoComplete,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  adornment?: ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="h-[53px] w-full rounded-lg bg-grey-500/8 px-3 pr-11 text-sm text-text-primary outline-none transition-shadow placeholder:text-text-disabled focus:ring-2 focus:ring-primary/24"
      />
      {adornment && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{adornment}</div>
      )}
    </div>
  );
}

/** "———— OR ————" separator above the social auth button. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="h-px flex-1 bg-divider" />
      <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-text-primary">
        OR
      </span>
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
}

export function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5.05 5.05 0 0 1-2.19 3.31v2.74h3.54c2.07-1.9 3.25-4.72 3.25-7.89Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.74c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.18v2.83A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.65-2.83Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.07.56 4.21 1.65l3.14-3.14A10.5 10.5 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.65 2.83C6.7 6.69 9.13 4.75 12 4.75Z" />
    </svg>
  );
}

/**
 * Where to land after authenticating. Coming from the landing's "Request
 * Delivery" (?next=schedule) drops the user straight into the request-fuel
 * wizard; otherwise they go to their dashboard.
 */
export function destinationFor(next: string | null, isAdmin = false): string {
  if (next === "schedule") {
    return isAdmin ? "/admin-schedule" : "/customer-schedule";
  }
  return isAdmin ? "/admin/dashboard" : "/customer/dashboard";
}

/**
 * Reads `?next=` from the current URL. Only safe inside event handlers — at
 * render time use `AuthCrossLink`, which reads it through `useSearchParams`.
 */
export function readNext(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}

/** Carries `?next=` across the login ⇄ sign-up links so the flow survives. */
export function withNext(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

type CrossLinkProps = { prompt: string; label: string; href: string };

function CrossLinkLine({ prompt, label, href }: CrossLinkProps) {
  return (
    <p className="text-center text-sm text-text-primary">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-primary">
        {label}
      </Link>
    </p>
  );
}

function CrossLinkWithNext(props: CrossLinkProps) {
  const next = useSearchParams().get("next");
  return <CrossLinkLine {...props} href={withNext(props.href, next)} />;
}

/**
 * "Already registered? Login" / "Not registered yet? Sign Up" — carries `?next=`
 * so a visitor who came from the landing's Request Delivery keeps that intent
 * when hopping between the two forms.
 *
 * `useSearchParams` bails a prerendered route out to client rendering, so it
 * lives below a Suspense boundary (required for the production build). The
 * fallback is the same line without the param.
 */
export function AuthCrossLink(props: CrossLinkProps) {
  return (
    <Suspense fallback={<CrossLinkLine {...props} />}>
      <CrossLinkWithNext {...props} />
    </Suspense>
  );
}
