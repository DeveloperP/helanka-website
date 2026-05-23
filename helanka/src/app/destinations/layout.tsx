import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations in Sri Lanka",
  description:
    "Explore 10 destinations across Sri Lanka. Ancient temples, tea highlands, beaches, and national parks. Find out what each place offers and plan your visit.",
};

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
