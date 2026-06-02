import type { Metadata } from "next";
import { packages } from "@/lib/packages";
import { getPackagePriceEstimates } from "@/actions/pricing-actions";
import PackagesGrid from "./packages-grid";

export const metadata: Metadata = {
  title: "Sri Lanka Travel Packages",
  description:
    "Browse 5+ holiday packages across Sri Lanka. Hill country trains, wildlife safaris, southern beaches, and adventure tours. All flexible and led by local guides.",
};

export default async function PackagesPage() {
  const priceEstimates = await getPackagePriceEstimates();

  const serialized = packages.map((pkg) => ({
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    image: pkg.image,
    durationDays: pkg.durationDays,
    difficulty: pkg.difficulty,
    price: pkg.price,
    region: pkg.region,
    minGuests: pkg.minGuests,
    maxGuests: pkg.maxGuests,
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bg-featured-packages.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-3">
            Our Packages
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl text-on-surface mb-4">
            Our Packages
          </h1>
          <p className="text-lg text-on-surface-muted max-w-lg">
            Hand-crafted itineraries designed by our local experts for every kind of traveler.
          </p>
        </div>
      </section>

      <PackagesGrid packages={serialized} priceEstimates={priceEstimates} />
    </>
  );
}
