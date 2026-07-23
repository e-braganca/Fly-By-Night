"use client";

import { useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { EyeIcon } from "@/components/ui/Icon";
import { useAppStore, useProfile } from "@/lib/store";

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-grey-300 bg-white px-3 py-2.5 pr-10 text-sm text-text-primary outline-none transition-colors placeholder:text-text-disabled focus:border-primary"
        />
        <button
          type="button"
          aria-label={show ? "Hide" : "Show"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-grey-600"
        >
          <EyeIcon size={20} />
        </button>
      </div>
    </div>
  );
}

export function CredentialsSection() {
  const profile = useProfile();
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const pwValid = oldPw && newPw && newPw === confirmPw;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);

  function changePassword() {
    if (!pwValid) return;
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
    setPwMsg("Password updated");
    setTimeout(() => setPwMsg(null), 2500);
  }

  function changeEmail() {
    if (!emailValid) return;
    updateProfile({ email: newEmail });
    setEmailMsg(`Email updated to ${newEmail}`);
    setNewEmail("");
    setTimeout(() => setEmailMsg(null), 3000);
  }

  return (
    <>
      <SettingsCard
        title="Password"
        description="Change your password credentials."
        footer={
          <div className="flex items-center gap-3">
            {pwMsg && <span className="text-sm text-success-dark">{pwMsg}</span>}
            <Button variant="dark" size="md" disabled={!pwValid} onClick={changePassword}>
              Change Password
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <PasswordField id="oldPw" label="Old Password" value={oldPw} onChange={setOldPw} />
          <PasswordField id="newPw" label="New Password" value={newPw} onChange={setNewPw} />
          <PasswordField id="confirmPw" label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />
          {confirmPw && newPw !== confirmPw && (
            <p className="-mt-3 text-xs text-error">Passwords don&apos;t match.</p>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Email"
        description="Update your email credentials by entering a new one."
        footer={
          <div className="flex items-center gap-3">
            {emailMsg && <span className="text-sm text-success-dark">{emailMsg}</span>}
            <Button variant="dark" size="md" disabled={!emailValid} onClick={changeEmail}>
              Change Email
            </Button>
          </div>
        }
      >
        <TextField
          id="newEmail"
          label="New Email"
          type="email"
          placeholder={`Current: ${profile.email}`}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </SettingsCard>
    </>
  );
}
