import Link from "next/link";

const exploreLinks = [
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Build Your Trip", href: "/build" },
  { label: "Group Experiences", href: "/group-experiences" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Partner With Us", href: "/partner" },
  { label: "Blog", href: "/blog" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <h2 className="text-base font-semibold text-white">
              Helanka Vacations
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              Your trusted partner for unforgettable Sri Lanka holiday
              experiences, crafted with care.
            </p>
            <address className="mt-4 not-italic text-sm leading-relaxed">
              No. 471, Cotta Road,
              <br />
              Rajagiriya, Colombo,
              <br />
              Sri Lanka
            </address>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="tel:+94117400857"
                  className="hover:text-white transition-colors"
                >
                  +94 11 740 0857
                </a>
              </li>
              <li>
                <a
                  href="mailto:tours@helanka.co"
                  className="hover:text-white transition-colors"
                >
                  tours@helanka.co
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs">
          &copy; {currentYear} Helanka Vacations Pvt Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
