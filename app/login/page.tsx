"use client";

import { useState } from "react";
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

/* Which app the credentials sign into. The demo has no real auth, so the
   choice is explicit rather than inferred from the address — picking "Admin"
   is the only way to reach the admin app. */
type Role = "customer" | "admin";

const ROLES: { id: Role; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "admin", label: "Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function login() {
    router.push(destinationFor(readNext(), role === "admin"));
  }

  return (
    <AuthShell
      title="Login"
      description="Welcome back! Login and continue your journey."
    >
      {/* Role selector */}
      <div className="w-full">
        <p className="mb-2 text-xs font-semibold text-text-secondary">Sign in as</p>
        <div
          role="radiogroup"
          aria-label="Sign in as"
          className="grid grid-cols-2 gap-2 rounded-lg bg-grey-500/8 p-1"
        >
          {ROLES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={role === id}
              onClick={() => setRole(id)}
              className={`rounded-md py-2 text-sm font-semibold transition-colors ${
                role === id
                  ? "bg-white text-primary shadow-[var(--shadow-card)]"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
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
          autoComplete="email"
        />
        <FilledInput
          id="password"
          type={showPw ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
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
          Login
        </Button>

        <AuthCrossLink prompt="Not registered yet?" label="Sign Up" href="/register" />

        <AuthDivider />

        <Button variant="soft" size="lg" className="w-full" onClick={login}>
          <GoogleIcon size={22} />
          Continue with Google
        </Button>
      </div>
    </AuthShell>
  );
}
