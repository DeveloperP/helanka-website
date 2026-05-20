import Link from "next/link";

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
  return (
    <footer className="bg-[#ff9d00] text-[#0a0a0a] overflow-hidden">
      <div className="relative w-full px-5 md:px-12 pt-16 pb-6">
        <div className="flex items-end md:items-center justify-between gap-8">
          <h2
            className="font-[family-name:var(--font-playfair)] font-black text-[#0a0a0a] text-[13.5vw] leading-[0.85] tracking-tight select-none whitespace-nowrap shrink-0"
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
                      className="text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center gap-0 pt-4">
          <Link href="https://instagram.com/helankavacations" className="text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors px-4">
            Instagram
          </Link>
          <span className="w-px h-4 bg-[#0a0a0a]/25" />
          <Link href="https://facebook.com/helankavacations" className="text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors px-4">
            Facebook
          </Link>
          <span className="w-px h-4 bg-[#0a0a0a]/25" />
          <Link href="https://youtube.com/@helankavacations" className="text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors px-4">
            YouTube
          </Link>
          <span className="w-px h-4 bg-[#0a0a0a]/25" />
          <Link href="https://tripadvisor.com" className="text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors pl-4">
            TripAdvisor
          </Link>
        </div>
      </div>
    </footer>
  );
}
