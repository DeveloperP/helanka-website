import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { SpecialistsClient } from "./specialists-client";

export default async function AdminSpecialistsPage() {
  await requireAdmin();
  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const specialists = await db.user.findMany({
    where: { role: "SPECIALIST" },
    select: {
      id: true,
      name: true,
      email: true,
      specialty: true,
      lastLogin: true,
      createdAt: true,
      specialistTripSessions: {
        select: {
          id: true,
          status: true,
          lastActivityAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <SpecialistsClient
      specialists={specialists.map((s) => {
        const activeSessions = s.specialistTripSessions.filter(
          (ts) => ts.status === "ACTIVE" || ts.status === "IDLE"
        ).length;
        const totalSessions = s.specialistTripSessions.length;
        const closedSessions = s.specialistTripSessions.filter(
          (ts) => ts.status === "CLOSED"
        ).length;

        return {
          id: s.id,
          name: s.name,
          email: s.email,
          specialty: s.specialty,
          lastLogin: s.lastLogin?.toISOString() ?? null,
          createdAt: s.createdAt.toISOString(),
          activeSessions,
          totalSessions,
          closedSessions,
        };
      })}
    />
  );
}
