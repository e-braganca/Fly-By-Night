"use client";

import { useState } from "react";
import { ProfileSection } from "@/components/customer/settings/ProfileSection";
import { BusinessSection } from "@/components/customer/settings/BusinessSection";
import { CredentialsSection } from "@/components/customer/settings/CredentialsSection";
import { NotificationsSection } from "@/components/customer/settings/NotificationsSection";
import { SETTINGS_SECTIONS, type SettingsSectionKey } from "@/lib/data/settings";
import { PAGE_X, PAGE_Y } from "@/components/ui/layout";

const DISABLED = ["Subscription", "Subscription Receipts"];

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSectionKey>("profile");

  return (
    <div className={`mx-auto flex w-full max-w-[1200px] flex-col gap-8 md:flex-row ${PAGE_X} ${PAGE_Y}`}>
      {/* Sub-nav */}
      <nav className="shrink-0 md:w-48">
        <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-[0.5px] text-text-secondary">
          Settings
        </p>
        <div className="flex flex-col gap-1">
          {SETTINGS_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                section === s.key
                  ? "bg-grey-500/16 font-semibold text-text-primary"
                  : "font-normal text-text-primary hover:bg-grey-500/8"
              }`}
            >
              {s.label}
            </button>
          ))}
          {DISABLED.map((label) => (
            <span
              key={label}
              className="cursor-not-allowed rounded-md px-2 py-1.5 text-left text-sm text-text-disabled"
              title="Coming soon"
            >
              {label}
            </span>
          ))}
        </div>
      </nav>

      {/* Section content */}
      <div className="flex flex-1 flex-col gap-6">
        {section === "profile" && <ProfileSection />}
        {section === "business" && <BusinessSection />}
        {section === "credentials" && <CredentialsSection />}
        {section === "notifications" && <NotificationsSection />}
      </div>
    </div>
  );
}
