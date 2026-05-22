"use client";

import Link from "next/link";

interface SessionInfo {
  id: string;
  tripType: string;
  status: string;
  lastActivityAt: string;
  createdAt: string;
  customerName: string | null;
  messageCount: number;
}

interface SpecialistData {
  id: string;
  name: string | null;
  email: string;
  specialty: string | null;
  lastLogin: string | null;
  createdAt: string;
  sessions: SessionInfo[];
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

export function SpecialistDetailClient({ specialist }: { specialist: SpecialistData }) {
  const active = specialist.sessions.filter((s) => s.status === "ACTIVE" || s.status === "IDLE").length;
  const closed = specialist.sessions.filter((s) => s.status === "CLOSED").length;
  const totalMessages = specialist.sessions.reduce((sum, s) => sum + s.messageCount, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/specialists" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{specialist.name ?? "Unnamed"}</h1>
          <p className="text-sm text-slate-500">
            {specialist.email} · {specialist.specialty ?? "General"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <InfoCard label="Active Sessions" value={active} />
        <InfoCard label="Closed Sessions" value={closed} />
        <InfoCard label="Total Sessions" value={specialist.sessions.length} />
        <InfoCard label="Total Messages" value={totalMessages} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-2">Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Last Login</p>
            <p className="text-slate-900">{specialist.lastLogin ? new Date(specialist.lastLogin).toLocaleString() : "Never"}</p>
          </div>
          <div>
            <p className="text-slate-400">Member Since</p>
            <p className="text-slate-900">{new Date(specialist.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Session History</h2>
        {specialist.sessions.length === 0 ? (
          <p className="text-sm text-slate-400">No sessions assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {specialist.sessions.map((s) => (
              <Link
                key={s.id}
                href={`/admin/sessions/${s.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-1"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {s.customerName ?? "Unknown"} — {tripTypeLabels[s.tripType] ?? s.tripType}
                  </p>
                  <p className="text-xs text-slate-400">{s.messageCount} messages · Started {new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[s.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-400">{timeAgo(s.lastActivityAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
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
