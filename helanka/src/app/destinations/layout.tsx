import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Sri Lanka Destinations",
  description:
    "Explore 10+ destinations across Sri Lanka with Helanka Vacations. Ancient temples, tea highlands, beaches, and national parks. Find your perfect holiday spot.",
};

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
