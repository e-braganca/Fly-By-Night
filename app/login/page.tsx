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

/* Admin is not a visible choice — the sign-in form is the same for everyone.
   For the demo, an @flybynight / "admin" address lands on the admin app so
   both sides stay reachable without putting a role switch in the UI. */
function looksLikeAdmin(email: string): boolean {
  return /admin/i.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  function login() {
    router.push(destinationFor(readNext(), looksLikeAdmin(email)));
  }

  return (
    <AuthShell
      title="Login"
      description="Welcome back! Login and continue your journey."
    >
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
