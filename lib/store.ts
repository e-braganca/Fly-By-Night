"use client";

/*
  Shared app store. A single module-level Zustand store holds the mutable
  equipments, deliveries and scheduled deliveries. Any component (dashboard,
  equipments page, deliveries page, …) that reads from it stays in sync — CRUD
  here is reflected everywhere across the session.
*/

import { create } from "zustand";
import type {
  Equipment,
  Delivery,
  ScheduledDelivery,
  UrgencyTier,
  Profile,
  BusinessInfo,
  NotificationPrefs,
  DeliveryUpdateKey,
} from "./data/types";
import { seedEquipments } from "./data/equipments";
import { seedDeliveries } from "./data/deliveries";
import { seedScheduledDeliveries } from "./data/schedule";
import {
  seedProfile,
  seedBusiness,
  seedNotificationPrefs,
} from "./data/settings";

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export type NewEquipment = Omit<Equipment, "id">;

export type RescheduleInput =
  | { mode: "push_date"; newDateISO: string }
  | { mode: "new_window"; newTier: UrgencyTier }
  | { mode: "reschedule"; newTier: UrgencyTier; newDateISO: string };

export type NewScheduledDelivery = Omit<ScheduledDelivery, "id">;

type AppState = {
  equipments: Equipment[];
  deliveries: Delivery[];
  scheduledDeliveries: ScheduledDelivery[];

  /** Ids of notifications the user has read. */
  readNotifications: string[];
  /** UI: is the notifications drawer open. */
  notificationsOpen: boolean;

  /** Settings */
  profile: Profile;
  business: BusinessInfo;
  notificationPrefs: NotificationPrefs;

  addEquipment: (data: NewEquipment) => Equipment;
  updateEquipment: (id: string, patch: Partial<NewEquipment>) => void;
  removeEquipment: (id: string) => void;
  resetEquipments: () => void;

  addScheduledDelivery: (data: NewScheduledDelivery) => ScheduledDelivery;
  rescheduleDelivery: (id: string, input: RescheduleInput) => void;
  cancelDelivery: (id: string) => void;

  openNotifications: () => void;
  closeNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;

  updateProfile: (patch: Partial<Profile>) => void;
  updateBusiness: (patch: Partial<BusinessInfo>) => void;
  setNotificationPref: (key: DeliveryUpdateKey | "disableAll", value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  equipments: seedEquipments,
  deliveries: seedDeliveries,
  scheduledDeliveries: seedScheduledDeliveries,
  readNotifications: [],
  notificationsOpen: false,
  profile: seedProfile,
  business: seedBusiness,
  notificationPrefs: seedNotificationPrefs,

  addEquipment: (data) => {
    const equipment: Equipment = { id: newId("e"), ...data };
    set((s) => ({ equipments: [equipment, ...s.equipments] }));
    return equipment;
  },

  updateEquipment: (id, patch) =>
    set((s) => ({
      equipments: s.equipments.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    })),

  removeEquipment: (id) =>
    set((s) => ({ equipments: s.equipments.filter((e) => e.id !== id) })),

  resetEquipments: () => set({ equipments: seedEquipments }),

  addScheduledDelivery: (data) => {
    const delivery: ScheduledDelivery = { id: newId("s"), ...data };
    set((s) => ({
      scheduledDeliveries: [delivery, ...s.scheduledDeliveries],
    }));
    return delivery;
  },

  rescheduleDelivery: (id, input) =>
    set((s) => ({
      scheduledDeliveries: s.scheduledDeliveries.map((d) => {
        if (d.id !== id) return d;
        if (input.mode === "push_date") {
          return { ...d, dateISO: input.newDateISO };
        }
        if (input.mode === "reschedule") {
          return { ...d, urgency: input.newTier, dateISO: input.newDateISO };
        }
        return { ...d, urgency: input.newTier };
      }),
    })),

  cancelDelivery: (id) =>
    set((s) => ({
      scheduledDeliveries: s.scheduledDeliveries.filter((d) => d.id !== id),
    })),

  openNotifications: () => set({ notificationsOpen: true }),
  closeNotifications: () => set({ notificationsOpen: false }),
  markNotificationRead: (id) =>
    set((s) =>
      s.readNotifications.includes(id)
        ? s
        : { readNotifications: [...s.readNotifications, id] },
    ),
  markAllNotificationsRead: (ids) =>
    set((s) => ({
      readNotifications: Array.from(new Set([...s.readNotifications, ...ids])),
    })),

  updateProfile: (patch) =>
    set((s) => ({ profile: { ...s.profile, ...patch } })),
  updateBusiness: (patch) =>
    set((s) => ({ business: { ...s.business, ...patch } })),
  setNotificationPref: (key, value) =>
    set((s) => ({
      notificationPrefs: { ...s.notificationPrefs, [key]: value },
    })),
}));

/* Convenience selectors */
export const useEquipments = () => useAppStore((s) => s.equipments);
export const useDeliveries = () => useAppStore((s) => s.deliveries);
export const useScheduledDeliveries = () =>
  useAppStore((s) => s.scheduledDeliveries);
export const useProfile = () => useAppStore((s) => s.profile);
export const useBusiness = () => useAppStore((s) => s.business);
export const useNotificationPrefs = () =>
  useAppStore((s) => s.notificationPrefs);
