import type { Metadata } from "next";
import HeroCarousel from "@/components/home/hero-carousel";
import DestinationHighlights from "@/components/home/destination-highlights";
import FeaturedPackages from "@/components/home/featured-packages";
import CtaSection from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "Sri Lanka Holiday Tours — Helanka Vacations",
  description:
    "Plan your perfect Sri Lanka vacation. Explore curated holiday packages, build tailor-made itineraries, and experience unforgettable journeys across the island with Helanka Vacations.",
};

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <DestinationHighlights />
      <FeaturedPackages />
      <CtaSection />
    </>
  );
}
