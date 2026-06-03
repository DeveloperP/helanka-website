"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function CtaSection() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-28 px-6 md:px-20">
      <div
        ref={ref}
        className="reveal max-w-[1440px] mx-auto surface-card rounded-3xl p-6 sm:p-12 md:p-20 text-center"
      >
        <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-4">
          Start Planning
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-white mb-6 max-w-2xl mx-auto leading-tight tracking-tight">
          Ready to Plan Your Trip?
        </h2>
        <p className="text-base text-on-surface-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Tell us where you want to go and what you want to do. We will put the rest together. Free consultation, no pressure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/build"
            className="pressable bg-primary text-on-primary px-10 py-4 text-xs font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all rounded-lg"
          >
            Build Your Trip
          </Link>
          <Link
            href="/packages"
            className="pressable bg-white/6 border border-outline text-white px-10 py-4 text-xs font-bold tracking-[0.1em] uppercase hover:bg-white/10 hover:border-outline-hover transition-all rounded-lg"
          >
            Browse Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
