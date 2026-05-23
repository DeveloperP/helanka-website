import type { Metadata } from "next";
import HeroCarousel from "@/components/home/hero-carousel";
import DestinationHighlights from "@/components/home/destination-highlights";
import FeaturedPackages from "@/components/home/featured-packages";
import CtaSection from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "Sri Lanka Holiday Tours | Helanka Vacations",
  description:
    "Plan your Sri Lanka trip with local experts. Browse holiday packages, build a custom itinerary, or let us design the perfect vacation for you.",
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
