"use client";

import { useRef, useState } from "react";
import { SettingsCard } from "./SettingsCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar } from "@/components/ui/Avatar";
import { TrashIcon } from "@/components/ui/Icon";
import { useAppStore, useProfile } from "@/lib/store";

function ImageIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 18 5-4.5 4 3.5 3-2.5 4 3.5" />
    </svg>
  );
}

export function ProfileSection() {
  const profile = useProfile();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [avatar, setAvatar] = useState<string | undefined>(profile.avatar);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  function save() {
    updateProfile({ firstName, lastName, phone, avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <SettingsCard
        title="Profile"
        description="Manage your personal information you and other people see."
        footer={
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-success-dark">Saved</span>}
            <Button variant="dark" size="md" onClick={save}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Avatar panel */}
          <div className="flex flex-col items-center gap-4 rounded-lg bg-neutral p-6 md:w-72">
            <Avatar
              size={128}
              src={avatar}
              fallback={<ImageIcon size={32} />}
              className="text-grey-500 ring-8 ring-grey-500/12"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickImage}
            />
            {avatar ? (
              <div className="flex flex-col items-center gap-2">
                <Button variant="soft" size="md" onClick={() => fileRef.current?.click()}>
                  Change Avatar
                </Button>
                <button
                  onClick={() => setAvatar(undefined)}
                  className="text-sm font-semibold text-error"
                >
                  Remove
                </button>
              </div>
            ) : (
              <Button
                variant="soft"
                size="md"
                className="border border-grey-500/32 !bg-transparent"
                onClick={() => fileRef.current?.click()}
              >
                Upload Avatar
              </Button>
            )}
          </div>

          {/* Fields */}
          <div className="flex flex-1 flex-col gap-6">
            <TextField id="firstName" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <TextField id="lastName" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <TextField id="phone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Delete Account"
        description="You can permanently delete the account by clicking on the button below."
        footer={
          <Button variant="danger" size="md" onClick={() => setConfirmDelete(true)}>
            <TrashIcon size={20} />
            Delete Account
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {}}
        title="Delete your account?"
        description="This permanently deletes your account, equipment, deliveries and receipts. This can't be undone."
        confirmLabel="Delete Account"
        cancelLabel="Back"
      />
    </>
  );
}
