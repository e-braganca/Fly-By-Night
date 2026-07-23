"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAppStore, useNotificationPrefs } from "@/lib/store";
import { DELIVERY_UPDATE_ROWS } from "@/lib/data/settings";

const CHANNELS = ["Push", "Email", "In-App"] as const;

export function NotificationsSection() {
  const prefs = useNotificationPrefs();
  const setPref = useAppStore((s) => s.setNotificationPref);
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("Push");

  return (
    <section className="rounded-[var(--radius-card)] bg-white p-6">
      {/* Channel tabs */}
      <div className="flex gap-10 border-b border-divider">
        {CHANNELS.map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
              channel === c
                ? "border-grey-900 text-text-primary"
                : "border-transparent text-text-secondary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {channel === "Push" ? (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            Push Notifications
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Alerts sent to your device, even when the app is closed.
          </p>

          {/* Disable all */}
          <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-lg border border-divider bg-neutral px-4 py-3">
            <Checkbox
              checked={prefs.disableAll}
              onChange={(v) => setPref("disableAll", v)}
              aria-label="Disable all push notifications"
            />
            <span className="text-sm font-medium text-text-primary">
              Disable all push notifications
            </span>
          </label>

          {/* Delivery Updates */}
          <div className="mt-6 border-t border-divider pt-5">
            <h3 className="text-sm font-semibold text-text-primary">
              Delivery Updates
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              Notifies you about each step taken to deliver fuel to your
              equipment on the scheduled delivery day.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              {DELIVERY_UPDATE_ROWS.map((row) => (
                <div key={row.key} className="flex items-center gap-3">
                  <Switch
                    checked={!prefs.disableAll && prefs[row.key]}
                    disabled={prefs.disableAll}
                    onChange={(v) => setPref(row.key, v)}
                    aria-label={row.label}
                  />
                  <span
                    className={`text-sm ${
                      prefs.disableAll ? "text-text-disabled" : "text-text-primary"
                    }`}
                  >
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 py-10 text-center">
          <h2 className="text-2xl font-semibold text-text-primary">
            {channel} Notifications
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
            {channel} notification preferences aren&apos;t configured yet.
          </p>
        </div>
      )}
    </section>
  );
}
