"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/landing/Button";
import { REQUEST_URL, requestUrlFor } from "@/components/landing/content";

/*
  "Request a Delivery" call-to-action. The landing's own `?v=` decides which
  request flow it points at — `/?v=2` sends visitors into the guest flow
  (straight to the wizard, no account), anything else into the signed-in flow.

  `useSearchParams` bails a prerendered route out to client rendering, so each
  CTA sits under a Suspense boundary whose fallback is the default flow. That
  keeps the landing static and upgrades the href once hydrated.
*/

type ButtonProps = {
  size?: "md" | "lg";
  variant?: "accent" | "outline" | "ghost";
  className?: string;
  children: ReactNode;
};

function ButtonInner(props: ButtonProps) {
  const v = useSearchParams().get("v");
  return <Button href={requestUrlFor(v)} {...props} />;
}

export function RequestButton(props: ButtonProps) {
  return (
    <Suspense fallback={<Button href={REQUEST_URL} {...props} />}>
      <ButtonInner {...props} />
    </Suspense>
  );
}

type LinkProps = { className?: string; children: ReactNode };

function LinkInner({ className, children }: LinkProps) {
  const v = useSearchParams().get("v");
  return (
    <Link href={requestUrlFor(v)} className={className}>
      {children}
    </Link>
  );
}

export function RequestLink({ className, children }: LinkProps) {
  return (
    <Suspense
      fallback={
        <Link href={REQUEST_URL} className={className}>
          {children}
        </Link>
      }
    >
      <LinkInner className={className}>{children}</LinkInner>
    </Suspense>
  );
}
