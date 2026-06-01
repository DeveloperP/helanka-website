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
      className={`${dmSerif.variable} ${manrope.variable}`}
    >
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
