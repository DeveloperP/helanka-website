"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function CancellationPolicyPage() {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const contentRef = useScrollReveal<HTMLDivElement>();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/public-sigiriya-aerial.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div ref={heroRef} className="reveal relative z-10 w-full px-8 md:px-24 lg:px-32 max-w-[1440px] mx-auto pb-16">
          <span className="inline-block bg-primary text-on-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Legal
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-6xl text-on-surface mb-4 max-w-3xl">
            Cancellation Policy
          </h1>
          <p className="text-lg text-on-surface/60 max-w-2xl">
            What happens if your plans change.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div ref={contentRef} className="reveal max-w-[1440px] mx-auto px-8 md:px-24 lg:px-32">
          <div className="max-w-3xl space-y-12">
            <p className="text-sm text-on-surface-muted">Last updated: June 2026</p>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">Cancellation by the Traveler</h2>
              <p className="text-on-surface/70 leading-relaxed">
                If you need to cancel your booking, the following fees apply based on how far in advance you notify us before your scheduled arrival date:
              </p>
              <div className="overflow-hidden rounded-xl border border-on-surface/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-on-surface/5">
                      <th className="text-left px-5 py-3 font-semibold text-on-surface">Notice Period</th>
                      <th className="text-left px-5 py-3 font-semibold text-on-surface">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-on-surface/5">
                    <tr>
                      <td className="px-5 py-3 text-on-surface/70">30 days or more</td>
                      <td className="px-5 py-3 text-on-surface/70">Full refund (minus any non-recoverable third-party costs)</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-on-surface/70">21 – 29 days</td>
                      <td className="px-5 py-3 text-on-surface/70">25% of total booking value</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-on-surface/70">14 – 20 days</td>
                      <td className="px-5 py-3 text-on-surface/70">50% of total booking value</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-on-surface/70">Less than 14 days</td>
                      <td className="px-5 py-3 text-on-surface/70">100% of total booking value (no refund)</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-on-surface/70">No-show</td>
                      <td className="px-5 py-3 text-on-surface/70">100% of total booking value (no refund)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-on-surface/70 leading-relaxed">
                All cancellation requests must be submitted in writing via email to{" "}
                <a href="mailto:info@helanka.co" className="text-primary underline hover:text-primary/80 transition-colors">
                  info@helanka.co
                </a>. The cancellation date is the date we receive your written notice.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">Refund Processing</h2>
              <p className="text-on-surface/70 leading-relaxed">
                Approved refunds are processed within 14 business days via the original payment method (PayPal). Bank transfer refunds may take additional time depending on your financial institution. Refunds are issued in the original currency of payment.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">Cancellation by Helanka Vacations</h2>
              <p className="text-on-surface/70 leading-relaxed">
                In rare circumstances, we may need to cancel or modify your booking due to safety concerns, natural disasters, civil unrest, pandemics, or other events beyond our control. In such cases, we will offer you the choice of a full refund, an alternative travel date, or a credit toward a future booking.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">Modifications</h2>
              <p className="text-on-surface/70 leading-relaxed">
                If you wish to change your travel dates or itinerary rather than cancel outright, please contact us as early as possible. We will do our best to accommodate changes subject to availability. Date changes requested more than 30 days before arrival incur no fee. Changes within 30 days may be treated as a cancellation and rebooking.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">Travel Insurance</h2>
              <p className="text-on-surface/70 leading-relaxed">
                We strongly recommend purchasing travel insurance that includes trip cancellation coverage. This can protect you from financial loss if you need to cancel for medical or personal reasons. Helanka Vacations is not responsible for costs not covered by your insurance.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-on-surface">Contact</h2>
              <p className="text-on-surface/70 leading-relaxed">
                For cancellation requests or questions about this policy, email us at{" "}
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
                <Link href="/privacy" className="text-primary underline hover:text-primary/80 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
