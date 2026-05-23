"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { respondToQuote } from "@/actions/quote-actions";
import type { CustomerQuoteData } from "@/actions/quote-actions";

// ─── Props ───────────────────────────────────────────────────────────────────

interface QuoteReviewClientProps {
  quote: CustomerQuoteData;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number | null): string {
  if (value === null) return "Pending";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function validUntilColor(iso: string): string {
  const days = daysUntil(iso);
  if (days < 3) return "text-red-600 font-semibold";
  if (days < 7) return "text-amber-600 font-semibold";
  return "text-slate-700";
}

// ─── Item type icons ──────────────────────────────────────────────────────────

function ItemTypeIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  switch (type.toUpperCase()) {
    case "ACCOMMODATION":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      );
    case "ACTIVITY":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      );
    case "TRANSPORT":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H6.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 0V7.875A1.875 1.875 0 0020.25 6H5.25A1.875 1.875 0 003.375 7.875V14.25" />
        </svg>
      );
    case "ADDON":
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
  }
}

function itemTypeBadgeColors(type: string): string {
  switch (type.toUpperCase()) {
    case "ACCOMMODATION":
      return "bg-blue-50 text-blue-600";
    case "ACTIVITY":
      return "bg-emerald-50 text-emerald-600";
    case "TRANSPORT":
      return "bg-amber-50 text-amber-700";
    case "ADDON":
    default:
      return "bg-slate-100 text-slate-500";
  }
}

function itemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ACCOMMODATION: "Stay",
    ACTIVITY: "Activity",
    TRANSPORT: "Transport",
    ADDON: "Add-on",
  };
  return labels[type.toUpperCase()] ?? type;
}

// ─── Response banner ─────────────────────────────────────────────────────────

