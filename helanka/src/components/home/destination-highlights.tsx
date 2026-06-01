"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  useScrollReveal,
  useStaggerReveal,
} from "@/hooks/use-scroll-reveal";

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
  const headingRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useStaggerReveal<HTMLDivElement>();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-28 bg-surface">
      <div
        ref={headingRef}
        className="reveal flex items-end justify-between mb-14 px-6 md:px-20 max-w-[1440px] mx-auto"
      >
        <div>
          <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-3">
            Destinations
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-white tracking-tight">
            Explore Sri Lanka
          </h2>
        </div>
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="pressable w-11 h-11 rounded-full border border-outline text-on-surface-muted hover:text-white hover:border-outline-hover transition-colors duration-200 flex items-center justify-center"
            aria-label="Scroll left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="pressable w-11 h-11 rounded-full border border-outline text-on-surface-muted hover:text-white hover:border-outline-hover transition-colors duration-200 flex items-center justify-center"
            aria-label="Scroll right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={cardsRef}>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 pl-6 md:pl-20"
      >
        {destinations.map((dest) => (
          <Link
            key={dest.name}
            href={`/destinations/${dest.slug}`}
            data-stagger
            className="group relative flex-none w-[280px] md:w-[320px] h-[400px] rounded-2xl overflow-hidden cursor-pointer snap-start"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${dest.image}')`,
                transitionTimingFunction: "var(--ease-out)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-[10px] font-semibold text-primary tracking-[0.2em] uppercase block mb-2">
                {dest.region}
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-white tracking-tight">
                {dest.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
