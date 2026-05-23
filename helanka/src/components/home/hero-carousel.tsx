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

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 120;
      c.height = 20;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, img.width, img.height * 0.12, 0, 0, 120, 20);
      const { data } = ctx.getImageData(0, 0, 120, 20);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const brightness = sum / (data.length / 4);
      window.dispatchEvent(
        new CustomEvent("hero-brightness", { detail: { light: brightness > 140 } })
      );
    };
    img.src = slides[active].image;
  }, [active]);

  const slide = slides[active];

  return (
    <header
      className="relative h-screen w-full overflow-hidden flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={s.slug + i}
          className={cn(
            "absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000",
            i === active ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url('${s.image}')` }}
        />
      ))}

      {/* Cinematic overlay */}
      <div className="absolute inset-0 z-10 hero-gradient pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto flex flex-col justify-center h-full pt-20">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left: Hero text */}
          <div
            key={`hero-text-${active}`}
            className="max-w-2xl animate-[fadeInUp_0.8s_ease-out]"
          >
            <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] mb-4 block tracking-[0.2em] uppercase drop-shadow-md">
              {slide.label}
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-[80px] leading-[1.1] text-white mb-6 drop-shadow-2xl whitespace-pre-line">
              {slide.destination}
            </h1>
            <p className="text-lg leading-7 text-white/80 mb-10 max-w-sm drop-shadow-lg">
              {slide.tagline}
            </p>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
              Explore Package
            </button>
          </div>

          {/* Right: Trip builder teaser */}
          <div className="w-full max-w-[440px] liquid-glass p-8 md:p-10 rounded-2xl shadow-2xl">
            <h2 className="font-[family-name:var(--font-playfair)] text-[32px] leading-10 text-white mb-2">
              Build Your Trip
            </h2>
            <div className="w-12 h-1 bg-[#ff9d00] mb-10" />
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-semibold text-[#dac2ad] mb-2 uppercase tracking-widest">
                  Destination
                </label>
                <select
                  value={tripDest}
                  onChange={(e) => setTripDest(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-4 px-4 text-[#e5e2e1] appearance-none focus:ring-1 focus:ring-[#ff9d00] focus:border-[#ff9d00] transition-all"
                >
                  <option value="" className="bg-[#020617]">Where to?</option>
                  {destinations.map((d) => (
                    <option key={d.slug} value={d.slug} className="bg-[#020617]">{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#dac2ad] mb-2 uppercase tracking-widest">
                  Travelers
                </label>
                <select
                  value={tripGuests}
                  onChange={(e) => setTripGuests(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-4 px-4 text-[#e5e2e1] appearance-none focus:ring-1 focus:ring-[#ff9d00] focus:border-[#ff9d00] transition-all"
                >
                  <option value="1" className="bg-[#020617]">1 Guest</option>
                  <option value="2" className="bg-[#020617]">2 Guests</option>
                  <option value="3" className="bg-[#020617]">3 Guests</option>
                  <option value="4" className="bg-[#020617]">4 Guests</option>
                  <option value="5" className="bg-[#020617]">5+ Guests</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#dac2ad] mb-2 uppercase tracking-widest">
                  Travel Dates
                </label>
                <input
                  type="date"
                  value={tripDates}
                  onChange={(e) => setTripDates(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-4 px-4 text-[#e5e2e1] placeholder:text-[#dac2ad] focus:ring-1 focus:ring-[#ff9d00] focus:border-[#ff9d00] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleBuildTrip}
                className="w-full bg-[#ff9d00] text-[#482900] py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
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
                "relative flex-1 py-5 transition-all",
                i === active ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
                <div
                  className={cn(
                    "h-full bg-[#ff9d00] transition-all duration-500",
                    i === active ? "w-full" : "w-0"
                  )}
                />
              </div>
              <div className="flex items-center gap-3 px-5 md:px-6">
                <span className="font-[family-name:var(--font-manrope)] text-sm font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="hidden md:block font-[family-name:var(--font-manrope)] text-sm truncate">
                  {label}
                </span>
              </div>
            </button>
          ))}
          <button
            onClick={next}
            className="hidden md:flex items-center justify-center px-6 text-white/40 hover:text-white transition-colors"
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
