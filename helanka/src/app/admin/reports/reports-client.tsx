"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueDataPoint, FunnelStage, UtmRow } from "@/actions/report-actions";
import { toCSV } from "@/lib/csv-export";

interface RevenueData {
  monthly: RevenueDataPoint[];
  byDestination: { name: string; revenue: number }[];
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
}

const tabs = ["Revenue", "Conversion", "Attribution"] as const;
type Tab = (typeof tabs)[number];

export function ReportsClient({
  revenue,
  funnel,
  utm,
}: {
  revenue: RevenueData | null;
  funnel: FunnelStage[];
  utm: UtmRow[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Revenue");

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Analytics and business metrics</p>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 max-w-md">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-all ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Revenue" && <RevenueTab data={revenue} />}
      {activeTab === "Conversion" && <ConversionTab funnel={funnel} />}
      {activeTab === "Attribution" && <AttributionTab utm={utm} />}
    </div>
  );
}

function RevenueTab({ data }: { data: RevenueData | null }) {
  if (!data) return <p className="text-slate-400">No data available.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={`$${data.totalRevenue.toLocaleString()}`} />
        <StatCard label="Total Bookings" value={data.totalBookings} />
        <StatCard label="Avg Booking Value" value={`$${data.avgBookingValue.toLocaleString()}`} />
      </div>

      {data.monthly.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Monthly Revenue</h2>
            <ExportButton
              data={data.monthly.map((d) => ({ Month: d.month, Revenue: d.revenue, Transactions: d.count }))}
              filename="revenue-monthly"
            />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#ff9d00" strokeWidth={2} dot={{ fill: "#ff9d00" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {data.byDestination.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Revenue by Destination</h2>
            <ExportButton
              data={data.byDestination.map((d) => ({ Destination: d.name, Revenue: d.revenue }))}
              filename="revenue-destination"
            />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDestination}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#ff9d00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function ConversionTab({ funnel }: { funnel: FunnelStage[] }) {
  if (funnel.length === 0) return <p className="text-slate-400">No data available.</p>;

  const max = funnel[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-slate-900">Conversion Funnel</h2>
          <ExportButton
            data={funnel.map((f, i) => ({
              Stage: f.stage,
              Count: f.count,
              "Drop-off": i > 0 ? `${Math.round(((funnel[i - 1].count - f.count) / funnel[i - 1].count) * 100)}%` : "—",
            }))}
            filename="conversion-funnel"
          />
        </div>
        <div className="space-y-4">
          {funnel.map((stage, i) => {
            const pct = Math.round((stage.count / max) * 100);
            const dropoff = i > 0 && funnel[i - 1].count > 0
              ? Math.round(((funnel[i - 1].count - stage.count) / funnel[i - 1].count) * 100)
              : null;

            return (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{stage.count}</span>
                    {dropoff != null && (
                      <span className="text-xs text-red-500">-{dropoff}%</span>
                    )}
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff9d00] to-[#e68d00] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AttributionTab({ utm }: { utm: UtmRow[] }) {
  if (utm.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-400">No UTM attribution data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">UTM Source Attribution</h2>
        <ExportButton
          data={utm.map((u) => ({ Source: u.source, Bookings: u.bookings, Revenue: u.revenue }))}
          filename="utm-attribution"
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2.5 font-medium text-slate-500">Source</th>
            <th className="text-right py-2.5 font-medium text-slate-500">Bookings</th>
            <th className="text-right py-2.5 font-medium text-slate-500">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {utm.map((row) => (
            <tr key={row.source} className="border-b border-slate-100 last:border-0">
              <td className="py-3 text-slate-900 font-medium">{row.source}</td>
              <td className="py-3 text-right text-slate-700">{row.bookings}</td>
              <td className="py-3 text-right text-slate-900 font-medium">${row.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
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
      className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export CSV
    </button>
  );
}
