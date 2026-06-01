"use client";

import Link from "next/link";
import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal";

interface PackageData {
  slug: string;
  name: string;
  description: string;
  image: string;
  durationDays: number;
  difficulty: string;
  price: number;
  region: string;
  minGuests: number;
  maxGuests: number;
}

export default function PackagesGrid({
  packages,
  priceEstimates,
}: {
  packages: PackageData[];
  priceEstimates: Record<string, number>;
}) {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useStaggerReveal<HTMLDivElement>();

  return (
    <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Link
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            data-stagger
            className="group surface-card rounded-2xl overflow-hidden hover:border-outline-hover transition-all duration-300"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <div className="relative h-64 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${pkg.image}')`, transitionTimingFunction: "var(--ease-out)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-surface-raised/60 backdrop-blur-sm text-on-surface text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.durationDays} Days
                </span>
                <span className="bg-surface-raised/60 backdrop-blur-sm text-on-surface text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.difficulty}
                </span>
                <span className="bg-surface-raised/60 backdrop-blur-sm text-on-surface text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                  {pkg.minGuests}-{pkg.maxGuests} Guests
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="text-[10px] font-semibold text-primary tracking-[0.2em] uppercase">
                  {pkg.region}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface mb-3 group-hover:text-primary transition-colors">
                {pkg.name}
              </h2>
              <p className="text-sm text-on-surface-muted mb-5 leading-relaxed line-clamp-2">
                {pkg.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-on-surface-muted uppercase tracking-widest mr-1">
                    from
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-2xl text-primary">
                    ${(priceEstimates[pkg.slug] ?? pkg.price).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-on-surface-muted uppercase tracking-widest ml-2">
                    per person
                  </span>
                </div>
                <span className="text-on-surface-subtle group-hover:text-primary group-hover:translate-x-1 transition-all">
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
  );
}
