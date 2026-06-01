"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { BookingListItem } from "@/actions/booking-actions";

const pipelineStages = [
  "DRAFT",
  "QUOTE_REQUESTED",
  "PRICING_IN_PROGRESS",
  "QUOTE_SENT",
  "CONFIRMED",
  "BALANCE_DUE",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

const stageColors: Record<string, string> = {
  DRAFT: "border-t-slate-400",
  QUOTE_REQUESTED: "border-t-blue-400",
  PRICING_IN_PROGRESS: "border-t-violet-400",
  QUOTE_SENT: "border-t-indigo-400",
  CONFIRMED: "border-t-emerald-400",
  BALANCE_DUE: "border-t-amber-400",
  COMPLETED: "border-t-emerald-600",
  CANCELLED: "border-t-red-400",
  EXPIRED: "border-t-slate-300",
};

type ViewMode = "pipeline" | "list";

export function BookingsClient({ bookings }: { bookings: BookingListItem[] }) {
  const [view, setView] = useState<ViewMode>("pipeline");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return bookings;
    const q = search.toLowerCase();
    return bookings.filter(
      (b) =>
        b.customerName?.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.destinationName?.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  const grouped = useMemo(() => {
    const map: Record<string, BookingListItem[]> = {};
    for (const stage of pipelineStages) map[stage] = [];
    for (const b of filtered) {
      if (map[b.status]) map[b.status].push(b);
    }
    return map;
  }, [filtered]);

  return (
    <div className="max-w-full mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">{bookings.length} total bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("pipeline")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              view === "pipeline" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              view === "list" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            List
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by customer, destination..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-shadow mb-6"
      />

      {view === "pipeline" ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {pipelineStages
            .filter((stage) => grouped[stage].length > 0 || ["DRAFT", "QUOTE_REQUESTED", "CONFIRMED", "COMPLETED"].includes(stage))
            .map((stage) => (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className={`bg-white rounded-xl border border-slate-200 border-t-4 ${stageColors[stage]}`}>
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-700">{formatStatus(stage)}</p>
                    <p className="text-xs text-slate-400">{grouped[stage].length} booking{grouped[stage].length !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                    {grouped[stage].length === 0 ? (
                      <p className="text-xs text-slate-300 text-center py-4">Empty</p>
                    ) : (
                      grouped[stage].map((b) => (
                        <Link
                          key={b.id}
                          href={`/admin/bookings/${b.id}`}
                          className="block bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-900 truncate">{b.customerName ?? b.customerEmail}</p>
                          {b.destinationName && (
                            <p className="text-xs text-slate-500 truncate">{b.destinationName}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">{b.numTravelers} pax</span>
                            {b.quoteTotal != null && (
                              <span className="text-xs font-medium text-slate-700">${b.quoteTotal.toLocaleString()}</span>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400">No bookings found.</p>
            </div>
          ) : (
            filtered.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {b.customerName ?? b.customerEmail}
                      {b.destinationName && ` · ${b.destinationName}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {b.numTravelers} pax
                      {b.arrivalDate && ` · ${new Date(b.arrivalDate).toLocaleDateString()}`}
                      {b.departureDate && ` → ${new Date(b.departureDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.quoteTotal != null && (
                      <span className="text-xs font-medium text-slate-600">${b.quoteTotal.toLocaleString()}</span>
                    )}
                    {b.totalPaid > 0 && (
                      <span className="text-xs text-emerald-600">Paid: ${b.totalPaid.toLocaleString()}</span>
                    )}
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {formatStatus(b.status)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
