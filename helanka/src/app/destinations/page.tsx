"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { destinations, regionFilters } from "@/lib/destinations";

const categoryTabs = ["Heritage", "Adventure", "Wildlife", "Coastal", "Cultural"];

export default function DestinationsPage() {
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState("All");
  const dest = destinations[active];

  const filtered = filter === "All"
    ? destinations
    : destinations.filter((d) => d.region === filter);

  return (
    <>
      {/* ── Full-screen hero with destination switcher ── */}
      <section className="relative h-screen min-h-[700px] flex flex-col overflow-hidden">
        {/* Background images */}
        {destinations.map((d, i) => (
          <div
            key={d.slug}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
              i === active ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundImage: `url('${d.image}')` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-[#020617]/40" />

        {/* Category tabs */}
        <div className="relative z-20 flex justify-center gap-8 pt-28 pb-4">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              className="text-sm text-white/50 hover:text-white transition-colors font-[family-name:var(--font-manrope)] font-medium tracking-wide"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Center content */}
        <div className="relative z-20 flex-1 flex flex-col items-start justify-center px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto w-full">
          <h1
            key={`dest-title-${active}`}
            className="font-[family-name:var(--font-playfair)] text-6xl md:text-8xl lg:text-9xl text-white uppercase tracking-tight mb-6 animate-[fadeInUp_0.6s_ease-out]"
          >
            Visit
            <br />
            {dest.name}
          </h1>

          {/* Info cards row */}
          <div
            key={`dest-info-${active}`}
            className="flex flex-wrap gap-6 mb-6 animate-[fadeInUp_0.6s_ease-out_0.2s_both]"
          >
            <p className="text-white/60 max-w-md text-sm leading-relaxed">
              {dest.description.slice(0, 160)}…
            </p>
          </div>

          <Link
            href={`/destinations/${dest.slug}`}
            className="inline-flex items-center gap-2 text-[#ff9d00] text-sm font-semibold uppercase tracking-widest hover:gap-4 transition-all"
          >
            Explore
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Numbered destination nav - right side */}
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end gap-2">
          {destinations.map((d, i) => (
            <button
              key={d.slug}
              onClick={() => setActive(i)}
              className={cn(
                "flex items-center gap-3 transition-all group",
                i === active ? "text-white" : "text-white/30 hover:text-white/60"
              )}
            >
              <span
                className={cn(
                  "hidden md:block text-xs font-[family-name:var(--font-manrope)] tracking-wide transition-opacity",
                  i === active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                {d.name}
              </span>
              <span className={cn(
                "font-[family-name:var(--font-playfair)] transition-all",
                i === active ? "text-3xl font-bold" : "text-lg"
              )}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {i === active && (
                <div className="w-8 h-[2px] bg-[#ff9d00]" />
              )}
            </button>
          ))}
        </div>

        {/* Swipe hint */}
        <div className="relative z-20 pb-8 px-8 md:px-24 lg:px-32">
          <span className="text-white/30 text-sm font-bold uppercase tracking-widest">
            Swipe &raquo;
          </span>
        </div>
      </section>

      {/* ── Destination grid ── */}
      <section className="py-20 px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <div className="h-px flex-1 bg-white/10" />
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-white shrink-0">
            Find your favorite destination
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Region filter */}
        <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide pb-2">
          {regionFilters.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={cn(
                "text-sm whitespace-nowrap px-4 py-2 rounded-full border transition-all font-[family-name:var(--font-manrope)] font-semibold tracking-wide",
                filter === r
                  ? "border-[#ff9d00] text-[#ff9d00] bg-[#ff9d00]/10"
                  : "border-white/10 text-[#dac2ad] hover:border-white/30 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d, i) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group relative h-[350px] rounded-2xl overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${d.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="font-[family-name:var(--font-playfair)] text-4xl text-white/20 font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="font-[family-name:var(--font-manrope)] text-[10px] font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-1">
                  {d.region}
                </span>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-white mb-1">
                  {d.name}
                </h3>
                <p className="text-xs text-white/50">{d.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Video / Explore CTA ── */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${destinations[1].image}')` }}
        />
        <div className="absolute inset-0 bg-[#020617]/60" />
        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto py-20">
          <h2 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-white uppercase mb-6 max-w-lg">
            Travel and enjoy your holiday
          </h2>
          <p className="text-white/60 max-w-md mb-8 leading-relaxed">
            Sri Lanka packs more diversity into a small island than most continents.
            Every hour of driving opens a new world. Ancient ruins, misty peaks, golden coasts, and untamed jungle.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#ff9d00] text-[#482900] px-12 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-105 active:scale-95"
          >
            Sign In to Start
          </Link>
        </div>
      </section>
    </>
  );
}
