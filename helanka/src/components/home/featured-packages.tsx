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
}

interface FeaturedPackagesProps {
  packages: PackageData[];
}

export default function FeaturedPackages({ packages }: FeaturedPackagesProps) {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useStaggerReveal<HTMLDivElement>();

  return (
    <section className="relative py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg-featured-packages.webp')" }}
      />
      <div className="absolute inset-0 bg-surface/80" />
      <div className="relative z-10 px-6 md:px-20 max-w-[1440px] mx-auto">
        <div ref={headingRef} className="reveal text-center mb-16">
          <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-3">
            Curated by Locals
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Featured Packages
          </h2>
          <p className="text-on-surface-muted max-w-lg mx-auto text-sm leading-relaxed">
            Each trip is designed by someone who knows the island. Flexible dates, experienced guides, and everything included.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {packages.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/packages/${pkg.slug}`}
              data-stagger
              className="group surface-card rounded-2xl overflow-hidden"
            >
              <div className="relative h-52 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${pkg.image}')`,
                    transitionTimingFunction: "var(--ease-out)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-surface/60 backdrop-blur-sm text-white text-[11px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-md">
                    {pkg.durationDays} Days
                  </span>
                  <span className="bg-surface/60 backdrop-blur-sm text-white text-[11px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-md">
                    {pkg.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg text-white mb-2 group-hover:text-primary transition-colors duration-200">
                  {pkg.name}
                </h3>
                <p className="text-sm text-on-surface-muted leading-relaxed line-clamp-2">
                  {pkg.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
