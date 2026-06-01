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
    return <p className="p-8 text-slate-400">Database not connected.</p>;
  }

  const isAdmin = role === "ADMIN";

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{greeting}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isAdmin ? "Here's what's happening across operations" : "Your assigned sessions at a glance"}
          </p>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className={`grid gap-4 mb-6 ${isAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
        <StatCard
          label="Active Sessions"
          value={stats.activeSessions}
          icon={<PulseIcon />}
          gradient="from-emerald-400 to-teal-500"
          href="/admin/sessions"
        />
        <StatCard
          label="Idle Sessions"
          value={stats.idleSessions}
          icon={<ClockIcon />}
          gradient="from-amber-400 to-orange-400"
          href="/admin/sessions"
        />
        <StatCard
          label="Quote Requests"
          value={stats.quoteRequests}
          icon={<InboxIcon />}
          gradient="from-blue-400 to-indigo-500"
          href="/admin/sessions"
        />
        {isAdmin && (
          <StatCard
            label="Revenue"
            value={stats.totalRevenue != null ? `$${stats.totalRevenue.toLocaleString()}` : "--"}
            icon={<DollarIcon />}
            gradient="from-violet-400 to-purple-500"
            href="/admin/reports"
          />
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Booking pipeline */}
          {isAdmin && stats.bookingsByStatus && (
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-slate-800">Booking Pipeline</h2>
                <Link href="/admin/bookings" className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">
                  View all
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                  <div key={status} className="flex-shrink-0 bg-slate-50/80 rounded-xl px-4 py-3.5 min-w-[120px] border border-slate-100">
                    <p className="text-xl font-bold text-slate-800">{count}</p>
                    <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap mt-0.5">{formatStatus(status)}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Recent activity */}
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
              <span className="text-[11px] font-medium text-slate-400">Latest messages</span>
            </div>
            {activity.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">No recent activity</p>
                <p className="text-xs text-slate-300 mt-1">Messages will appear here as sessions progress</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activity.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/sessions/${item.sessionId}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors duration-200 group"
                  >
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      item.senderRole === "CUSTOMER" ? "bg-blue-400" : "bg-emerald-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-600 truncate group-hover:text-slate-800 transition-colors">{item.content}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.senderName ?? item.senderRole} · {item.customerName ?? "Unknown"} ({tripTypeLabels[item.tripType] ?? item.tripType})
                        <span className="text-slate-300"> · </span>
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick stats for admin */}
          {isAdmin && (
            <GlassCard>
              <h2 className="text-base font-semibold text-slate-800 mb-4">Overview</h2>
              <div className="space-y-3">
                <QuickStat label="Total Bookings" value={stats.totalBookings ?? 0} href="/admin/bookings" />
                <QuickStat label="Closed Sessions" value={stats.closedSessions} href="/admin/sessions" />
              </div>
            </GlassCard>
          )}

          {/* Quick actions */}
          <GlassCard>
            <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction href="/admin/sessions" label="View Sessions" description="Manage active trip sessions" />
              <QuickAction href="/admin/customers" label="Customer List" description="Browse all customers" />
              {isAdmin && <QuickAction href="/admin/blog/new" label="New Blog Post" description="Write & publish content" />}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-md hover:-translate-y-0.5 pressable"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-slate-300/30`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">{label}</p>
    </Link>
  );
}

function QuickStat({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50/80 transition-colors duration-200 -mx-1 group">
      <span className="text-[13px] text-slate-500 group-hover:text-slate-700 transition-colors">{label}</span>
      <span className="text-sm font-bold text-slate-700">{value}</span>
    </Link>
  );
}

function QuickAction({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="block p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-colors duration-200 group"
    >
      <p className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
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

function PulseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l3.5-7 3 5.5 3.5-9 3.5 7.5 3-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
