import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SessionDetailClient } from "./session-detail-client";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await requireAdminOrSpecialist();

  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const isSpecialist = session.user.role === "SPECIALIST";
  const tripSession = await db.tripSession.findUnique({
    where: { id: sessionId },
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
  });

  if (!tripSession) {
    redirect("/admin/sessions");
  }

  if (
    session.user.role === "SPECIALIST" &&
    tripSession.specialistId !== session.user.id
  ) {
    redirect("/admin/sessions");
  }

  const messages = await db.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const serialized = {
    id: tripSession.id,
    tripType: tripSession.tripType,
    status: tripSession.status,
    activeTab: tripSession.activeTab,
    state: tripSession.state as Record<string, unknown>,
    lastActivityAt: tripSession.lastActivityAt.toISOString(),
    idleSince: tripSession.idleSince?.toISOString() ?? null,
    createdAt: tripSession.createdAt.toISOString(),
    customer: tripSession.customer,
    specialist: tripSession.specialist,
  };

  const serializedMessages = messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    senderRole: m.senderRole,
    content: m.content,
    messageType: m.messageType,
    suggestionData: m.suggestionData as Record<string, unknown> | null,
    suggestionStatus: m.suggestionStatus,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <SessionDetailClient
      session={serialized}
      initialMessages={serializedMessages}
      currentUserId={session.user.id}
    />
  );
}
