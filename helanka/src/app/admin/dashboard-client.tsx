"use client";

import Link from "next/link";
import type { DashboardStats, ActivityItem } from "@/actions/admin-actions";

const tripTypeLabels: Record<string, string> = {
  package: "Package",
  custom: "Custom",
  mice: "MICE",
};

export function DashboardClient({
  role,
  stats,
  activity,
}: {
  role: string;
  stats: DashboardStats | null;
  activity: ActivityItem[];
}) {
  if (!stats) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const isAdmin = role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? "Overview of all operations" : "Your assigned sessions"}
        </p>
      </div>

      <div className={`grid gap-4 mb-8 ${isAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
        <StatCard label="Active Sessions" value={stats.activeSessions} color="emerald" href="/admin/sessions" />
        <StatCard label="Idle Sessions" value={stats.idleSessions} color="amber" href="/admin/sessions" />
        <StatCard label="Quote Requests" value={stats.quoteRequests} color="blue" href="/admin/sessions" />
        {isAdmin && (
          <StatCard
            label="Revenue"
            value={stats.totalRevenue != null ? `$${stats.totalRevenue.toLocaleString()}` : "—"}
            color="slate"
            href="/admin/reports"
          />
        )}
      </div>

      {isAdmin && stats.bookingsByStatus && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Booking Pipeline</h2>
            <Link href="/admin/bookings" className="text-xs font-medium text-[#ff9d00] hover:text-[#e68d00] transition-colors">
              View all →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex-shrink-0 bg-slate-50 rounded-lg px-4 py-3 min-w-[120px]">
                <p className="text-lg font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-500 whitespace-nowrap">{formatStatus(status)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Total Bookings"
            value={stats.totalBookings ?? 0}
            color="slate"
            href="/admin/bookings"
          />
          <StatCard
            label="Closed Sessions"
            value={stats.closedSessions}
            color="slate"
            href="/admin/sessions"
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <Link
                key={item.id}
                href={`/admin/sessions/${item.sessionId}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-1"
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  item.senderRole === "CUSTOMER" ? "bg-blue-400" : "bg-emerald-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{item.content}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.senderName ?? item.senderRole} · {item.customerName ?? "Unknown"} ({tripTypeLabels[item.tripType] ?? item.tripType})
                    {" · "}
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: string | number;
  color: "emerald" | "amber" | "blue" | "slate";
  href: string;
}) {
  const colorMap = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    slate: "bg-white border-slate-200 text-slate-900",
  };

  return (
    <Link
      href={href}
      className={`rounded-xl border p-5 transition-shadow hover:shadow-sm ${colorMap[color]}`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-70">{label}</p>
    </Link>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
