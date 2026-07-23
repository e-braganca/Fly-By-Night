"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EyeIcon } from "@/components/ui/Icon";

type Role = "customer" | "admin";

const DEST: Record<Role, string> = {
  customer: "/customer/dashboard",
  admin: "/admin/dashboard",
};

function GoogleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5.05 5.05 0 0 1-2.19 3.31v2.74h3.54c2.07-1.9 3.25-4.72 3.25-7.89Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.74c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.18v2.83A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86l3.65-2.83Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.07.56 4.21 1.65l3.14-3.14A10.5 10.5 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.65 2.83C6.7 6.69 9.13 4.75 12 4.75Z" />
    </svg>
  );
}

function FilledInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  adornment,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  adornment?: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[53px] w-full rounded-lg bg-grey-500/8 px-3 pr-11 text-sm text-text-primary outline-none transition-shadow placeholder:text-text-disabled focus:ring-2 focus:ring-primary/24"
      />
      {adornment && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{adornment}</div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function login() {
    router.push(DEST[role]);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral">
      {/* decorative wash */}
      <div className="pointer-events-none absolute -right-40 -top-80 h-[1145px] w-[1145px] rounded-full bg-gradient-to-b from-primary/10 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[600px] flex-col items-center justify-center px-8 py-12">
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
              Login
            </h1>
            <p className="text-base text-text-secondary">
              Welcome back! Login and continue your journey.
            </p>
          </div>

          {/* Role selector */}
          <div className="w-full">
            <p className="mb-2 text-xs font-semibold text-text-secondary">Sign in as</p>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-grey-500/8 p-1">
              {(["customer", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-md py-2 text-sm font-semibold capitalize transition-colors ${
                    role === r
                      ? "bg-white text-primary shadow-[var(--shadow-card)]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="flex w-full flex-col gap-4">
            <FilledInput
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={setEmail}
            />
            <FilledInput
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={setPassword}
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
            <Link
              href="/login"
              className="text-right text-sm font-semibold text-primary"
            >
              Forgot password?
            </Link>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-3">
            <Button size="lg" className="w-full" onClick={login}>
              Login as {role === "customer" ? "Customer" : "Admin"}
            </Button>

            <p className="text-center text-sm text-text-primary">
              Not registered yet?{" "}
              <Link href="/login" className="font-semibold text-primary">
                Sign Up
              </Link>
            </p>

            <div className="flex items-center gap-4 py-2">
              <span className="h-px flex-1 bg-divider" />
              <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-text-primary">
                OR
              </span>
              <span className="h-px flex-1 bg-divider" />
            </div>

            <Button variant="soft" size="lg" className="w-full" onClick={login}>
              <GoogleIcon size={22} />
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
