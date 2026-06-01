"use client";

import Link from "next/link";
import { experiences } from "@/lib/group-experiences";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function GroupExperiencesPage() {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${experiences[0].image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div ref={heroRef} className="reveal relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase block mb-3">
            Travel Together
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl text-on-surface mb-4">
            Group Experiences
          </h1>
          <p className="text-lg text-on-surface-muted max-w-lg">
            From boardroom to beach: bespoke group journeys for every occasion.
          </p>
        </div>
      </section>

      {/* Alternating feature sections */}
      <section className="relative py-20 px-8 md:px-24 lg:px-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-[0.07]"
          style={{ backgroundImage: "url('/images/public-sigiriya.jpg')" }}
        />
        <div className="relative z-10 max-w-[1440px] mx-auto space-y-24">
        {experiences.map((exp, i) => (
          <ExperienceRow key={exp.slug} exp={exp} reversed={i % 2 !== 0} />
        ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 md:px-24 lg:px-32">
        <div ref={ctaRef} className="reveal max-w-[1440px] mx-auto surface-card rounded-3xl p-12 md:p-20 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-on-surface mb-4">
            Something else in mind?
          </h2>
          <p className="text-lg text-on-surface-muted max-w-xl mx-auto mb-10">
            We design custom group experiences for any occasion. Tell us your vision and we&apos;ll make it happen.
          </p>
          <Link
            href="/contact"
            className="pressable inline-block bg-primary text-on-primary px-12 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}

function ExperienceRow({ exp, reversed }: { exp: typeof experiences[number]; reversed: boolean }) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-10 items-center`}
    >
      <div className="w-full lg:w-1/2 h-[400px] rounded-2xl overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('${exp.image}')`, transitionTimingFunction: "var(--ease-out)" }}
        />
      </div>

      <div className="w-full lg:w-1/2">
        <span className="text-[10px] font-semibold text-primary tracking-[0.2em] uppercase block mb-3">
          {exp.tagline}
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl text-on-surface mb-4">
          {exp.name}
        </h2>
        <p className="text-on-surface-muted leading-relaxed mb-6">
          {exp.description}
        </p>

        <div className="flex gap-6 mb-6 text-sm">
          <div>
            <span className="block text-on-surface-muted text-[10px] uppercase tracking-widest mb-1">Group Size</span>
            <span className="text-on-surface font-medium">{exp.groupSize} people</span>
          </div>
          <div>
            <span className="block text-on-surface-muted text-[10px] uppercase tracking-widest mb-1">Duration</span>
            <span className="text-on-surface font-medium">{exp.durationDays} Days</span>
          </div>
          <div>
            <span className="block text-on-surface-muted text-[10px] uppercase tracking-widest mb-1">From</span>
            <span className="text-primary font-medium">${exp.price}/person</span>
          </div>
        </div>

        <ul className="space-y-2 mb-8">
          {exp.includes.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-on-surface-muted">
              <span className="text-primary shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/build"
          className="pressable inline-block bg-primary text-on-primary px-10 py-4 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all"
        >
          Start Planning
        </Link>
      </div>
    </div>
  );
}
