import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { packages, getPackageBySlug } from "@/lib/packages";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return { title: "Package Not Found" };
  return {
    title: pkg.name,
    description: pkg.description,
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  const stats = [
    { value: `${pkg.itinerary.length} stops`, label: "across Sri Lanka" },
    { value: `${pkg.durationDays} days`, label: "of adventure" },
    { value: pkg.difficulty, label: "difficulty" },
    { value: `${pkg.minGuests}–${pkg.maxGuests}`, label: "guests" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[700px] flex flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${pkg.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pt-32">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All Packages
          </Link>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-on-surface uppercase tracking-tight">
            {pkg.name}
          </h1>
        </div>

        <div className="relative z-10 w-full px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-12">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass-panel rounded-xl px-4 sm:px-5 py-3 sm:py-4 min-w-[110px] sm:min-w-[140px]"
              >
                <span className="block text-on-surface font-[family-name:var(--font-display)] text-lg">
                  {s.value}
                </span>
                <span className="text-[11px] text-on-surface-muted uppercase tracking-widest">
                  {s.label}
                </span>
              </div>
            ))}
            <Link
              href="/build"
              className="pressable bg-primary text-on-primary rounded-xl px-8 py-4 flex items-center text-xs font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* About the Tour */}
      <section className="py-24 px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-px flex-1 bg-outline" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-on-surface uppercase tracking-wide shrink-0">
            About the Tour
          </h2>
          <div className="h-px flex-1 bg-outline" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-lg text-on-surface-muted leading-relaxed mb-8">
              {pkg.description}
            </p>
            <p className="text-base text-on-surface-subtle leading-relaxed">
              No need to worry about routes, schedules, or finding places: everything is already
              organized. We&apos;ll show you where to go, what to see, and where to eat, so you can
              simply <span className="text-on-surface underline underline-offset-4">enjoy the journey</span>.
            </p>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-outline" />
            <div className="space-y-10">
              {pkg.itinerary.map((day, i) => (
                <div key={day.day} className="relative flex gap-6">
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full border-2 border-primary/50 bg-background flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-primary uppercase tracking-widest font-semibold">
                      Day {day.day}
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-xl text-on-surface mt-1 mb-2">
                      {day.title}
                    </h3>
                    <p className="text-sm text-on-surface-muted leading-relaxed">
                      {day.description}
                    </p>
                    {i < 3 && (
                      <div className="flex gap-2 mt-4">
                        <div
                          className="w-20 h-14 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url('${pkg.image}')` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-px flex-1 bg-outline" />
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-on-surface uppercase tracking-wide shrink-0">
            What&apos;s Included
          </h2>
          <div className="h-px flex-1 bg-outline" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: "Expert Guides",
              desc: "Local naturalists and cultural experts who know every hidden gem.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              ),
              title: "Transfers",
              desc: "Air-conditioned private vehicles for all airport and inter-city transfers.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
              title: "Hotels",
              desc: "Boutique and heritage hotels, handpicked for comfort and character.",
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              ),
              title: "Meals",
              desc: "Daily breakfast and selected dinners featuring authentic Sri Lankan cuisine.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="surface-card rounded-2xl p-6 hover:border-outline-hover transition-all"
            >
              <div className="text-primary mb-4">{item.icon}</div>
              <h3 className="text-base font-bold text-on-surface mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="book" className="relative min-h-[500px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${pkg.image}')` }}
        />
        <div className="absolute inset-0 bg-background/60" />

        <div className="relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto py-20">
          <div className="max-w-lg">
            <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-on-surface mb-4">
              Ready to Experience This?
            </h2>
            <p className="text-on-surface-muted mb-8 leading-relaxed">
              Sign in to build your custom itinerary with this package as a starting point. Our travel specialists will refine every detail.
            </p>
            <Link
              href="/build"
              className="pressable inline-block bg-primary text-on-primary px-12 py-5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase hover:brightness-110 transition-all"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
