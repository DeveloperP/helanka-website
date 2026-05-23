"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import Link from "next/link";
import {
  priceBookingItems,
  sendQuote,
  getSessionForQuoting,
} from "@/actions/quote-actions";
import type { QuotingSessionData, QuotingItemData } from "@/actions/quote-actions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function defaultPrice(item: QuotingItemData): number {
  if (item.actualPrice != null) return item.actualPrice;
  const min = item.rateCardMin ?? 0;
  const max = item.rateCardMax ?? 0;
  if (min === 0 && max === 0) return 0;
  return (min + max) / 2;
}

function defaultValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function isPerTraveler(type: string): boolean {
  return type === "ACCOMMODATION" || type === "ACTIVITY";
}

// ─── Inline SVG icons (heroicons style, strokeWidth 1.5) ─────────────────────

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

const typeBadgeClasses: Record<string, string> = {
  ACCOMMODATION: "bg-blue-50 text-blue-700",
  ACTIVITY: "bg-green-50 text-green-700",
  TRANSPORT: "bg-amber-50 text-amber-700",
  ADDON: "bg-purple-50 text-purple-700",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${typeBadgeClasses[type] ?? "bg-slate-100 text-slate-600"}`}
    >
      {type}
    </span>
  );
}

// ─── Quote status badge ───────────────────────────────────────────────────────

const quoteStatusClasses: Record<string, string> = {
  SENT: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REVISION: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-slate-100 text-slate-500",
};

function QuoteStatusBadge({ status }: { status: string | null }) {
  const label = status ?? "SENT";
  return (
    <span
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${quoteStatusClasses[label] ?? "bg-slate-100 text-slate-500"}`}
    >
      {label}
    </span>
  );
}

// ─── Line item state ──────────────────────────────────────────────────────────

