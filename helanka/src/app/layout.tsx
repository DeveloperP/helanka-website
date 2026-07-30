import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    template: "Helanka Vacations: %s | Sri Lanka Holidays",
    default: "Helanka Vacations | Sri Lanka Holiday Tours & Packages",
  },
  description:
    "Helanka Vacations crafts custom Sri Lanka holiday packages with local experts. Wildlife safaris, hill country trains, beach escapes, and MICE services. Book your free consultation today.",
  metadataBase: new URL("https://helanka.co"),
  openGraph: {
    type: "website",
    siteName: "Helanka Vacations",
    locale: "en_US",
    url: "https://helanka.co",
    title: "Helanka Vacations | Sri Lanka Holiday Tours & Packages",
    description:
      "Helanka Vacations crafts custom Sri Lanka holiday packages with local experts. Wildlife safaris, hill country trains, beach escapes, and MICE services.",
    images: [{ url: "/images/public-ella-nine-arch.webp", width: 1200, height: 630, alt: "Sri Lanka — Nine Arch Bridge in Ella" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helanka Vacations | Sri Lanka Holiday Tours & Packages",
    description:
      "Helanka Vacations crafts custom Sri Lanka holiday packages with local experts. Wildlife safaris, hill country trains, beach escapes, and MICE services.",
    images: ["/images/public-ella-nine-arch.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TourOperator",
    "@id": "https://helanka.co/#organization",
    name: "Helanka Vacations",
    url: "https://helanka.co",
    logo: "https://helanka.co/images/logo.png",
    description:
      "Helanka Vacations crafts custom Sri Lanka holiday packages with local experts. Wildlife safaris, hill country trains, beach escapes, and MICE services.",
    telephone: "+94 11 7400 857",
    email: "tours@helanka.co",
    address: {
      "@type": "PostalAddress",
      streetAddress: "23 Pereira Lane, Wellawatte",
      addressLocality: "Colombo",
      addressRegion: "Western Province",
      postalCode: "00600",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "6.8649",
      longitude: "79.8613",
    },
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    sameAs: [
      "https://www.facebook.com/helankaholidays",
      "https://www.instagram.com/helankavacations",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "500",
      bestRating: "5",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://helanka.co/#localbusiness",
    name: "Helanka Vacations",
    image: "https://helanka.co/images/logo.png",
    url: "https://helanka.co",
    telephone: "+94 11 7400 857",
    email: "tours@helanka.co",
    address: {
      "@type": "PostalAddress",
      streetAddress: "23 Pereira Lane, Wellawatte",
      addressLocality: "Colombo",
      addressRegion: "Western Province",
      postalCode: "00600",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "6.8649",
      longitude: "79.8613",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "$$",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://helanka.co/#website",
    name: "Helanka Vacations",
    url: "https://helanka.co",
    publisher: { "@id": "https://helanka.co/#organization" },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${manrope.variable}`}
    >
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="min-h-screen bg-background text-foreground font-[family-name:var(--font-body)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
