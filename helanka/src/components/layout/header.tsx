import Link from "next/link";
import { auth } from "@/lib/auth";

const navLinks = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Build Your Trip", href: "/build" },
  { label: "Group Experiences", href: "/group-experiences" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-bold text-emerald-700"
          >
            Helanka
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: auth state */}
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {session.user.name ?? session.user.email}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/build"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Plan Your Trip
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
