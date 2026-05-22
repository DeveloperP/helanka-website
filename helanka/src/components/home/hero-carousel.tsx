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
      "Ascend the lion rock and witness the echoes of a kingdom carved into the clouds. A journey through history, luxury, and untamed beauty.",
    slug: "sigiriya",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
  },
  {
    destination: "Emerald\nHighlands",
    label: "The Tea Country",
    region: "HILL COUNTRY",
    tagline:
      "Journey through mist-wrapped mountains and endless tea plantations aboard the world's most scenic train ride.",
    slug: "ella",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
  },
  {
    destination: "Shores of\nMirissa",
    label: "The Southern Coast",
    region: "COASTAL",
    tagline:
      "Where palm-fringed beaches meet the deep Indian Ocean. Surf, sunsets, and the silence of pristine coastline.",
    slug: "galle",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
  },
  {
    destination: "Wild Heart\nof Yala",
    label: "The Safari",
    region: "WILDLIFE",
    tagline:
      "Track leopards through savannah and lagoon in Sri Lanka's premier national park. A luxury wildlife odyssey.",
    slug: "yala",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
  },
  {
    destination: "Fortress\nof Galle",
    label: "The Heritage",
    region: "HERITAGE",
    tagline:
      "A UNESCO fortress town where Dutch colonial walls embrace artisan boutiques, ocean views, and centuries of living history.",
    slug: "galle",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
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
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#ff9d00] text-[#482900] px-10 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-105 active:scale-95">
                Explore Package
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/20 transition-all">
                Watch Story
              </button>
            </div>
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
