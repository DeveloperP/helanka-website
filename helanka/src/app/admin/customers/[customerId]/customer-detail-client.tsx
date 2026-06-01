"use client";

import { useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  tripType: string;
  status: string;
  state: Record<string, unknown>;
  lastActivityAt: string;
  createdAt: string;
  specialistName: string | null;
}

interface Booking {
  id: string;
  status: string;
  arrivalDate: string | null;
  departureDate: string | null;
  numTravelers: number;
  createdAt: string;
  destinationName: string | null;
  totalPaid: number;
}

interface CustomerData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  createdAt: string | null;
  lastLogin: string | null;
  sessions: Session[];
  bookings: Booking[] | null;
}

const tripTypeLabels: Record<string, string> = {
  package: "Package Tour",
  custom: "Custom Tour",
  mice: "MICE & Events",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  IDLE: "bg-amber-100 text-amber-700",
  QUOTE_REQUESTED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export function CustomerDetailClient({
  role,
  customer,
}: {
  role: string;
  customer: CustomerData;
}) {
  const isAdmin = role === "ADMIN";
  const tabs = isAdmin ? ["Overview", "Sessions", "Bookings"] as const : ["Overview", "Sessions"] as const;
  type Tab = (typeof tabs)[number];
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/customers"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{customer.name ?? "Unknown Customer"}</h1>
          {isAdmin && customer.email && (
            <p className="text-sm text-slate-500">{customer.email}</p>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-[background-color,color,box-shadow] ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && <OverviewTab customer={customer} isAdmin={isAdmin} />}
      {activeTab === "Sessions" && <SessionsTab sessions={customer.sessions} />}
      {activeTab === "Bookings" && customer.bookings && <BookingsTab bookings={customer.bookings} />}
    </div>
  );
}

function OverviewTab({ customer, isAdmin }: { customer: CustomerData; isAdmin: boolean }) {
  const activeSessions = customer.sessions.filter((s) => s.status === "ACTIVE" || s.status === "IDLE").length;
  const tripTypes = [...new Set(customer.sessions.map((s) => s.tripType))];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard label="Total Sessions" value={customer.sessions.length} />
        <InfoCard label="Active" value={activeSessions} />
        <InfoCard label="Trip Types" value={tripTypes.map((t) => tripTypeLabels[t] ?? t).join(", ") || "—"} />
        {isAdmin && customer.bookings && (
          <InfoCard label="Bookings" value={customer.bookings.length} />
        )}
      </div>

      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Contact Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Email</p>
              <p className="text-slate-900">{customer.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Phone</p>
              <p className="text-slate-900">{customer.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Country</p>
              <p className="text-slate-900">{customer.country ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Member Since</p>
              <p className="text-slate-900">
                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionsTab({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-400">No sessions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <Link
          key={s.id}
          href={`/admin/sessions/${s.id}`}
          className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{tripTypeLabels[s.tripType] ?? s.tripType}</p>
              {s.specialistName && <p className="text-xs text-slate-400 mt-0.5">with {s.specialistName}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[s.status] ?? "bg-slate-100 text-slate-500"}`}>
                {s.status.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-slate-400">{timeAgo(s.lastActivityAt)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BookingsTab({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-400">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/admin/bookings/${b.id}`}
          className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {b.destinationName ?? "Booking"} · {b.numTravelers} traveller{b.numTravelers !== 1 ? "s" : ""}
              </p>
              {b.arrivalDate && b.departureDate && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(b.arrivalDate).toLocaleDateString()} → {new Date(b.departureDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {b.totalPaid > 0 && (
                <span className="text-xs text-emerald-600 font-medium">${b.totalPaid.toLocaleString()}</span>
              )}
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {b.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
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
