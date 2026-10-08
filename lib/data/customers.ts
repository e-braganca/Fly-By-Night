/* Customer directory — used by the admin "Schedule a delivery" flow. */

export type CustomerAccount = {
  id: string;
  name: string;
  address: string;
  /** Florida county the delivery address sits in — the admin Finance filter
      groups orders by it. */
  county: County;
  /** Brand logo (public/clients/*.png). */
  logo?: string;
};

/** Counties we deliver into. Palm Beach is the home territory; Broward and
    Collier are the neighbouring spillover. */
export const COUNTIES = ["Palm Beach", "Broward", "Collier"] as const;
export type County = (typeof COUNTIES)[number];

export const customers: CustomerAccount[] = [
  { id: "c1", name: "BuildCore Constructors", address: "123 Maple Avenue, Sunnyvale, FL", county: "Palm Beach", logo: "/clients/buildcore.png" },
  { id: "c2", name: "Summit Constructors", address: "789 Maple Lane, Sunnyvale, FL", county: "Palm Beach", logo: "/clients/summit.png" },
  { id: "c3", name: "Aldera Builders", address: "321 Elm Avenue, Fort Lauderdale, FL", county: "Broward", logo: "/clients/aldera.png" },
  { id: "c4", name: "IronCrest", address: "123 Ocean Blvd, West Palm Beach, FL", county: "Palm Beach", logo: "/clients/ironcrest.png" },
  { id: "c5", name: "Urban Build Constructors", address: "456 Sunset Drive, Coral Springs, FL", county: "Broward", logo: "/clients/urban-build.png" },
  { id: "c6", name: "Pinnacle Construction Group", address: "88 Cypress Way, Naples, FL", county: "Collier", logo: "/clients/pinnacle.png" },
  { id: "c7", name: "BuildMark Constructors", address: "12 Palm Street, Boca Raton, FL", county: "Palm Beach", logo: "/clients/buildmark.png" },
];
