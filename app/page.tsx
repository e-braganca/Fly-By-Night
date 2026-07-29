import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

/* The marketing landing is the app's front door for every visitor. Signing in
   and requesting a delivery stay two separate actions from here — see
   components/landing/content.ts (SIGNIN_URL / REQUEST_URL). */

export const metadata: Metadata = {
  title: "Fly by Night Fuel — Diesel delivered. Day or night.",
  description:
    "Bulk off-road diesel and DEF, wet-hosed straight to your equipment, tanks, and gensets across Palm Beach County.",
};

export default function Home() {
  return <LandingPage />;
}
