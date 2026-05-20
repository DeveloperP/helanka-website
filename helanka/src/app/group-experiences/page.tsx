import type { Metadata } from "next";
import Link from "next/link";
import { experiences } from "@/lib/group-experiences";

export const metadata: Metadata = {
  title: "Group Experiences",
  description:
    "Corporate retreats, weddings, school expeditions, and family reunions — curated group travel across Sri Lanka.",
};

export default function GroupExperiencesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${experiences[0].image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="font-[family-name:var(--font-manrope)] text-xs font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
            Travel Together
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl text-white mb-4">
            Group Experiences
          </h1>
          <p className="text-lg text-white/70 max-w-lg">
            From boardroom to beach — bespoke group journeys for every occasion.
          </p>
        </div>
      </section>

      {/* Alternating feature sections */}
      <section className="relative py-20 px-8 md:px-24 lg:px-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-[0.07]"
          style={{ backgroundImage: "url('/Sigiriya.jpeg')" }}
        />
        <div className="relative z-10 max-w-[1440px] mx-auto space-y-24">
        {experiences.map((exp, i) => (
          <div
            key={exp.slug}
            className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-10 items-center`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 h-[400px] rounded-2xl overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('${exp.image}')` }}
              />
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2">
              <span className="font-[family-name:var(--font-manrope)] text-[10px] font-semibold text-[#ff9d00] tracking-[0.2em] uppercase block mb-3">
                {exp.tagline}
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-white mb-4">
                {exp.name}
              </h2>
              <p className="text-[#dac2ad] leading-relaxed mb-6">
                {exp.description}
              </p>

              <div className="flex gap-6 mb-6 text-sm">
                <div>
                  <span className="block text-[#dac2ad] text-[10px] uppercase tracking-widest mb-1">Group Size</span>
                  <span className="text-white font-medium">{exp.groupSize} people</span>
                </div>
                <div>
                  <span className="block text-[#dac2ad] text-[10px] uppercase tracking-widest mb-1">Duration</span>
                  <span className="text-white font-medium">{exp.durationDays} Days</span>
                </div>
                <div>
                  <span className="block text-[#dac2ad] text-[10px] uppercase tracking-widest mb-1">From</span>
                  <span className="text-[#ff9d00] font-medium">${exp.price}/person</span>
                </div>
              </div>

              <ul className="space-y-2 mb-8">
                {exp.includes.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#dac2ad]">
                    <span className="text-[#ff9d00] shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={`/build?experience=${exp.slug}`}
                className="inline-block bg-[#ff9d00] text-[#482900] px-10 py-4 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-105 active:scale-95"
              >
                Plan This Experience
              </Link>
            </div>
          </div>
        ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 md:px-24 lg:px-32">
        <div className="max-w-[1440px] mx-auto liquid-glass rounded-3xl p-12 md:p-20 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-white mb-4">
            Something else in mind?
          </h2>
          <p className="text-lg text-[#dac2ad] max-w-xl mx-auto mb-10">
            We design custom group experiences for any occasion. Tell us your vision and we&apos;ll make it happen.
          </p>
          <Link
            href="/build"
            className="inline-block bg-[#ff9d00] text-[#482900] px-12 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:bg-[#e68d00] transition-all hover:scale-105 active:scale-95"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
