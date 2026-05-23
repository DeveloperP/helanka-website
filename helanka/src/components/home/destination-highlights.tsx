"use client";

import { useRef } from "react";
import Link from "next/link";

interface Destination {
  name: string;
  slug: string;
  region: string;
  image: string;
}

const destinations: Destination[] = [
  {
    name: "Yala National Park",
    slug: "yala",
    region: "WILDLIFE",
    image: "/images/destinations/dest-yala.jpg",
  },
  {
    name: "Ella Nine Arch",
    slug: "ella",
    region: "HILL COUNTRY",
    image: "/images/destinations/dest-ella.jpg",
  },
  {
    name: "Galle Fort",
    slug: "galle",
    region: "HERITAGE",
    image: "/images/destinations/dest-galle.jpg",
  },
  {
    name: "Mirissa Coast",
    slug: "mirissa",
    region: "COASTAL",
    image: "/images/destinations/dest-mirissa.jpg",
  },
  {
    name: "Kandy Temple",
    slug: "kandy",
    region: "CULTURAL",
    image: "/images/destinations/dest-kandy.jpg",
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
          <Link
            key={dest.name}
            href={`/destinations/${dest.slug}`}
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
          </Link>
        ))}
      </div>
    </section>
  );
}
