import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SpecialistDetailClient } from "./specialist-detail-client";

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ specialistId: string }>;
}) {
  const { specialistId } = await params;
  await requireAdmin();

  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const specialist = await db.user.findUnique({
    where: { id: specialistId, role: "SPECIALIST" },
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
          tripType: true,
          status: true,
          lastActivityAt: true,
          createdAt: true,
          customer: { select: { name: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { lastActivityAt: "desc" },
      },
    },
  });

  if (!specialist) redirect("/admin/specialists");

  return (
    <SpecialistDetailClient
      specialist={{
        id: specialist.id,
        name: specialist.name,
        email: specialist.email,
        specialty: specialist.specialty,
        lastLogin: specialist.lastLogin?.toISOString() ?? null,
        createdAt: specialist.createdAt.toISOString(),
        sessions: specialist.specialistTripSessions.map((s) => ({
          id: s.id,
          tripType: s.tripType,
          status: s.status,
          lastActivityAt: s.lastActivityAt.toISOString(),
          createdAt: s.createdAt.toISOString(),
          customerName: s.customer?.name ?? null,
          messageCount: s._count.messages,
        })),
      }}
    />
  );
}
