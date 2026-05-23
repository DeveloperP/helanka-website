import Link from "next/link";
import { packages as allPackages } from "@/lib/packages";
import { getPackagePriceEstimates } from "@/actions/pricing-actions";

const FEATURED_SLUGS = [
  "wildlife-adventure",
  "hill-country-explorer",
  "golden-southern-coast",
  "east-coast-escape",
];

export default async function FeaturedPackages() {
  const priceEstimates = await getPackagePriceEstimates();
  const featured = FEATURED_SLUGS
    .map((slug) => allPackages.find((p) => p.slug === slug))
    .filter(Boolean) as (typeof allPackages)[number][];

  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Featured packages background.png')" }}
      />
      <div className="absolute inset-0 bg-[#020617]/70" />
      <div className="relative z-10 px-5 md:px-20 max-w-[1440px] mx-auto">
      <div className="text-center mb-16">
        <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
          Curated Journeys
        </span>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-white mb-4">
          Featured Packages
        </h2>
        <p className="text-[#dac2ad] max-w-lg mx-auto">
          Hand-crafted itineraries designed by our local experts for every kind of traveler.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((pkg) => (
          <Link
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            className="group liquid-glass rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
          >
            <div className="relative h-56 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${pkg.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.durationDays} Days
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.difficulty}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-2 group-hover:text-[#ff9d00] transition-colors">
                {pkg.name}
              </h3>
              <p className="text-sm text-[#dac2ad] mb-4 leading-relaxed line-clamp-2">
                {pkg.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#dac2ad] uppercase tracking-widest mr-1">
                    from
                  </span>
                  <span className="font-[family-name:var(--font-playfair)] text-2xl text-[#ff9d00]">
                    ${(priceEstimates[pkg.slug] ?? pkg.price).toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-[#dac2ad] uppercase tracking-widest">
                  per person
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
