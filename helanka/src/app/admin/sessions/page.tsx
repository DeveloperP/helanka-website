import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { SessionListClient } from "./session-list-client";

export default async function AdminSessionsPage() {
  const session = await requireAdminOrSpecialist();
  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const isSpecialist = session.user.role === "SPECIALIST";
  const activeStatuses = ["ACTIVE" as const, "IDLE" as const, "QUOTE_REQUESTED" as const];
  const where = isSpecialist
    ? { specialistId: session.user.id, status: { in: activeStatuses } }
    : { status: { in: activeStatuses } };

  const sessions = await db.tripSession.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          ...(isSpecialist ? {} : { email: true }),
        },
      },
      specialist: { select: { id: true, name: true } },
    },
    orderBy: { lastActivityAt: "desc" },
    take: 50,
  });

  const initial = sessions.map((s) => ({
    id: s.id,
    tripType: s.tripType,
    status: s.status,
    activeTab: s.activeTab,
    lastActivityAt: s.lastActivityAt.toISOString(),
    idleSince: s.idleSince?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    customer: s.customer,
    specialist: s.specialist,
  }));

  return <SessionListClient initialSessions={initial} role={session.user.role} />;
}
