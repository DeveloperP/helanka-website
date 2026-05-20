"use client";

import { useRef } from "react";

interface Destination {
  name: string;
  region: string;
  image: string;
}

const destinations: Destination[] = [
  {
    name: "Yala National Park",
    region: "WILDLIFE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvL9qQCZqkuUZZhDFPiuljSOElBzTS-i7kLp90dx9jPIRgvPItqhfxy9613-soZHzobTHli7BjWkH4-Haw9lP45E2wiW9j2dUftl84hUoLQpMhO1LIzUoQRk5nyTAmY78Y-IBlM5Mrog1JBI8zdp86HBVzmlXisZYgFH5lIspaZdstoAxqxQrnPxafv0B8S_p0e8P0tS2KZMFdCj6rUEkqe56zoOq8yXRaQE2XqbrLuXWXGtJVEbnTCZcpKa2KlGrKVElRaZGsohs",
  },
  {
    name: "Ella Nine Arch",
    region: "HILL COUNTRY",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7yFEXyPuNX9h_GbgmSdd2qwI4JGC1uoPb7ulTfAcuU6WQF6HvDWujaf8QEbi-HXIPSi9Ar_221wIJRyI8Oc7J9YbONA7xBcrMWiP3j9sUxtS_xURw4mrwBaIxZ8YFeFDrWujeqMRLL2Z_yQq2sEuX2EIyjhd_ytbtIFiFgLpuMSox6uLPQ4pCNGmRMXN6AjrjBnRZaTcV7N1c8-P2ncWBgCmmQPApVYrL3GlPUK8xxdDNtop4B4tKepr0tLvqmw1IS4_2n1Kc2ko",
  },
  {
    name: "Galle Fort",
    region: "HERITAGE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiJOIXdRp0l7rGwM8eiDyKXWXVHTHtciFZ-YXdZS3Cd9Uo-jvjFfC09J1WRQpYmbcO1BEtchv6CUXXxjYi0Pj8O9AFnXORA-4OY6xP1sCWn2N6cEUxSy-Eggf1cODQjozh-4b2OecEaGjoTRnYKY5p2xzfvI7ykfVFCQobSh7YxsSpR8Jz3XPqWXMndy5ipi7S_5kAdrq6RJQjUewrywmX-gNn0HENvBLOT0nNjqBDC3yCoO4EmHmuMhnoLYkVsDUktQR6kRPhP2M",
  },
  {
    name: "Mirissa Coast",
    region: "COASTAL",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyTIo8YOpdkZbjNE4Zb0suaLf9bdAU7twbbb6gP99Rnxc612XVWmI3SRy5DGonal9DQDihBwEKQR1sKvRwuQl9xWpSNmBnPHjnZtCU0dtxO3ivqyt4kfTEhJr5ZjH04EqJdKA_2wj6K3lpUdEMEbH7siAiTWks6W-LGz9tZMbKXbt6MK48V3T3oA7-PCIWDmkLqT6ma5Iga--4Y-rNqtL5K-96EGmEPesQ_l_EqrXPd7oJCEL-0z2vnZXeTwjUpjQkrwLobtgqB0",
  },
  {
    name: "Kandy Temple",
    region: "CULTURAL",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8byS4ur0YLqV8SSm4o61Threszjg0SP-yUsTDvcAY44XGdvHjfYtEmO8xWwdqa3zsomjFqQtUBs_9fbsmGchF1ijExKBw3GDStxTXIWmBvXvbxDv6CANoGNG0bkoO87RTXHyD4ukJA_5T3DRM_YVekWrf7hsdtWPwQcUDQCJMcTQlypRC92CKbLkIXkqjXuz_5A9pFehLUBwX50r4bRM-xaJmnv9KbcgYdGPhVhfT-gJNnbo0aSzlHkBhns9h19oZzn9JNx2vi6g",
  },
];

export default function DestinationHighlights() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 bg-[#0f172a]">
      <div className="flex items-end justify-between mb-12 px-5 md:px-20 max-w-[1440px] mx-auto">
        <div>
          <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
            Destinations
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-white">
            Explore Sri Lanka
          </h2>
        </div>
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="w-12 h-12 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all flex items-center justify-center"
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-12 h-12 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all flex items-center justify-center"
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 pl-5 md:pl-20"
      >
        {destinations.map((dest) => (
          <div
            key={dest.name}
            className="group relative flex-none w-[300px] md:w-[340px] h-[420px] rounded-2xl overflow-hidden cursor-pointer snap-start"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url('${dest.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="font-[family-name:var(--font-manrope)] text-[10px] font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-2">
                {dest.region}
              </span>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-white">
                {dest.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
