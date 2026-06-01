"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface SessionRow {
  id: string;
  tripType: string;
  status: string;
  activeTab: string;
  lastActivityAt: string;
  idleSince: string | null;
  createdAt: string;
  customer: { id: string; name: string | null; email: string | null } | null;
  specialist: { id: string; name: string | null } | null;
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SessionListClient({
  initialSessions,
  role,
}: {
  initialSessions: SessionRow[];
  role: string;
}) {
  const [sessions, setSessions] = useState<SessionRow[]>(initialSessions);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/admin/sessions/events");
    esRef.current = es;

    es.addEventListener("sessions", (e) => {
      try {
        const updated: SessionRow[] = JSON.parse(e.data);
        setSessions((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]));
          for (const u of updated) map.set(u.id, u);
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
          );
        });
      } catch {
        // skip malformed
      }
    });

    es.onerror = () => {};

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Active Sessions</h1>
            <p className="text-sm text-slate-500 mt-1">
              {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No active sessions</p>
            <p className="text-sm mt-1">Sessions will appear here when customers start building trips.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const isIdle = s.idleSince !== null;
              return (
                <Link
                  key={s.id}
                  href={`/admin/sessions/${s.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-[border-color,box-shadow]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                        {(s.customer?.name ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {s.customer?.name ?? "Unknown"}
                        </p>
                        {role === "ADMIN" && s.customer?.email && (
                          <p className="text-xs text-slate-400">{s.customer.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{tripTypeLabels[s.tripType] ?? s.tripType}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[s.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {s.status.replace("_", " ")}
                      </span>
                      {isIdle && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          Stuck
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(s.lastActivityAt)}</span>
                    </div>
                  </div>
                  {role === "ADMIN" && s.specialist && (
                    <p className="text-xs text-slate-400 mt-2 ml-14">
                      Assigned to {s.specialist.name}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
