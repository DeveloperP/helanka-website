"use client";

import { useMemo } from "react";
import Link from "next/link";

interface Specialist {
  id: string;
  name: string | null;
  email: string;
  specialty: string | null;
  lastLogin: string | null;
  createdAt: string;
  activeSessions: number;
  totalSessions: number;
  closedSessions: number;
}

export function SpecialistsClient({ specialists }: { specialists: Specialist[] }) {
  // eslint-disable-next-line react-hooks/purity -- snapshot time once on mount for online indicator
  const now = useMemo(() => Date.now(), []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="text-sm text-slate-500 mt-1">{specialists.length} specialist{specialists.length !== 1 ? "s" : ""}</p>
      </div>

      {specialists.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400">No specialists found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {specialists.map((s) => {
            const isOnline = s.lastLogin && now - new Date(s.lastLogin).getTime() < 15 * 60 * 1000;
            const initials = s.name
              ? s.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
              : "?";

            return (
              <Link
                key={s.id}
                href={`/admin/specialists/${s.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                        {initials}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.name ?? "Unnamed"}</p>
                      <p className="text-xs text-slate-400">
                        {s.email} · {s.specialty ?? "General"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">{s.activeSessions}</p>
                      <p className="text-[10px] text-slate-400">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-700">{s.closedSessions}</p>
                      <p className="text-[10px] text-slate-400">Closed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-400">{s.totalSessions}</p>
                      <p className="text-[10px] text-slate-400">Total</p>
                    </div>
                    <span className="text-xs text-slate-400 w-20 text-right">
                      {s.lastLogin ? timeAgo(s.lastLogin) : "Never"}
                    </span>
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
