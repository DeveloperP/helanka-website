"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isLightPage = LIGHT_PAGES.some((p) => pathname === p);
  const lightMode = isLightPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="fixed top-4 w-full px-4 md:px-16 z-50 pointer-events-none">
      <nav
        className="max-w-[1440px] mx-auto pointer-events-auto rounded-xl border transition-all duration-500"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        <div
          className={`rounded-xl transition-all duration-500 ${
            lightMode
              ? "bg-white/85 backdrop-blur-xl border-black/5 shadow-lg shadow-black/5"
              : scrolled
                ? "bg-black/40 backdrop-blur-2xl border-white/10 shadow-lg shadow-black/20"
                : "bg-white/5 backdrop-blur-md border-white/8"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <div className="flex justify-between items-center px-5 py-3.5">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <Image
                src="/images/logo-header.png"
                alt="Helanka Vacations"
                width={160}
                height={36}
                priority
              />
            </Link>

            <div className="hidden md:flex space-x-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors duration-200 ${
                    lightMode
                      ? "text-slate-500 hover:text-primary"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <UserMenu user={user} darkMode={lightMode} />
              ) : (
                <Link
                  href="/login"
                  className="pressable bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
                lightMode ? "hover:bg-black/5" : "hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg
                className={`w-5 h-5 transition-colors duration-200 ${lightMode ? "text-slate-600" : "text-white"}`}
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

          {/* Mobile menu with smooth height transition */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <div className={`border-t px-5 pb-4 pt-2 space-y-0.5 ${
              lightMode ? "border-black/5" : "border-white/8"
            }`}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2.5 text-sm transition-colors duration-200 ${
                    lightMode
                      ? "text-slate-500 hover:text-primary"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3">
                {user ? (
                  <UserMenu user={user} darkMode={lightMode} />
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-block bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
