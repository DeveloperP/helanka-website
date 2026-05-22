"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateBookingStatus } from "@/actions/booking-actions";

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
    webxpayRef: string | null;
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

export function BookingDetailClient({ booking: initial }: { booking: BookingData }) {
  const [booking, setBooking] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50 ${
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
            <Link href={`/admin/customers/${booking.customerId}`} className="text-xs text-[#ff9d00] hover:text-[#e68d00] transition-colors">
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
          <Section title={`Payments (${totalPaid > 0 ? `$${totalPaid.toLocaleString()} paid` : "none"})`}>
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
          </Section>

          {booking.tripSessions.length > 0 && (
            <Section title="Linked Sessions">
              <div className="space-y-2">
                {booking.tripSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/sessions/${s.id}`}
                    className="block text-sm text-[#ff9d00] hover:text-[#e68d00] transition-colors"
                  >
                    {s.tripType} session · {s.status}
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
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
