"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { updateBookingStatus } from "@/actions/booking-actions";
import { recordPayment } from "@/actions/quote-actions";
import { exportBookingFeedbackCSV } from "@/actions/feedback-actions";
import type { TripFeedbackSummary } from "@/actions/feedback-actions";

interface BookingItem {
  id: string;
  type: string;
  description: string;
  destinationName: string | null;
  nights: number | null;
  tier: string | null;
  price: number | null;
}

interface BookingData {
  id: string;
  status: string;
  customerName: string | null;
  customerEmail: string;
  customerId: string;
  arrivalDate: string | null;
  departureDate: string | null;
  numTravelers: number;
  flightNumber: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  updatedAt: string;
  items: BookingItem[];
  latestQuote: {
    totalPrice: number;
    deposit: number;
    validUntil: string;
    response: string | null;
    version: number;
  } | null;
  payments: {
    id: string;
    amount: number;
    currency: string;
    method: string | null;
    status: string;
    gatewayRef: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  tripSessions: {
    id: string;
    tripType: string;
    status: string;
  }[];
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["QUOTE_REQUESTED", "CANCELLED"],
  QUOTE_REQUESTED: ["PRICING_IN_PROGRESS", "CANCELLED"],
  PRICING_IN_PROGRESS: ["QUOTE_SENT", "CANCELLED"],
  QUOTE_SENT: ["CONFIRMED", "REVISION_REQUESTED", "EXPIRED"],
  REVISION_REQUESTED: ["PRICING_IN_PROGRESS", "CANCELLED"],
  CONFIRMED: ["BALANCE_DUE", "CANCELLED"],
  BALANCE_DUE: ["COMPLETED", "CANCELLED"],
};

export function BookingDetailClient({
  booking: initial,
  feedback,
}: {
  booking: BookingData;
  feedback: TripFeedbackSummary | null;
}) {
  const [booking, setBooking] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "bank_transfer", currency: "USD", gatewayRef: "" });

  const nextStatuses = VALID_TRANSITIONS[booking.status] ?? [];
  const totalPaid = booking.payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((s, p) => s + p.amount, 0);

  function handleStatusChange(newStatus: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, newStatus);
      if (result.success) {
        setBooking((prev) => ({ ...prev, status: newStatus }));
        setMessage({ type: "success", text: `Status updated to ${formatStatus(newStatus)}.` });
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to update." });
      }
    });
  }

  function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) return;
    startTransition(async () => {
      const result = await recordPayment({
        bookingId: booking.id,
        amount,
        currency: paymentForm.currency,
        method: paymentForm.method,
        gatewayRef: paymentForm.gatewayRef || undefined,
      });
      if (result.success) {
        setBooking((prev) => ({
          ...prev,
          payments: [
            {
              id: crypto.randomUUID(),
              amount,
              currency: paymentForm.currency,
              method: paymentForm.method,
              status: "SUCCESS",
              gatewayRef: paymentForm.gatewayRef || null,
              paidAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
            ...prev.payments,
          ],
        }));
        setShowPaymentModal(false);
        setPaymentForm({ amount: "", method: "bank_transfer", currency: "USD", gatewayRef: "" });
        setMessage({ type: "success", text: "Payment recorded." });
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed to record payment." });
      }
    });
  }

  const depositRequired = booking.latestQuote?.deposit ?? 0;
  const balanceRequired = (booking.latestQuote?.totalPrice ?? 0) - totalPaid;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/bookings" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {booking.customerName ?? booking.customerEmail}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Booking #{booking.id.slice(0, 8)} · {booking.numTravelers} traveller{booking.numTravelers !== 1 ? "s" : ""}
            {booking.arrivalDate && ` · ${new Date(booking.arrivalDate).toLocaleDateString()}`}
          </p>
        </div>
        <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-slate-100 text-slate-700">
          {formatStatus(booking.status)}
        </span>
      </div>

      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={isPending}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${
                  s === "CANCELLED"
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {formatStatus(s)}
              </button>
            ))}
          </div>
          {message && (
            <p className={`text-sm mt-3 ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Section title="Customer">
            <Row label="Name" value={booking.customerName ?? "—"} />
            <Row label="Email" value={booking.customerEmail} />
            <Link href={`/admin/customers/${booking.customerId}`} className="text-xs text-primary hover:text-primary-light transition-colors">
              View customer profile →
            </Link>
          </Section>

          {booking.items.length > 0 && (
            <Section title="Line Items">
              <div className="space-y-2">
                {booking.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm text-slate-900">{item.description}</p>
                      <p className="text-xs text-slate-400">
                        {item.type}{item.destinationName ? ` · ${item.destinationName}` : ""}{item.nights ? ` · ${item.nights} nights` : ""}
                        {item.tier ? ` · ${item.tier}` : ""}
                      </p>
                    </div>
                    {item.price != null && (
                      <span className="text-sm font-medium text-slate-700">${item.price.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {booking.latestQuote && (
            <Section title={`Quote (v${booking.latestQuote.version})`}>
              <Row label="Total" value={`$${booking.latestQuote.totalPrice.toLocaleString()}`} />
              <Row label="Deposit" value={`$${booking.latestQuote.deposit.toLocaleString()}`} />
              <Row label="Valid Until" value={new Date(booking.latestQuote.validUntil).toLocaleDateString()} />
              {booking.latestQuote.response && <Row label="Response" value={booking.latestQuote.response} />}
            </Section>
          )}

          {booking.utmSource && (
            <Section title="Attribution">
              <Row label="Source" value={booking.utmSource} />
              {booking.utmMedium && <Row label="Medium" value={booking.utmMedium} />}
              {booking.utmCampaign && <Row label="Campaign" value={booking.utmCampaign} />}
            </Section>
          )}

          {booking.flightNumber && (
            <Section title="Travel Details">
              <Row label="Flight" value={booking.flightNumber} />
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Payments {totalPaid > 0 && <span className="text-emerald-600 font-normal ml-1">(${totalPaid.toLocaleString()} paid)</span>}
              </h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Record Payment
              </button>
            </div>
            {booking.latestQuote && (
              <div className="flex gap-4 mb-3 text-xs">
                <span className="text-slate-400">Deposit: <span className="text-slate-700 font-medium">${depositRequired.toLocaleString()}</span></span>
                <span className="text-slate-400">Balance: <span className={`font-medium ${balanceRequired <= 0 ? "text-emerald-600" : "text-slate-700"}`}>${Math.max(0, balanceRequired).toLocaleString()}</span></span>
              </div>
            )}
            {booking.payments.length === 0 ? (
              <p className="text-sm text-slate-400">No payments recorded.</p>
            ) : (
              <div className="space-y-2">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm text-slate-900">${p.amount.toLocaleString()} {p.currency}</p>
                      <p className="text-xs text-slate-400">
                        {p.method ?? "—"} · {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "Pending"}
                        {p.gatewayRef && ` · ${p.method === "paypal" ? "PayPal" : "Ref"}: ${p.gatewayRef}`}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "FAILED" ? "bg-red-100 text-red-700" :
                      p.status === "REFUNDED" ? "bg-violet-100 text-violet-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {booking.tripSessions.length > 0 && (
            <Section title="Linked Sessions">
              <div className="space-y-2">
                {booking.tripSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/sessions/${s.id}`}
                    className="block text-sm text-primary hover:text-primary-light transition-colors"
                  >
                    {s.tripType} session · {s.status}
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* QR Code for customer access */}
          {["CONFIRMED", "BALANCE_DUE", "COMPLETED"].includes(booking.status) && (
            <QRCodeSection bookingId={booking.id} />
          )}
        </div>
      </div>

      {/* Feedback Section */}
      {feedback && feedback.feedbackByDay.length > 0 && (
        <FeedbackSection feedback={feedback} bookingId={booking.id} arrivalDate={booking.arrivalDate} />
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Payment</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, method: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Reference (optional)</label>
                <input
                  type="text"
                  value={paymentForm.gatewayRef}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, gatewayRef: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Transaction reference"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-bold text-slate-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function QRCodeSection({ bookingId }: { bookingId: string }) {
  const [showQR, setShowQR] = useState(false);
  const dashboardUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`;

  return (
    <Section title="Customer QR Code">
      <p className="text-xs text-slate-500 mb-3">
        Generate a QR code for the customer to scan and access their trip feedback dashboard.
      </p>
      {!showQR ? (
        <button
          onClick={() => setShowQR(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          Generate QR Code
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <QRCodeSVG value={dashboardUrl} size={160} level="M" />
          </div>
          <p className="text-xs text-slate-400 text-center max-w-[200px]">
            Scan to open the dashboard and submit daily trip feedback
          </p>
          <button
            onClick={() => {
              const svg = document.querySelector(".qr-print-target svg");
              if (!svg) return;
              const svgData = new XMLSerializer().serializeToString(svg);
              const blob = new Blob([svgData], { type: "image/svg+xml" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `helanka-qr-${bookingId.slice(0, 8)}.svg`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-xs text-primary hover:underline font-medium"
          >
            Download SVG
          </button>
          <div className="qr-print-target hidden">
            <QRCodeSVG value={dashboardUrl} size={400} level="M" />
          </div>
        </div>
      )}
    </Section>
  );
}

function FeedbackSection({
  feedback,
  bookingId,
  arrivalDate,
}: {
  feedback: TripFeedbackSummary;
  bookingId: string;
  arrivalDate: string | null;
}) {
  const [isExporting, startExport] = useTransition();

  function handleExport() {
    startExport(async () => {
      const csv = await exportBookingFeedbackCSV(bookingId);
      if (!csv) return;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feedback-${bookingId.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const arrival = arrivalDate ? new Date(arrivalDate) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">
          Daily Feedback ({feedback.feedbackByDay.length}/{feedback.totalDays} days)
        </h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors"
        >
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[
          { label: "Overall", value: feedback.averages.overall },
          { label: "Transport", value: feedback.averages.transport },
          { label: "Food", value: feedback.averages.food },
          { label: "Guide", value: feedback.averages.guide },
          { label: "Accommodation", value: feedback.averages.accommodation },
        ].map(({ label, value }) => (
          <div key={label} className="text-center bg-slate-50 rounded-lg py-2 px-1">
            <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
            <p className="text-lg font-bold text-slate-900">
              {value != null ? value.toFixed(1) : "—"}
            </p>
            {value != null && (
              <div className="flex justify-center gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-2.5 h-2.5 ${s <= Math.round(value) ? "text-amber-400" : "text-slate-200"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Day-by-day */}
      <div className="space-y-2">
        {feedback.feedbackByDay.map((f) => {
          const dayDate = arrival
            ? new Date(arrival.getTime() + (f.dayNumber - 1) * 86400000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "";
          return (
            <div key={f.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-700">{f.dayNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-slate-400">{dayDate}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className={`w-3 h-3 ${s <= f.overallRating ? "text-amber-400" : "text-slate-200"}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                {f.comment && (
                  <p className="text-xs text-slate-600 italic">&ldquo;{f.comment}&rdquo;</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Survey */}
      {feedback.survey && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 mb-2">End-of-Trip Survey</h3>
          <div className="space-y-1 text-sm">
            <Row label="Overall Rating" value={`${feedback.survey.rating}/5`} />
            <Row
              label="Would Recommend"
              value={
                feedback.survey.wouldRecommend === true
                  ? "Yes"
                  : feedback.survey.wouldRecommend === false
                  ? "No"
                  : "—"
              }
            />
            {feedback.survey.referralSource && (
              <Row label="Heard About Us" value={feedback.survey.referralSource} />
            )}
            <Row label="Social Media Consent" value={feedback.survey.socialMediaConsent ? "Yes" : "No"} />
          </div>
          {feedback.survey.body && (
            <p className="text-xs text-slate-600 italic mt-2">&ldquo;{feedback.survey.body}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
