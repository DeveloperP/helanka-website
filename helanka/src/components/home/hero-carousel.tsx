"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { destinations } from "@/lib/destinations";

interface Slide {
  destination: string;
  label: string;
  region: string;
  tagline: string;
  slug: string;
  image: string;
}

const slides: Slide[] = [
  {
    destination: "Majesty of\nSigiriya",
    label: "The Ancient Throne",
    region: "CULTURAL TRIANGLE",
    tagline:
      "Climb a 1,200-year-old fortress that rises 200 metres above the plains. Ancient frescoes, royal gardens, and views that reach the horizon.",
    slug: "sigiriya",
    image: "/images/heroes/hero-sigiriya.jpg",
  },
  {
    destination: "Emerald\nHighlands",
    label: "The Tea Country",
    region: "HILL COUNTRY",
    tagline:
      "Watch the highlands roll past your train window. Tea estates, waterfalls, and the famous Nine Arch Bridge. The pace here is slow and that is the whole point.",
    slug: "ella",
    image: "/images/heroes/hero-ella.jpg",
  },
  {
    destination: "Shores of\nMirissa",
    label: "The Southern Coast",
    region: "COASTAL",
    tagline:
      "Golden sand, whale watching boats heading out at dawn, and fresh seafood grilled on the beach. The south coast at its simplest.",
    slug: "galle",
    image: "/images/heroes/hero-mirissa.jpg",
  },
  {
    destination: "Wild Heart\nof Yala",
    label: "The Safari",
    region: "WILDLIFE",
    tagline:
      "One of the highest leopard densities anywhere on Earth. Safari jeeps leave at sunrise. Crocodiles, painted storks, and spotted cats.",
    slug: "yala",
    image: "/images/heroes/hero-yala.jpg",
  },
  {
    destination: "Fortress\nof Galle",
    label: "The Heritage",
    region: "HERITAGE",
    tagline:
      "Walk along 350-year-old ramparts with the ocean below. The old town has bookshops, galleries, and restaurants where the salt air comes right in.",
    slug: "galle",
    image: "/images/heroes/hero-galle.jpg",
  },
];

const navLabels = [
  "Sigiriya",
  "Ella Plantations",
  "Mirissa Coast",
  "Yala Safari",
  "Galle Fort",
];

export default function HeroCarousel() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tripDest, setTripDest] = useState("");
  const [tripGuests, setTripGuests] = useState("2");
  const [tripDates, setTripDates] = useState("");

  function handleBuildTrip() {
    const params = new URLSearchParams();
    if (tripDest) params.set("destination", tripDest);
    if (tripGuests) params.set("guests", tripGuests);
    if (tripDates) params.set("arrival", tripDates);
    router.push(`/build${params.toString() ? `?${params}` : ""}`);
  }

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = slides[active];

  return (
    <section
      className="relative h-screen w-full overflow-hidden flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured destinations"
    >
      {/* Background images with blur crossfade */}
      {slides.map((s, i) => (
        <div
          key={s.slug + i}
          className={cn(
            "absolute inset-0 z-0 bg-cover bg-center hero-slide",
            i === active ? "hero-slide-active" : "hero-slide-inactive"
          )}
          style={{ backgroundImage: `url('${s.image}')` }}
          aria-hidden={i !== active}
        />
      ))}

      {/* Cinematic overlay */}
      <div className="absolute inset-0 z-10 hero-gradient pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 w-full px-6 md:px-20 lg:px-28 max-w-[1440px] mx-auto flex flex-col justify-center h-full pt-20">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left: Hero text with blur entrance */}
          <div
            key={`hero-text-${active}`}
            className="max-w-2xl hero-text-enter"
            role="group"
            aria-roledescription="slide"
            aria-label={`${active + 1} of ${slides.length}: ${slide.label}`}
          >
            <span className="text-xs font-semibold text-primary mb-4 block tracking-[0.2em] uppercase">
              {slide.label}
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-[72px] leading-[1.05] text-white mb-6 whitespace-pre-line tracking-tight">
              {slide.destination}
            </h1>
            <p className="text-base leading-7 text-white/70 mb-10 max-w-sm">
              {slide.tagline}
            </p>
            <button
              onClick={() => router.push(`/destinations/${slide.slug}`)}
              className="pressable bg-white/8 border border-white/15 text-white px-10 py-4 rounded-lg text-xs font-semibold tracking-[0.1em] uppercase hover:bg-white/12 transition-colors"
            >
              Explore {slide.label.split("The ")[1] || slide.label}
            </button>
          </div>

          {/* Right: Trip builder */}
          <div className="w-full max-w-[420px] glass-panel p-8 md:p-10 rounded-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-[28px] leading-9 text-white mb-2">
              Build Your Trip
            </h2>
            <div className="w-10 h-[2px] bg-primary mb-8" />
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="hero-dest"
                  className="block text-[11px] font-medium text-on-surface-muted mb-2 uppercase tracking-widest"
                >
                  Destination
                </label>
                <select
                  id="hero-dest"
                  value={tripDest}
                  onChange={(e) => setTripDest(e.target.value)}
                  className="w-full bg-white/5 border border-outline rounded-lg py-3.5 px-4 text-foreground appearance-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                >
                  <option value="" className="bg-surface">Where to?</option>
                  {destinations.map((d) => (
                    <option key={d.slug} value={d.slug} className="bg-surface">{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="hero-guests"
                  className="block text-[11px] font-medium text-on-surface-muted mb-2 uppercase tracking-widest"
                >
                  Travelers
                </label>
                <select
                  id="hero-guests"
                  value={tripGuests}
                  onChange={(e) => setTripGuests(e.target.value)}
                  className="w-full bg-white/5 border border-outline rounded-lg py-3.5 px-4 text-foreground appearance-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                >
                  <option value="1" className="bg-surface">1 Guest</option>
                  <option value="2" className="bg-surface">2 Guests</option>
                  <option value="3" className="bg-surface">3 Guests</option>
                  <option value="4" className="bg-surface">4 Guests</option>
                  <option value="5" className="bg-surface">5+ Guests</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="hero-dates"
                  className="block text-[11px] font-medium text-on-surface-muted mb-2 uppercase tracking-widest"
                >
                  Travel Dates
                </label>
                <input
                  id="hero-dates"
                  type="date"
                  value={tripDates}
                  onChange={(e) => setTripDates(e.target.value)}
                  className="w-full bg-white/5 border border-outline rounded-lg py-3.5 px-4 text-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleBuildTrip}
                className="pressable w-full bg-primary text-on-primary py-4 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all mt-2"
              >
                Build My Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom carousel nav */}
      <div className="absolute bottom-0 left-0 w-full z-30">
        <div className="flex max-w-[1440px] mx-auto">
          {navLabels.map((label, i) => (
            <button
              key={label}
              onClick={() => setActive(i)}
              className={cn(
                "pressable relative flex-1 py-5 transition-colors duration-300",
                i === active ? "text-white" : "text-white/30 hover:text-white/60"
              )}
              aria-label={`Go to slide ${i + 1}: ${label}`}
              aria-current={i === active ? "true" : undefined}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/8">
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-700",
                    i === active ? "w-full" : "w-0"
                  )}
                  style={{ transitionTimingFunction: "var(--ease-out)" }}
                />
              </div>
              <div className="flex items-center gap-3 px-4 md:px-6">
                <span className="text-sm font-bold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="hidden md:block text-sm truncate">
                  {label}
                </span>
              </div>
            </button>
          ))}
          <button
            onClick={next}
            className="hidden md:flex items-center justify-center px-6 text-white/30 hover:text-white transition-colors duration-200"
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
