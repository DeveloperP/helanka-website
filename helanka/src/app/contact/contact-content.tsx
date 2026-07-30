"use client";

import { useState, useTransition } from "react";
import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal";
import { submitContactForm } from "@/actions/contact-actions";
import Turnstile from "@/components/turnstile";

const tripTypes = [
  "Luxury Tour",
  "Adventure & Hiking",
  "Cultural Heritage",
  "Wildlife Safari",
  "Beach & Coastal",
  "Honeymoon",
  "Group Experience",
  "Custom Itinerary",
];

export default function ContactContent() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const heroRef = useScrollReveal<HTMLDivElement>();
  const formRef = useScrollReveal<HTMLDivElement>();
  const sidebarRef = useStaggerReveal<HTMLDivElement>();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitContactForm(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          role="img"
          aria-label="Sigiriya Rock Fortress, Sri Lanka"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/public-sigiriya.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div ref={heroRef} className="reveal relative z-10 w-full px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="inline-block bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Get in Touch
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl text-on-surface mb-4 max-w-3xl">
            Let&apos;s Plan Your Trip
          </h1>
          <p className="text-on-surface-muted max-w-lg">
            Tell us your dates and interests, or just send a rough idea. We will work out the details together.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="bg-background py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 md:px-24 lg:px-32">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
            {/* Form */}
            <div ref={formRef} className="reveal lg:col-span-3">
              {submitted ? (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-on-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl text-on-surface mb-4">
                    Got It
                  </h2>
                  <p className="text-on-surface-muted max-w-md mx-auto">
                    We have received your inquiry. Someone from the Helanka team will get back to you within 24 hours to start working on your trip.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface mb-2">
                    Tell Us About Your Trip
                  </h2>
                  <p className="text-on-surface-muted text-sm mb-8">
                    The more detail, the better. But even a rough idea is enough to start.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-on-surface/70 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-subtle focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface/70 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-subtle focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-on-surface/70 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-subtle focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface/70 mb-2">
                        Number of Travelers
                      </label>
                      <input
                        type="number"
                        name="travelers"
                        min={1}
                        max={50}
                        className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-subtle focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-on-surface/70 mb-2">
                        Preferred Travel Dates
                      </label>
                      <input
                        type="text"
                        name="dates"
                        className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-subtle focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="e.g. Dec 2026, flexible"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-on-surface/70 mb-2">
                        Trip Duration
                      </label>
                      <select
                        name="duration"
                        className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                      >
                        <option value="" className="bg-background">Select duration</option>
                        <option value="3-5" className="bg-background">3-5 days</option>
                        <option value="6-8" className="bg-background">6-8 days</option>
                        <option value="9-12" className="bg-background">9-12 days</option>
                        <option value="13+" className="bg-background">13+ days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-on-surface/70 mb-3">
                      Trip Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tripTypes.map((type) => (
                        <label key={type} className="cursor-pointer">
                          <input
                            type="checkbox"
                            name="tripType"
                            value={type}
                            className="peer sr-only"
                          />
                          <span className="inline-block px-4 py-2 text-sm rounded-full border border-outline text-on-surface-muted peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:border-outline-hover transition-all">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-on-surface/70 mb-2">
                      Tell Us About Your Dream Trip
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      className="w-full bg-surface-raised border border-outline rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-subtle focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      placeholder="Any special interests, must-see destinations, dietary requirements, accessibility needs..."
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Turnstile />

                  <button
                    type="submit"
                    disabled={isPending}
                    className="pressable bg-primary text-on-primary px-8 py-3 rounded-lg text-base font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Sending..." : "Send Inquiry"}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar - Contact Details */}
            <div ref={sidebarRef} className="lg:col-span-2 space-y-10">
              <div data-stagger>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-on-surface mb-4">
                  Contact Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-muted mb-1">Email</p>
                      <a href="mailto:tours@helanka.co" className="text-on-surface hover:text-primary transition-colors">
                        tours@helanka.co
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-muted mb-1">Phone / WhatsApp</p>
                      <a href="tel:+94117400857" className="text-on-surface hover:text-primary transition-colors">
                        +94 11 7400 857
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-on-surface-muted mb-1">Office</p>
                      <p className="text-on-surface">
                        No. 471, Cotta Road, Rajagiriya, Colombo
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div data-stagger className="border-t border-outline pt-10">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-on-surface mb-4">
                  Response Time
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <p className="text-on-surface-muted text-sm">
                      We reply to inquiries within 24 hours
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <p className="text-on-surface-muted text-sm">
                      Custom itinerary ready in 48 hours
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <p className="text-on-surface-muted text-sm">
                      Free consultation, no obligation
                    </p>
                  </div>
                </div>
              </div>

              <div data-stagger className="border-t border-outline pt-10">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-on-surface mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  {[
                    {
                      label: "Instagram",
                      href: "https://instagram.com/helankavacations",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                        </svg>
                      ),
                    },
                    {
                      label: "Facebook",
                      href: "https://facebook.com/helankavacations",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      ),
                    },
                    {
                      label: "YouTube",
                      href: "https://youtube.com/@helankavacations",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                          <rect x="2" y="4" width="20" height="16" rx="4" ry="4" />
                          <polygon points="10 8.5 16 12 10 15.5 10 8.5" />
                        </svg>
                      ),
                    },
                    {
                      label: "TripAdvisor",
                      href: "https://tripadvisor.com",
                      icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="8.5" cy="12" r="2" />
                          <circle cx="15.5" cy="12" r="2" />
                          <path d="M8.5 7.5L12 5l3.5 2.5" />
                        </svg>
                      ),
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-surface-raised border border-outline flex items-center justify-center text-on-surface-muted hover:text-primary hover:border-primary/30 transition-all"
                      title={s.label}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
