"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { RevenueDataPoint, FunnelStage, UtmRow, PaymentRow, RevenueData } from "@/actions/report-actions";
import { toCSV } from "@/lib/csv-export";

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
  { label: "All", days: 0 },
] as const;

const BAR_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#8b5cf6", "#a78bfa", "#7c3aed", "#4f46e5"];

export function ReportsClient({
  revenue,
  funnel,
  utm,
  from,
  to,
}: {
  revenue: RevenueData | null;
  funnel: FunnelStage[];
  utm: UtmRow[];
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");

  const applyRange = useCallback(
    (f?: string, t?: string) => {
      const params = new URLSearchParams();
      if (f) params.set("from", f);
      if (t) params.set("to", t);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const applyPreset = (days: number) => {
    if (days === 0) {
      router.push(pathname);
      return;
    }
    const f = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const t = new Date().toISOString().slice(0, 10);
    setCustomFrom(f);
    setCustomTo(t);
    applyRange(f, t);
  };

  if (!revenue) {
    return <p className="p-8 text-slate-400">Database not connected.</p>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header + Date Range */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Reports</h1>
          <p className="text-sm text-slate-400 mt-1">Revenue, pipeline, and attribution analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white/60 backdrop-blur text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors"
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white/60 backdrop-blur text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-slate-300 text-xs">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white/60 backdrop-blur text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={() => applyRange(customFrom || undefined, customTo || undefined)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Revenue"
          value={`$${revenue.totalRevenue.toLocaleString()}`}
          sub={`${revenue.recentPayments.length} payments received`}
          icon={<DollarIcon />}
          gradient="from-emerald-400 to-teal-500"
        />
        <KpiCard
          label="Outstanding"
          value={`$${revenue.outstandingBalance.toLocaleString()}`}
          sub={`$${revenue.depositsPaid.toLocaleString()} deposits collected`}
          icon={<ClockIcon />}
          gradient="from-amber-400 to-orange-400"
        />
        <KpiCard
          label="Avg Booking"
          value={`$${revenue.avgBookingValue.toLocaleString()}`}
          sub={`${revenue.avgTravelersPerBooking} avg travelers`}
          icon={<ChartIcon />}
          gradient="from-blue-400 to-indigo-500"
        />
        <KpiCard
          label="Customers"
          value={revenue.customerCount}
          sub={`${revenue.totalBookings} total bookings`}
          icon={<UsersIcon />}
          gradient="from-violet-400 to-purple-500"
        />
      </div>

      {/* Revenue + Pipeline row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue chart — large */}
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-700">Revenue Trend</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Monthly collected payments</p>
            </div>
            <ExportButton
              data={revenue.monthly.map((d) => ({ Month: d.month, Revenue: d.revenue, Transactions: d.count }))}
              filename="revenue-monthly"
            />
          </div>
          {revenue.monthly.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={revenue.monthly}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "13px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="No revenue data for selected period" />
          )}
        </GlassCard>

        {/* Booking pipeline */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-700">Pipeline</h2>
            <span className="text-[11px] font-semibold text-slate-400">{revenue.totalBookings} total</span>
          </div>
          <div className="space-y-3">
            {Object.entries(revenue.bookingsByStatus).map(([status, count]) => {
              const max = Math.max(...Object.values(revenue.bookingsByStatus), 1);
              const pct = Math.round((count / max) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-slate-600">{formatStatus(status)}</span>
                    <span className="text-[12px] font-bold text-slate-700">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] ${statusColor(status)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Second row: Destinations + Funnel + Attribution */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Top destinations */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-700">Top Destinations</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">By revenue contribution</p>
            </div>
            <ExportButton
              data={revenue.topDestinations.map((d) => ({ Destination: d.name, Bookings: d.bookings, Revenue: d.revenue }))}
              filename="destinations"
            />
          </div>
          {revenue.topDestinations.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={revenue.topDestinations} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={85} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px", background: "rgba(255,255,255,0.95)" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
                    {revenue.topDestinations.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="No destination data" />
          )}
        </GlassCard>

        {/* Conversion funnel */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-700">Conversion Funnel</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Session to completion</p>
            </div>
            <ExportButton
              data={funnel.map((f, i) => ({
                Stage: f.stage,
                Count: f.count,
                Dropoff: i > 0 ? `${Math.round(((funnel[i - 1].count - f.count) / funnel[i - 1].count) * 100)}%` : "-",
              }))}
              filename="conversion-funnel"
            />
          </div>
          {funnel.length > 0 ? (
            <div className="space-y-4">
              {funnel.map((stage, i) => {
                const max = funnel[0]?.count || 1;
                const pct = Math.round((stage.count / max) * 100);
                const dropoff =
                  i > 0 && funnel[i - 1].count > 0
                    ? Math.round(((funnel[i - 1].count - stage.count) / funnel[i - 1].count) * 100)
                    : null;
                const convRate = i > 0 ? Math.round((stage.count / max) * 100) : 100;

                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-slate-600">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-slate-700">{stage.count}</span>
                        {dropoff != null && (
                          <span className="text-[10px] font-semibold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-md">-{dropoff}%</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-[width]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {i === funnel.length - 1 && (
                      <p className="text-[10px] text-slate-400 mt-1">Overall conversion: {convRate}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No funnel data" />
          )}
        </GlassCard>

        {/* UTM Attribution */}
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-slate-700">Source Attribution</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">UTM tracking breakdown</p>
            </div>
            <ExportButton
              data={utm.map((u) => ({ Source: u.source, Bookings: u.bookings, Revenue: u.revenue }))}
              filename="utm-attribution"
            />
          </div>
          {utm.length > 0 ? (
            <div className="space-y-2">
              {utm.map((row) => {
                const maxRev = Math.max(...utm.map((u) => u.revenue), 1);
                const pct = Math.round((row.revenue / maxRev) * 100);
                return (
                  <div key={row.source} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-semibold text-slate-700 capitalize">{row.source}</span>
                      <span className="text-[12px] font-bold text-slate-800">${row.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{row.bookings} bookings</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="No UTM data tracked" />
          )}
        </GlassCard>
      </div>

      {/* Recent Payments table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-700">Recent Payments</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Latest successful transactions</p>
          </div>
          <ExportButton
            data={revenue.recentPayments.map((p) => ({
              Date: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "-",
              Customer: p.customerName ?? p.customerEmail,
              Amount: p.amount,
              Method: p.method ?? "-",
              Status: p.bookingStatus,
            }))}
            filename="payments"
          />
        </div>
        {revenue.recentPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Customer</th>
                  <th className="text-left py-2.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Date</th>
                  <th className="text-left py-2.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Method</th>
                  <th className="text-left py-2.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Booking</th>
                  <th className="text-right py-2.5 font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {revenue.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <p className="font-medium text-slate-700">{p.customerName ?? "—"}</p>
                      <p className="text-[11px] text-slate-400">{p.customerEmail}</p>
                    </td>
                    <td className="py-3 text-slate-600">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                        {(p.method ?? "—").replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={p.bookingStatus} />
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      ${p.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="No payments in selected period" />
        )}
      </GlassCard>
    </div>
  );
}

// --- Shared components ---

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/50 p-6 ${className}`}>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm shadow-slate-200/50 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-slate-300/30`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">{label}</p>
      <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-600",
    CONFIRMED: "bg-blue-50 text-blue-600",
    BALANCE_DUE: "bg-amber-50 text-amber-600",
    QUOTE_SENT: "bg-indigo-50 text-indigo-600",
    DRAFT: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${colors[status] ?? "bg-slate-100 text-slate-500"}`}>
      {formatStatus(status)}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function ExportButton({ data, filename }: { data: Record<string, unknown>[]; filename: string }) {
  function handleExport() {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 bg-slate-50/80 rounded-lg px-2.5 py-1.5 border border-slate-100 hover:border-slate-200"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      CSV
    </button>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-300",
    QUOTE_REQUESTED: "bg-blue-400",
    PRICING_IN_PROGRESS: "bg-indigo-400",
    QUOTE_SENT: "bg-violet-400",
    CONFIRMED: "bg-emerald-400",
    BALANCE_DUE: "bg-amber-400",
    COMPLETED: "bg-emerald-500",
    CANCELLED: "bg-red-400",
    EXPIRED: "bg-slate-400",
  };
  return map[status] ?? "bg-slate-300";
}

// --- Icons ---

function DollarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
