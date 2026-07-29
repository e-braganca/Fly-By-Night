"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EyeIcon } from "@/components/ui/Icon";
import {
  AuthShell,
  AuthCrossLink,
  AuthDivider,
  FilledInput,
  GoogleIcon,
  destinationFor,
  readNext,
} from "@/components/auth/AuthShell";
import { useAppStore } from "@/lib/store";

/* Account creation, per Figma "Sign Up / Modal" (node 17239:82914). Three
   screens in sequence: the form, "check your email", then "verification
   successful". There's no backend yet, so a mock button stands in for clicking
   the confirmation link in the email. */
type Step = "form" | "check" | "verified";

export default function RegisterPage() {
  const router = useRouter();
  const resetAgreement = useAppStore((s) => s.resetAgreement);

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [resent, setResent] = useState(false);

  const canSubmit =
    email.trim().length > 0 && name.trim().length > 0 && password.length > 0;

  function submit() {
    if (!canSubmit) return;
    // A brand-new account hasn't accepted the Service Agreement, so the request
    // wizard will gate on it again.
    resetAgreement();
    setStep("check");
  }

  /** Continue into the app — the request wizard when they came from the landing. */
  function finish() {
    router.push(destinationFor(readNext()));
  }

  /* ---- Step 3: verification successful ---- */
  if (step === "verified") {
    return (
      <AuthShell
        title="Verification successful"
        description="Click on the button below to continue."
      >
        <Illustration />
        <div className="w-full">
          <Button size="lg" className="w-full" onClick={finish}>
            Continue
          </Button>
        </div>
      </AuthShell>
    );
  }

  /* ---- Step 2: check your email ---- */
  if (step === "check") {
    return (
      <AuthShell
        title="Please check your email!"
        description={
          <>
            Click on the confirmation link sent to{" "}
            <span className="font-semibold text-text-primary">{email}</span>.
          </>
        }
      >
        <Illustration />

        <div className="flex w-full flex-col gap-3">
          {/* Stands in for opening the emailed confirmation link. */}
          <Button size="lg" className="w-full" onClick={() => setStep("verified")}>
            Confirm email address
          </Button>
          <p className="text-center text-xs text-text-secondary">
            Demo shortcut — no email is actually sent.
          </p>

          <p className="text-center text-sm text-text-primary">
            Didn&apos;t receive an email?{" "}
            <button
              type="button"
              onClick={() => setResent(true)}
              className="font-semibold text-primary"
            >
              Resend
            </button>
          </p>
          {resent && (
            <p className="text-center text-sm text-success-dark">
              Confirmation link sent again.
            </p>
          )}
        </div>
      </AuthShell>
    );
  }

  /* ---- Step 1: the form ---- */
  return (
    <AuthShell
      title="Sign Up"
      description="Sign up on our platform to quickly and easily request diesel deliveries for your equipment."
    >
      <div className="flex w-full flex-col gap-4">
        <FilledInput
          id="email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <FilledInput
          id="name"
          placeholder="Name"
          value={name}
          onChange={setName}
          autoComplete="name"
        />
        <FilledInput
          id="password"
          type={showPw ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          adornment={
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((s) => !s)}
              className="grid h-10 w-10 place-items-center rounded-full text-grey-600 hover:bg-grey-500/8"
            >
              <EyeIcon size={22} />
            </button>
          }
        />
        <p className="text-sm text-text-secondary">
          Upon registering, you agree to our{" "}
          <Link href="/register" className="font-semibold text-primary">
            Terms and Conditions
          </Link>
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button size="lg" className="w-full" disabled={!canSubmit} onClick={submit}>
          Sign Up
        </Button>

        <AuthCrossLink prompt="Already registered?" label="Login" href="/login" />

        <AuthDivider />

        <Button variant="soft" size="lg" className="w-full" onClick={submit}>
          <GoogleIcon size={22} />
          Continue with Google
        </Button>
      </div>
    </AuthShell>
  );
}

/** The line illustration shared by both confirmation screens. */
function Illustration() {
  return (
    <Image
      src="/brand/illustration-verify.svg"
      alt=""
      width={190}
      height={168}
      className="my-2 h-auto w-[200px]"
    />
  );
}
