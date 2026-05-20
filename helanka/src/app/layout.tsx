import type { Metadata } from "next";
import { Playfair_Display, Manrope, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["900"],
  variable: "--font-playfair",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: {
    template: "%s — Helanka Vacations",
    default: "Helanka Vacations — Sri Lanka Holiday Tours",
  },
  description:
    "Plan your perfect Sri Lanka vacation with Helanka Vacations. Explore curated holiday packages, tailor-made itineraries, group experiences, and expert travel advice for unforgettable journeys across the island.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${playfair.variable} ${manrope.variable} ${hankenGrotesk.variable}`}
    >
      <body className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-[#e5e2e1] font-[family-name:var(--font-manrope)] antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
