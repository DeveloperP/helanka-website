"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal";

const linkColumns = [
  {
    heading: "Explore",
    links: [
      { label: "Packages", href: "/packages" },
      { label: "Destinations", href: "/destinations" },
      { label: "Build Your Trip", href: "/build" },
      { label: "Group Experiences", href: "/group-experiences" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
    ],
  },
];

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/helankavacations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-[18px] h-[18px]">
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
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@helankavacations",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="var(--primary)" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "TripAdvisor",
    href: "https://tripadvisor.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 0 1 5.39 2.54A4.5 4.5 0 0 0 12 9a4.5 4.5 0 0 0-5.39-1.46A7 7 0 0 1 12 5zm-4.5 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4.5 5c-2 0-3.5-1-4.33-2.5h8.66C15.5 15.5 14 16.5 12 16.5z" />
      </svg>
    ),
  },
];

const trustStats = [
  { value: "500+", label: "Trips crafted" },
  { value: "4.9", label: "Average rating" },
  { value: "38", label: "Countries served" },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 800));
    setState("done");
  }

  if (state === "done") {
    return (
      <p className="text-sm text-on-primary/80 leading-relaxed">
        You&apos;re on the list. Expect travel inspiration soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 min-w-0 bg-black/10 border border-on-primary/20 hover:border-on-primary/30 focus:border-on-primary/50 focus:ring-1 focus:ring-on-primary/30 focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-on-primary placeholder:text-on-primary/40 transition-colors"
        disabled={state === "loading"}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="pressable shrink-0 bg-on-primary text-primary px-4 py-2.5 rounded-lg text-xs font-bold tracking-[0.08em] uppercase hover:bg-white transition-all disabled:opacity-60"
      >
        {state === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}

function PreFooterCta() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div className="bg-background px-6 md:px-12 lg:px-20 pb-0 pt-24">
      <div
        ref={ref}
        className="reveal relative max-w-[1440px] mx-auto overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #1c1106 0%, #1a0e00 40%, #2a1500 100%)",
          boxShadow: "0 0 0 1px rgba(212,129,42,0.18)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #d4812a 0%, transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 w-[360px] h-[360px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #d4812a 0%, transparent 70%)" }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-8 md:px-14 py-14">
          <div className="max-w-xl">
            <span className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase text-primary mb-3">
              Sri Lanka is waiting
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl lg:text-[2.6rem] text-white leading-tight tracking-tight">
              Ready to explore the island?
            </h2>
            <p className="mt-4 text-sm md:text-base text-on-surface-muted leading-relaxed max-w-md">
              Let our local specialists design your perfect trip — from hidden beaches to misty highlands. Free consultation, no pressure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:shrink-0">
            <Link
              href="/build"
              className="pressable inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-7 py-3.5 text-xs font-bold tracking-[0.1em] uppercase rounded-lg hover:brightness-110 transition-all"
            >
              Build Your Trip
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/packages"
              className="pressable inline-flex items-center justify-center gap-2 bg-white/[0.07] border border-white/[0.12] text-white px-7 py-3.5 text-xs font-bold tracking-[0.1em] uppercase rounded-lg hover:bg-white/[0.12] hover:border-white/20 transition-all"
            >
              Browse Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const footerRef = useScrollReveal<HTMLElement>({ threshold: 0.05 });
  const navRef = useStaggerReveal<HTMLDivElement>({ threshold: 0.1 });

  const hidePreCta = pathname === "/";

  return (
    <>
      {!hidePreCta && <PreFooterCta />}

      <footer
        ref={footerRef}
        className="reveal relative bg-primary text-on-primary overflow-hidden"
      >
        <div className="relative w-full px-6 md:px-12 lg:px-20 pt-16 pb-8 max-w-[1440px] mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 pb-12 border-b border-on-primary/15">

            {/* Brand column */}
            <div className="flex flex-col gap-6 max-w-sm">
              <Link href="/" aria-label="Helanka Vacations — home">
                <Image
                  src="/images/logo-footer.png"
                  alt="Helanka Vacations"
                  width={800}
                  height={265}
                  className="w-[180px] md:w-[210px] h-auto select-none"
                />
              </Link>

              <p className="text-sm text-on-primary/70 leading-relaxed">
                Boutique travel specialists crafting bespoke Sri Lanka experiences for curious travellers since 2016.
              </p>

              {/* Trust stats */}
              <div className="flex gap-6 pt-1">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <span className="font-[family-name:var(--font-display)] text-2xl text-on-primary leading-none">
                      {stat.value}
                    </span>
                    <span className="text-[11px] text-on-primary/50 uppercase tracking-[0.12em]">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact block */}
              <div className="flex flex-col gap-3 pt-1">
                <a
                  href="mailto:tours@helanka.co"
                  className="group inline-flex items-center gap-2.5 text-sm text-on-primary/70 hover:text-on-primary transition-colors"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-black/10 group-hover:bg-black/15 transition-colors shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.4} className="w-3.5 h-3.5 text-on-primary">
                      <path d="M2.5 6.667A1.667 1.667 0 0 1 4.167 5h11.666A1.667 1.667 0 0 1 17.5 6.667v6.666A1.667 1.667 0 0 1 15.833 15H4.167A1.667 1.667 0 0 1 2.5 13.333V6.667Z" />
                      <path d="m2.5 6.667 7.5 5 7.5-5" />
                    </svg>
                  </span>
                  tours@helanka.co
                </a>
                <a
                  href="https://wa.me/94715590000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-sm text-on-primary/70 hover:text-on-primary transition-colors"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-black/10 group-hover:bg-black/15 transition-colors shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-on-primary">
                      <path d="M10 2a8 8 0 0 1 6.677 12.397l.56 2.68-2.733-.54A8 8 0 1 1 10 2Zm-2.5 4.5c-.2.45-.4 1.2.15 1.95.55.75 1.5 1.85 2.05 2.4.55.55 1.6 1.35 2.3 1.6.7.25 1.1.05 1.4-.2.3-.25.75-.9.9-1.05.15-.15.15-.35.05-.5l-1.45-1.2c-.1-.1-.35-.1-.5.05l-.5.55c-.1.1-.25.15-.4.1-.3-.1-1.15-.6-1.85-1.3-.7-.7-1.1-1.5-1.15-1.8-.05-.15 0-.3.1-.4l.5-.5c.15-.15.15-.4.05-.55L8.7 6.2c-.15-.15-.35-.1-.45 0L7.5 6.5Z" />
                    </svg>
                  </span>
                  <span>
                    WhatsApp
                    <span className="ml-1.5 text-[11px] text-on-primary/40">
                      Mon-Sat, 8 am-8 pm IST
                    </span>
                  </span>
                </a>
              </div>

              {/* Newsletter */}
              <div className="pt-2">
                <p className="text-xs font-semibold tracking-[0.12em] uppercase text-on-primary/50 mb-1">
                  Travel inspiration, no spam
                </p>
                <NewsletterForm />
              </div>
            </div>

            {/* Nav columns */}
            <div
              ref={navRef}
              className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-10 md:gap-x-14 gap-y-8 lg:pt-1"
            >
              {linkColumns.map((col) => (
                <div key={col.heading} data-stagger>
                  <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-on-primary/50 mb-4">
                    {col.heading}
                  </h3>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-on-primary/60 hover:text-on-primary transition-colors duration-200 whitespace-nowrap"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-5 pt-6">
            <p className="text-xs text-on-primary/40 order-2 md:order-1">
              &copy; {new Date().getFullYear()} Helanka Vacations (Pvt) Ltd. All rights reserved.
            </p>

            <div className="flex items-center gap-1 order-1 md:order-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group flex items-center justify-center w-9 h-9 rounded-lg text-on-primary/50 hover:text-on-primary hover:bg-black/10 transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
