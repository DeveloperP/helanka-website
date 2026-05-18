import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