interface LineItemState {
  price: string;
  notes: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface QuoteBuilderClientProps {
  data: QuotingSessionData;
}

export function QuoteBuilderClient({ data: initialData }: QuoteBuilderClientProps) {
  const [data, setData] = useState<QuotingSessionData>(initialData);
  const [isPending, startTransition] = useTransition();

  // Per-item state: keyed by booking item id
  const [lineItems, setLineItems] = useState<Record<string, LineItemState>>(() => {
    const init: Record<string, LineItemState> = {};
    for (const item of initialData.items) {
      init[item.id] = {
        price: String(defaultPrice(item)),
        notes: item.notes ?? "",
      };
    }
    return init;
  });

  const [deposit, setDeposit] = useState<string>(() => {
    const total = computeTotal(initialData.items, initialData.booking.numTravelers, lineItems);
    return String(Math.round(total * 0.3 * 100) / 100);
  });
  const [validUntil, setValidUntil] = useState<string>(defaultValidUntil);
  const [adminNotes, setAdminNotes] = useState<string>("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Recompute total whenever lineItems change
  const total = computeTotal(data.items, data.booking.numTravelers, lineItems);

  function updateItemPrice(id: string, value: string) {
    setLineItems((prev) => ({ ...prev, [id]: { ...prev[id], price: value } }));
  }

  function updateItemNotes(id: string, value: string) {
    setLineItems((prev) => ({ ...prev, [id]: { ...prev[id], notes: value } }));
  }

  function set30PctDeposit() {
    setDeposit(String(Math.round(total * 0.3 * 100) / 100));
  }

  function buildLineItemsPayload() {
    return data.items.map((item) => {
      const price = parseFloat(lineItems[item.id]?.price ?? "0") || 0;
      const min = item.rateCardMin ?? price;
      const max = item.rateCardMax ?? price;
      return {
        bookingItemId: item.id,
        estimateMin: min,
        estimateMax: max,
        actualPrice: price,
        notes: lineItems[item.id]?.notes || undefined,
      };
    });
  }

  const handleSaveDraft = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const result = await priceBookingItems(data.booking.id, buildLineItemsPayload());
      if (result.success) {
        setSuccessMessage("Draft saved successfully.");
      } else {
        setErrorMessage(result.error ?? "Failed to save draft.");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.booking.id, data.items, lineItems]);

  const handleSendQuote = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
    startTransition(async () => {
      const depositNum = parseFloat(deposit) || 0;
      const result = await sendQuote({
        bookingId: data.booking.id,
        totalPrice: total,
        deposit: depositNum,
        validUntil,
        adminNotes: adminNotes || undefined,
        lineItems: buildLineItemsPayload(),
      });
      if (result.success) {
        const version = (data.existingQuotes[0]?.version ?? 0) + 1;
        setSuccessMessage(`Quote v${version} sent successfully! The customer can now review it in their dashboard.`);
        setQuoteSent(true);
        topRef.current?.scrollIntoView({ behavior: "smooth" });
        const refreshed = await getSessionForQuoting(data.session.id);
        if (refreshed) setData(refreshed);
      } else {
        setErrorMessage(result.error ?? "Failed to send quote.");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, lineItems, total, deposit, validUntil, adminNotes]);

  const sessionId = data.session.id;
  const { booking, session, items, transportBreakdown, existingQuotes } = data;

  const accommodations = items.filter((i) => i.type === "ACCOMMODATION");
  const activities = items.filter((i) => i.type === "ACTIVITY");
  const transportItem = items.find((i) => i.type === "TRANSPORT");

  return (
    <div ref={topRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href={`/admin/sessions/${sessionId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeftIcon />
        Back to session
      </Link>

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quote Builder</h1>
        <p className="text-sm text-slate-400 mt-0.5">Price the trip and send a quote to the customer.</p>
      </div>

      {/* Success / error banners */}
      {successMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm">
          <CheckCircleIcon />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Trip Summary card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Trip Summary</h2>

            {/* Customer */}
            <div className="mb-4">
              <p className="text-base font-semibold text-slate-800 leading-snug">
                {session.customer.name ?? "Unknown customer"}
              </p>
              {session.customer.email && (
                <p className="text-xs text-slate-400 mt-0.5">{session.customer.email}</p>
              )}
            </div>

            {/* Trip type badge */}
            <div className="mb-4">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                {session.tripType}
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-2 mb-3 text-sm text-slate-600">
              <span className="mt-0.5 text-slate-400 shrink-0">
                <CalendarIcon />
              </span>
              <span>
                {fmtDate(booking.arrivalDate)}
                <span className="mx-1.5 text-slate-300">→</span>
                {fmtDate(booking.departureDate)}
              </span>
            </div>

            {/* Travelers */}
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
              <span className="text-slate-400">
                <UsersIcon />
              </span>
              {booking.numTravelers} traveler{booking.numTravelers !== 1 ? "s" : ""}
            </div>

            {/* Destinations */}
            {accommodations.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Destinations
                </p>
                <ul className="space-y-1">
                  {accommodations.map((item) => (
                    <li key={item.id} className="flex items-center gap-1.5 text-sm text-slate-600">
                      <span className="text-slate-400 shrink-0">
                        <MapPinIcon />
                      </span>
                      {item.destinationName ?? item.description}
                      {item.nights != null && (
                        <span className="text-slate-400 text-xs ml-auto">{item.nights}n</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activities */}
            {activities.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Activities
                </p>
                <ul className="space-y-1">
                  {activities.map((item) => (
                    <li key={item.id} className="text-sm text-slate-600 flex items-start gap-1.5">
                      <span className="text-slate-300 mt-1">·</span>
                      {item.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transport tier */}
            {transportItem && (
              <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                <span className="text-slate-400">
                  <TruckIcon />
                </span>
                Transport:&nbsp;
                <span className="capitalize font-medium text-slate-700">{transportItem.tier ?? "Standard"}</span>
              </div>
            )}
          </div>

          {/* Quote History card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Quote History</h2>
            {existingQuotes.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No quotes sent yet.</p>
            ) : (
              <ul className="space-y-3">
                {existingQuotes.map((q) => (
                  <li
                    key={q.id}
                    className="rounded-xl bg-white/70 border border-slate-100 px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-600">Version {q.version}</span>
                      <QuoteStatusBadge status={q.response} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-slate-800">{fmt(q.totalPrice)}</span>
                      <span className="text-xs text-slate-400">total</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Deposit: {fmt(q.deposit)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {q.sentAt ? `Sent ${fmtDate(q.sentAt)}` : `Created ${fmtDate(q.createdAt)}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Line Items</h2>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Pricing table */}
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const isTransport = item.type === "TRANSPORT";
                return (
                  <div key={item.id}>
                    <div className="px-6 py-4">
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <TypeBadge type={item.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 leading-snug">
                            {item.description}
                          </p>
                          {item.tier && (
                            <p className="text-xs text-slate-400 mt-0.5 capitalize">{item.tier}</p>
                          )}
                        </div>
                      </div>

                      {/* Rate card range */}
                      <div className="mb-3">
                        {item.rateCardMin != null && item.rateCardMax != null ? (
                          <p className="text-xs text-slate-400">
                            Rate card:{" "}
                            <span className="font-medium text-slate-500">
                              {fmt(item.rateCardMin)} – {fmt(item.rateCardMax)}
                            </span>
                            {item.rateCardSeason && (
                              <span className="ml-1.5 capitalize">({item.rateCardSeason} season)</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No rate card</p>
                        )}
                      </div>

                      {/* Actual price + notes row */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                            Actual price (per unit)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={lineItems[item.id]?.price ?? ""}
                            onChange={(e) => updateItemPrice(item.id, e.target.value)}
                            className="w-36 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={lineItems[item.id]?.notes ?? ""}
                            onChange={(e) => updateItemNotes(item.id, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none"
                            placeholder="Optional notes..."
                          />
                        </div>
                      </div>

                      {/* Per-traveler indicator */}
                      <p className="text-[11px] text-slate-400 mt-2">
                        {isPerTraveler(item.type)
                          ? `× ${booking.numTravelers} traveler${booking.numTravelers !== 1 ? "s" : ""} = ${fmt((parseFloat(lineItems[item.id]?.price ?? "0") || 0) * booking.numTravelers)}`
                          : "Flat rate (not multiplied by travelers)"}
                      </p>
                    </div>

                    {/* Transport breakdown info box */}
                    {isTransport && transportBreakdown && (
                      <div className="mx-6 mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                        <p className="font-semibold mb-1.5 flex items-center gap-1.5">
                          <TruckIcon />
                          Transport distance breakdown
                        </p>
                        <p className="mb-0.5">
                          Route: <strong>{transportBreakdown.routeKm} km</strong>
                          &nbsp;·&nbsp;Excursions: <strong>{transportBreakdown.excursionKm} km</strong>
                          &nbsp;·&nbsp;Buffer (30 km/day × {transportBreakdown.tripDays} day{transportBreakdown.tripDays !== 1 ? "s" : ""}): <strong>{transportBreakdown.bufferKm} km</strong>
                        </p>
                        <p className="mb-0.5">
                          Total: <strong>{transportBreakdown.totalKm} km</strong>
                          &nbsp;×&nbsp;{fmt(transportBreakdown.perKmRate)}/km = <strong>{fmt(transportBreakdown.kmCost)}</strong>
                          &nbsp;+&nbsp;{fmt(transportBreakdown.dailyRate)}/day × {transportBreakdown.tripDays} day{transportBreakdown.tripDays !== 1 ? "s" : ""} = <strong>{fmt(transportBreakdown.dailyCost)}</strong>
                        </p>
                        <p className="mt-1.5 font-semibold text-amber-900">
                          Suggested transport cost: {fmt(transportBreakdown.totalTransportCost)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer section */}
            <div className="px-6 py-5 border-t border-slate-100 space-y-5">
              {/* Total calculation */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Calculated Total</span>
                  <span className="text-lg font-bold text-slate-800">{fmt(total)}</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const price = parseFloat(lineItems[item.id]?.price ?? "0") || 0;
                    const perTraveler = isPerTraveler(item.type);
                    const lineTotal = perTraveler ? price * booking.numTravelers : price;
                    return (
                      <div key={item.id} className="flex justify-between text-xs text-slate-500">
                        <span className="truncate max-w-[60%]">
                          {item.description}
                          {perTraveler && (
                            <span className="text-slate-400"> × {booking.numTravelers}</span>
                          )}
                        </span>
                        <span className="font-medium">{fmt(lineTotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deposit */}
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Deposit amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-40 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={set30PctDeposit}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors"
                >
                  30%
                </button>
                {deposit && total > 0 && (
                  <span className="text-xs text-slate-400 mb-2">
                    ({((parseFloat(deposit) / total) * 100).toFixed(1)}% of total)
                  </span>
                )}
              </div>

              {/* Valid until */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Valid until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-48 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none"
                />
              </div>

              {/* Admin notes */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Admin notes (sent with quote)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes or context for the customer..."
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isPending}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Saving..." : "Save Draft"}
                </button>
                {quoteSent ? (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                      <CheckCircleIcon />
                      Quote Sent
                    </span>
                    <button
                      type="button"
                      onClick={() => { setQuoteSent(false); setSuccessMessage(null); }}
                      className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                    >
                      Send another revision
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendQuote}
                    disabled={isPending || total <= 0}
                    className="bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Sending..." : "Send Quote"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Total calculation (pure function used in render and init) ────────────────

function computeTotal(
  items: QuotingItemData[],
  numTravelers: number,
  lineItems: Record<string, LineItemState>,
): number {
  return items.reduce((sum, item) => {
    const price = parseFloat(lineItems[item.id]?.price ?? "0") || 0;
    return sum + (isPerTraveler(item.type) ? price * numTravelers : price);
  }, 0);
}
