"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const linkColumns = [
  {
    links: [
      { label: "Home", href: "/" },
      { label: "Packages", href: "/packages" },
      { label: "Destinations", href: "/destinations" },
      { label: "Build Your Trip", href: "/build" },
    ],
  },
  {
    links: [
      { label: "Group Experiences", href: "/group-experiences" },
      { label: "Blog", href: "/blog" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Careers", href: "/careers" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

export default function Footer() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <footer ref={ref} className="reveal bg-primary text-on-primary overflow-hidden">
      <div className="relative w-full px-6 md:px-12 pt-16 pb-6">
        <div className="flex items-end md:items-center justify-between gap-8">
          <h2
            className="font-[family-name:var(--font-display)] text-[13.5vw] leading-[0.85] tracking-tight select-none whitespace-nowrap shrink-0"
          >
            Helanka
          </h2>

          <div className="hidden md:grid grid-cols-3 gap-x-16 gap-y-2 shrink-0">
            {linkColumns.map((col, ci) => (
              <ul key={ci} className="space-y-1.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-primary/50 hover:text-on-primary transition-colors duration-200 whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* Mobile links */}
        <div className="md:hidden grid grid-cols-2 gap-x-8 gap-y-1.5 mt-8">
          {linkColumns.flatMap((col) => col.links).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-on-primary/50 hover:text-on-primary transition-colors duration-200 py-1"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex justify-end items-center gap-0 pt-6 mt-6 border-t border-on-primary/15">
          {[
            { label: "Instagram", href: "https://instagram.com/helankavacations" },
            { label: "Facebook", href: "https://facebook.com/helankavacations" },
            { label: "YouTube", href: "https://youtube.com/@helankavacations" },
            { label: "TripAdvisor", href: "https://tripadvisor.com" },
          ].map((social, i) => (
            <span key={social.label} className="contents">
              {i > 0 && <span className="w-px h-4 bg-on-primary/20" />}
              <Link
                href={social.href}
                className="text-sm text-on-primary/50 hover:text-on-primary transition-colors duration-200 px-4"
              >
                {social.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
