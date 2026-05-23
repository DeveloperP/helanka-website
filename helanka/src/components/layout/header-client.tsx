"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";

const navLinks = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Build Your Trip", href: "/build" },
  { label: "Group Experiences", href: "/group-experiences" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LIGHT_PAGES = ["/login", "/register", "/forgot-password"];

interface HeaderClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  } | null;
}

export function HeaderClient({ user }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [heroLight, setHeroLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isLightPage = LIGHT_PAGES.some((p) => pathname === p);
  const isHome = pathname === "/";
  const darkText = scrolled || isLightPage || (isHome && !scrolled && heroLight);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      setHeroLight((e as CustomEvent).detail.light);
    };
    window.addEventListener("hero-brightness", handler);
    return () => window.removeEventListener("hero-brightness", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setHeroLight(false);
  }, [pathname]);

  return (
    <div className="fixed top-6 w-full px-5 md:px-20 z-50 pointer-events-none">
      <nav
        className={`max-w-[1440px] mx-auto backdrop-blur-xl rounded-2xl pointer-events-auto transition-all duration-300 border ${
          darkText
            ? "bg-white/80 border-black/5 shadow-lg shadow-black/5"
            : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#ff9d00] hover:opacity-80 transition-opacity"
          >
            Helanka Vacations
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base transition-colors ${
                  darkText
                    ? "text-slate-600 hover:text-[#ff9d00]"
                    : "text-[#dac2ad] hover:text-[#ff9d00]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserMenu user={user} darkMode={darkText} />
            ) : (
              <Link
                href="/login"
                className="bg-[#ff9d00] text-[#482900] px-6 py-2 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              darkText ? "hover:bg-black/5" : "hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-colors ${darkText ? "text-slate-700" : "text-white"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`md:hidden border-t px-6 pb-5 pt-3 space-y-1 ${
            darkText ? "border-black/5" : "border-white/10"
          }`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2.5 text-base transition-colors ${
                  darkText
                    ? "text-slate-600 hover:text-[#ff9d00]"
                    : "text-[#dac2ad] hover:text-[#ff9d00]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              {user ? (
                <UserMenu user={user} darkMode={darkText} />
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-block bg-[#ff9d00] text-[#482900] px-6 py-2 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
