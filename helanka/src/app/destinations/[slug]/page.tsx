import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destinations, getDestinationBySlug } from "@/lib/destinations";
import { packages, getExcursionsForDestination } from "@/lib/packages";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) return { title: "Destination Not Found" };
  return {
    title: dest.name,
    description: dest.description,
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestinationBySlug(slug);
  if (!dest) notFound();

  const relatedPackages = packages.filter(
    (p) => p.region.toLowerCase().includes(dest.region.toLowerCase().split(" ")[0])
  );

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${dest.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />

        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pt-32">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Destinations
          </Link>
          <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
            {dest.region}
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-6xl md:text-8xl text-white uppercase tracking-tight">
            {dest.name}
          </h1>
        </div>

        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-12">
          <div className="flex flex-wrap gap-4">
            {dest.facts.map((f) => (
              <div key={f.label} className="liquid-glass rounded-xl px-5 py-4">
                <span className="text-[10px] text-[#dac2ad] uppercase tracking-widest block">{f.label}</span>
                <span className="text-white font-[family-name:var(--font-playfair)] text-lg">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-6">
              {dest.tagline}
            </h2>
            <p className="text-[#dac2ad] leading-relaxed text-lg">
              {dest.description}
            </p>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-manrope)] text-xs font-bold text-[#ff9d00] tracking-[0.2em] uppercase mb-6">
              Highlights
            </h3>
            <ul className="space-y-4">
              {dest.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="text-[#ff9d00] mt-1 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-[#e5e2e1]">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Excursions */}
      {(() => {
        const excursions = getExcursionsForDestination(dest.slug);
        if (excursions.length === 0) return null;
        return (
          <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-3">
              Excursions in {dest.name}
            </h2>
            <p className="text-[#dac2ad] mb-10 max-w-2xl">
              Hand-picked activities available as part of our curated packages.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {excursions.map((exc) => (
                <div
                  key={exc.id}
                  className="liquid-glass rounded-2xl p-6 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg text-white">
                      {exc.name}
                    </h3>
                    <span className="text-xs text-white/40 uppercase tracking-wider flex-shrink-0 ml-4">
                      {exc.durationHours}h
                    </span>
                  </div>
                  <p className="text-[#dac2ad] text-sm leading-relaxed">
                    {exc.description}
                  </p>
                  <Link
                    href={`/packages/${exc.packageSlug}`}
                    className="text-[#ff9d00] text-xs font-semibold tracking-wider uppercase hover:text-[#e68d00] transition-colors self-start"
                  >
                    Part of {exc.packageName} →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Related packages */}
      {relatedPackages.length > 0 && (
        <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-10">
            Packages featuring {dest.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPackages.map((pkg) => (
              <Link
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                className="group liquid-glass rounded-2xl overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${pkg.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-1 group-hover:text-[#ff9d00] transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-[#dac2ad]">{pkg.durationDays} Days · ${pkg.price.toLocaleString()}/person</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-8 md:px-24 lg:px-32">
        <div className="max-w-[1440px] mx-auto liquid-glass rounded-3xl p-12 md:p-16 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-white mb-4">
            Want to visit {dest.name}?
          </h2>
          <p className="text-[#dac2ad] max-w-lg mx-auto mb-8">
            Let us build a custom itinerary around this destination — tailored to your dates, pace, and interests.
          </p>
          <Link
            href={`/build?destination=${dest.slug}`}
            className="inline-block bg-[#ff9d00] text-[#482900] px-12 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-105 active:scale-95"
          >
            Build Your Trip
          </Link>
        </div>
      </section>
    </>
  );
}