function ResponseBanner({ response, showPayment, deposit, onPayNow, onPayLater }: {
  response: string;
  showPayment?: boolean;
  deposit?: number;
  onPayNow?: () => void;
  onPayLater?: () => void;
}) {
  if (response === "ACCEPTED" && showPayment) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border-b border-emerald-200">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-800 font-medium">Quote accepted! Secure your booking with a deposit.</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-slate-600">
            Pay your deposit of <span className="font-bold text-slate-900">{formatPrice(deposit ?? 0)}</span> now to confirm your trip, or choose to pay later.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onPayNow}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              Pay Now via WebXPay
            </button>
            <button
              onClick={onPayLater}
              className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
            >
              Pay Later
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Secure payment powered by WebXPay. You can also pay via bank transfer — contact us for details.
          </p>
        </div>
      </div>
    );
  }
  if (response === "ACCEPTED") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-emerald-800 font-medium">Quote accepted! Your booking is confirmed.</p>
            <p className="text-xs text-emerald-600 mt-0.5">Pay your deposit to secure your dates.</p>
          </div>
          <button
            onClick={onPayNow}
            className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Pay Deposit
          </button>
        </div>
      </div>
    );
  }
  if (response === "REVISION") {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <p className="text-sm text-amber-800 font-medium">You requested changes to this quote. Our specialist will review your notes and send a revised version.</p>
      </div>
    );
  }
  if (response === "EXPIRED") {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl">
        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <p className="text-sm text-slate-600 font-medium">This quote has expired. Contact us if you would like to revisit this trip.</p>
      </div>
    );
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuoteReviewClient({ quote }: QuoteReviewClientProps) {
  const [showRevisionBox, setShowRevisionBox] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [confirmedResponse, setConfirmedResponse] = useState<string | null>(
    quote.quote.response,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [showPaymentPrompt, setShowPaymentPrompt] = useState(quote.quote.response === "ACCEPTED");

  const balanceDue = quote.quote.totalPrice - quote.quote.deposit;
  const alreadyResponded = confirmedResponse !== null;

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await respondToQuote({
        quoteId: quote.quote.id,
        response: "ACCEPTED",
      });
      if (result.success) {
        setConfirmedResponse("ACCEPTED");
        setShowPaymentPrompt(true);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function handlePayNow() {
    // Placeholder: redirect to WebXPay checkout
    // In production, this will call a server action that creates a WebXPay session
    // and returns a redirect URL with the deposit amount, booking ID, and return URL
    const params = new URLSearchParams({
      bookingId: quote.bookingId,
      amount: String(quote.quote.deposit),
      currency: "USD",
      returnUrl: `${window.location.origin}/dashboard/quotes/${quote.bookingId}`,
    });
    window.location.href = `/api/payments/webxpay/checkout?${params.toString()}`;
  }

  function handlePayLater() {
    setShowPaymentPrompt(false);
  }

  function handleRevisionSubmit() {
    if (!revisionNotes.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await respondToQuote({
        quoteId: quote.quote.id,
        response: "REVISION",
      });
      if (result.success) {
        setConfirmedResponse("REVISION");
        setShowRevisionBox(false);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  function handleDecline() {
    const confirmed = window.confirm(
      "Are you sure you want to decline this quote? This action cannot be undone.",
    );
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await respondToQuote({
        quoteId: quote.quote.id,
        response: "EXPIRED",
      });
      if (result.success) {
        setConfirmedResponse("EXPIRED");
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Dashboard
        </Link>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Trip Quote</h1>
            {quote.customerName && (
              <p className="text-sm text-slate-500 mt-1">Prepared for {quote.customerName}</p>
            )}
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide">
            Version {quote.quote.version}
          </span>
        </div>

        {/* ── Response banner (if already responded) ────────────────────── */}
        {alreadyResponded && (
          <ResponseBanner
            response={confirmedResponse!}
            showPayment={showPaymentPrompt}
            deposit={quote.quote.deposit}
            onPayNow={handlePayNow}
            onPayLater={handlePayLater}
          />
        )}

        {/* ── Trip Summary Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Trip Summary</h2>

          {/* Dates + travelers */}
          <div className="flex flex-wrap gap-6">
            {(quote.arrivalDate || quote.departureDate) && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Dates</p>
                  <p className="text-sm font-medium text-slate-800">
                    {quote.arrivalDate ? formatDate(quote.arrivalDate) : "TBD"}
                    {" "}
                    <span className="text-slate-400 font-normal">to</span>
                    {" "}
                    {quote.departureDate ? formatDate(quote.departureDate) : "TBD"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Travelers</p>
                <p className="text-sm font-medium text-slate-800">
                  {quote.numTravelers} {quote.numTravelers === 1 ? "person" : "people"}
                </p>
              </div>
            </div>
          </div>

          {/* Items grouped by type */}
          {(() => {
            const grouped = quote.items.reduce<Record<string, typeof quote.items>>(
              (acc, item) => {
                const key = item.type.toUpperCase();
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
              },
              {},
            );

            const typeOrder = ["ACCOMMODATION", "TRANSPORT", "ACTIVITY", "ADDON"];
            const sortedKeys = [
              ...typeOrder.filter((k) => grouped[k]),
              ...Object.keys(grouped).filter((k) => !typeOrder.includes(k)),
            ];

            return (
              <div className="space-y-4 pt-1">
                {sortedKeys.map((type) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${itemTypeBadgeColors(type)}`}
                      >
                        <ItemTypeIcon type={type} />
                        {itemTypeLabel(type)}
                      </span>
                    </div>
                    <ul className="space-y-1.5 pl-1">
                      {grouped[type].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            {item.description}
                            {item.destinationName && (
                              <span className="text-slate-400"> — {item.destinationName}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Pricing Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-800">Pricing Breakdown</h2>

          {/* Line items table */}
          <div className="space-y-2">
            {quote.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${itemTypeBadgeColors(item.type)}`}
                  >
                    <ItemTypeIcon type={item.type} />
                    {itemTypeLabel(item.type)}
                  </span>
                  <span className="text-sm text-slate-600 truncate">{item.description}</span>
                </div>
                <span
                  className={`text-sm flex-shrink-0 ${item.price !== null ? "text-slate-900 font-semibold" : "text-slate-400 italic"}`}
                >
                  {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-slate-100" />

          {/* Totals */}
          <div className="space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-slate-900">
                {formatPrice(quote.quote.totalPrice)}
              </span>
            </div>

            {/* Deposit */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-700">Deposit Required</span>
                <p className="text-xs text-slate-400">Due to confirm your booking</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {formatPrice(quote.quote.deposit)}
              </span>
            </div>

            {/* Balance */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-700">Balance Due</span>
                <p className="text-xs text-slate-400">Payable prior to travel</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {formatPrice(balanceDue)}
              </span>
            </div>

            {/* Valid Until */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-slate-500">Quote valid until</span>
              </div>
              <span className={`text-sm ${validUntilColor(quote.quote.validUntil)}`}>
                {formatDate(quote.quote.validUntil)}
                {daysUntil(quote.quote.validUntil) <= 7 && daysUntil(quote.quote.validUntil) > 0 && (
                  <span className="ml-1.5 text-xs font-normal">
                    ({daysUntil(quote.quote.validUntil)} day{daysUntil(quote.quote.validUntil) !== 1 ? "s" : ""} left)
                  </span>
                )}
                {daysUntil(quote.quote.validUntil) <= 0 && (
                  <span className="ml-1.5 text-xs font-normal">(expired)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ── Admin Notes ───────────────────────────────────────────────── */}
        {quote.quote.adminNotes && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-700">Note from your specialist</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
              {quote.quote.adminNotes}
            </p>
          </div>
        )}

        {/* ── Action Buttons ────────────────────────────────────────────── */}
        {!alreadyResponded && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Your Response</h2>
              <p className="text-sm text-slate-500 mt-1">
                Review the details above, then let us know how you would like to proceed.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Revision textarea */}
            {showRevisionBox && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  What would you like us to change?
                </label>
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Please swap the Nuwara Eliya hotel for a boutique property, and add one extra night in Mirissa..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none transition-colors"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRevisionSubmit}
                    disabled={isPending || !revisionNotes.trim()}
                    className="bg-amber-500 text-white hover:bg-amber-600 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? "Sending..." : "Send Revision Request"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRevisionBox(false);
                      setRevisionNotes("");
                    }}
                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Primary action buttons */}
            {!showRevisionBox && (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleAccept}
                  disabled={isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Accept Quote
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowRevisionBox(true)}
                  disabled={isPending}
                  className="bg-amber-500 text-white hover:bg-amber-600 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  Request Changes
                </button>

                <button
                  onClick={handleDecline}
                  disabled={isPending}
                  className="text-slate-400 hover:text-red-500 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="text-center pb-8">
          <p className="text-xs text-slate-400">
            Questions about this quote?{" "}
            <a href="mailto:info@helanka.co" className="underline hover:text-slate-600 transition-colors">
              Contact us
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
