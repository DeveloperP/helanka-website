import type { Metadata } from "next";
import Link from "next/link";
import { packages } from "@/lib/packages";
import { getPackagePriceEstimates } from "@/actions/pricing-actions";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Explore our curated Sri Lanka travel packages — from hill country train journeys to wildlife safaris and coastal escapes.",
};

export default async function PackagesPage() {
  const priceEstimates = await getPackagePriceEstimates();
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Featured packages background.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
            Curated Journeys
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl text-white mb-4">
            Our Packages
          </h1>
          <p className="text-lg text-white/70 max-w-lg">
            Hand-crafted itineraries designed by our local experts for every kind of traveler.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-white/10 sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32 flex gap-6 overflow-x-auto scrollbar-hide py-4">
          {["All", "Hill Country", "Southern", "Eastern Coast"].map((region) => (
            <button
              key={region}
              className="text-sm text-[#dac2ad] hover:text-[#ff9d00] transition-colors whitespace-nowrap font-[family-name:var(--font-manrope)] font-semibold tracking-wide first:text-[#ff9d00]"
            >
              {region}
            </button>
          ))}
        </div>
      </section>

      {/* Package grid */}
      <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/packages/${pkg.slug}`}
              className="group liquid-glass rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden">
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
                  <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                    {pkg.minGuests}–{pkg.maxGuests} Guests
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="font-[family-name:var(--font-manrope)] text-[10px] font-semibold text-[#ff9d00] tracking-[0.2em] uppercase">
                    {pkg.region}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-3 group-hover:text-[#ff9d00] transition-colors">
                  {pkg.name}
                </h2>
                <p className="text-sm text-[#dac2ad] mb-5 leading-relaxed line-clamp-2">
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
                    <span className="text-[10px] text-[#dac2ad] uppercase tracking-widest ml-2">
                      per person
                    </span>
                  </div>
                  <span className="text-white/40 group-hover:text-[#ff9d00] group-hover:translate-x-1 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
