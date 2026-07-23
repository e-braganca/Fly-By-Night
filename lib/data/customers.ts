/* Customer directory — used by the admin "Schedule a delivery" flow. */

export type CustomerAccount = {
  id: string;
  name: string;
  address: string;
  /** Brand logo (public/clients/*.png). */
  logo?: string;
};

export const customers: CustomerAccount[] = [
  { id: "c1", name: "BuildCore Constructors", address: "123 Maple Avenue, Sunnyvale, FL", logo: "/clients/buildcore.png" },
  { id: "c2", name: "Summit Constructors", address: "789 Maple Lane, Sunnyvale, FL", logo: "/clients/summit.png" },
  { id: "c3", name: "Aldera Builders", address: "321 Elm Avenue, Fort Lauderdale, FL", logo: "/clients/aldera.png" },
  { id: "c4", name: "IronCrest", address: "123 Ocean Blvd, West Palm Beach, FL", logo: "/clients/ironcrest.png" },
  { id: "c5", name: "Urban Build Constructors", address: "456 Sunset Drive, Coral Springs, FL", logo: "/clients/urban-build.png" },
  { id: "c6", name: "Pinnacle Construction Group", address: "88 Cypress Way, Naples, FL", logo: "/clients/pinnacle.png" },
  { id: "c7", name: "BuildMark Constructors", address: "12 Palm Street, Boca Raton, FL", logo: "/clients/buildmark.png" },
];
