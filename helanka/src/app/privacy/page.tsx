"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function PrivacyPage() {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const contentRef = useScrollReveal<HTMLDivElement>();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/public-sigiriya.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div ref={heroRef} className="reveal relative z-10 w-full px-6 sm:px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="inline-block bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Legal
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl text-on-surface mb-4 max-w-3xl">
            Privacy Policy
          </h1>
          <p className="text-lg text-on-surface/60 max-w-2xl">
            How we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div ref={contentRef} className="reveal max-w-[1440px] mx-auto px-6 sm:px-8 md:px-24 lg:px-32">
          <div className="max-w-3xl space-y-12">
            <p className="text-sm text-on-surface-muted">Last updated: June 2026</p>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">1. Information We Collect</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We collect information you provide directly when booking a trip or creating an account, including your name, email address, phone number, passport details, travel preferences, and payment information. We also collect usage data such as pages visited, browser type, and device information when you use our website.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">2. How We Use Your Information</h2>
              <p className="text-on-surface/70 leading-relaxed">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface/70">
                <li>Process and manage your bookings</li>
                <li>Communicate with you about your trip, including itinerary updates and travel advisories</li>
                <li>Process payments through our payment partner (PayPal)</li>
                <li>Send booking confirmations and receipts</li>
                <li>Improve our services and website experience</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="text-on-surface/70 leading-relaxed">
                We will only send marketing communications if you have opted in. You can unsubscribe at any time.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">3. Information Sharing</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We share your information only as necessary to deliver your trip experience. This includes sharing relevant details with hotels, transport providers, and activity operators in Sri Lanka. We do not sell your personal information to third parties.
              </p>
              <p className="text-on-surface/70 leading-relaxed">
                We may also share information with payment processors (PayPal), analytics providers, and law enforcement when required by law.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">4. Data Security</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Payment processing is handled by PayPal and is subject to their security standards and PCI DSS compliance.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">5. Cookies &amp; Analytics</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We use essential cookies to keep your session active and remember your preferences. We may also use analytics tools (such as Google Analytics and PostHog) to understand how visitors use our website. These tools collect anonymized usage data and do not identify you personally.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">6. Data Retention</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes described in this policy, and to comply with our legal and regulatory obligations. Booking records are retained for a minimum of 7 years for accounting and tax purposes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">7. Your Rights</h2>
              <p className="text-on-surface/70 leading-relaxed">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-on-surface/70">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and personal data (subject to legal retention requirements)</li>
                <li>Withdraw consent for marketing communications</li>
              </ul>
              <p className="text-on-surface/70 leading-relaxed">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:info@helanka.co" className="text-primary underline hover:text-primary/80 transition-colors">
                  info@helanka.co
                </a>.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">8. Third-Party Links</h2>
              <p className="text-on-surface/70 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to read their privacy policies before providing any personal information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">9. Changes to This Policy</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page. Your continued use of our services after changes are posted constitutes acceptance of the revised policy.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">10. Contact</h2>
              <p className="text-on-surface/70 leading-relaxed">
                For any privacy-related questions or requests, please contact us at{" "}
                <a href="mailto:info@helanka.co" className="text-primary underline hover:text-primary/80 transition-colors">
                  info@helanka.co
                </a>.
              </p>
            </div>

            <div className="pt-4 border-t border-on-surface/10">
              <p className="text-sm text-on-surface-muted">
                See also:{" "}
                <Link href="/terms" className="text-primary underline hover:text-primary/80 transition-colors">Terms of Service</Link>
                {" · "}
                <Link href="/cancellation-policy" className="text-primary underline hover:text-primary/80 transition-colors">Cancellation Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
