"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface CustomerSession {
  id: string;
  tripType: string;
  status: string;
  lastActivityAt: string;
  destinations: string[];
}

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  createdAt: string | null;
  lastLogin: string | null;
  sessions: CustomerSession[];
  bookingCount: number | null;
}

const tripTypeLabels: Record<string, string> = {
  package: "Package",
  custom: "Custom",
  mice: "MICE",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  IDLE: "bg-amber-100 text-amber-700",
  QUOTE_REQUESTED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export function CustomerListClient({
  role,
  customers,
}: {
  role: string;
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");
  const [tripFilter, setTripFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const isAdmin = role === "ADMIN";

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const query = search.toLowerCase();
      const nameMatch = c.name?.toLowerCase().includes(query) ?? false;
      const emailMatch = isAdmin && c.email?.toLowerCase().includes(query);
      if (query && !nameMatch && !emailMatch) return false;

      if (tripFilter !== "all") {
        if (!c.sessions.some((s) => s.tripType === tripFilter)) return false;
      }
      if (statusFilter !== "all") {
        if (!c.sessions.some((s) => s.status === statusFilter)) return false;
      }
      return true;
    });
  }, [customers, search, tripFilter, statusFilter, isAdmin]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? `${customers.length} total customers` : `${customers.length} assigned customers`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder={isAdmin ? "Search by name or email..." : "Search by name..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-shadow"
        />
        <select
          value={tripFilter}
          onChange={(e) => setTripFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="all">All Trip Types</option>
          <option value="package">Package</option>
          <option value="custom">Custom</option>
          <option value="mice">MICE</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="all">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="IDLE">Idle</option>
          <option value="QUOTE_REQUESTED">Quote Requested</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400">No customers found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => {
            const latestSession = customer.sessions[0];
            const allDestinations = [...new Set(customer.sessions.flatMap((s) => s.destinations))];

            return (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {customer.name ?? "Unknown"}
                      </p>
                      {isAdmin && customer.email && (
                        <p className="text-xs text-slate-400">{customer.email}</p>
                      )}
                      {allDestinations.length > 0 && (
                        <p className="text-xs text-slate-400 mt-0.5">{allDestinations.join(", ")}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isAdmin && customer.country && (
                      <span className="text-xs text-slate-400">{customer.country}</span>
                    )}
                    <div className="flex gap-1">
                      {customer.sessions.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[s.status] ?? "bg-slate-100 text-slate-500"}`}
                        >
                          {tripTypeLabels[s.tripType] ?? s.tripType}
                        </span>
                      ))}
                    </div>
                    {isAdmin && customer.bookingCount != null && (
                      <span className="text-xs text-slate-400">{customer.bookingCount} booking{customer.bookingCount !== 1 ? "s" : ""}</span>
                    )}
                    {latestSession && (
                      <span className="text-xs text-slate-400">{timeAgo(latestSession.lastActivityAt)}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
