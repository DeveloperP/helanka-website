import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
    template: "%s | Helanka Vacations",
    default: "Helanka Vacations | Sri Lanka Holiday Tours",
  },
  description:
    "Custom Sri Lanka holiday packages designed by locals. Wildlife safaris, hill country trains, beach escapes, and MICE services. Talk to our team for a free consultation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${manrope.variable} ${hankenGrotesk.variable}`}
    >
      <body className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-[#e5e2e1] font-[family-name:var(--font-manrope)] antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
