import Link from "next/link";
import { auth } from "@/lib/auth";

const navLinks = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Build Your Trip", href: "/build" },
  { label: "Group Experiences", href: "/group-experiences" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default async function Header() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth unavailable (no DB adapter configured yet)
  }

  return (
    <div className="fixed top-6 w-full px-5 md:px-20 z-50 pointer-events-none">
      <nav className="max-w-[1440px] mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto transition-all duration-300">
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
                className="text-base text-[#dac2ad] hover:text-[#ff9d00] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <Link
                href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="text-base text-[#dac2ad] hover:text-[#ff9d00] transition-colors"
              >
                {session.user.name ?? session.user.email}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-base text-[#dac2ad] hover:text-[#ff9d00] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/build"
                  className="bg-[#ff9d00] text-[#482900] px-6 py-2 rounded-lg text-base font-semibold hover:bg-[#e68d00] transition-colors"
                >
                  Plan Your Trip
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
