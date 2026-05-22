import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 3000;
const MAX_DURATION_MS = 4 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !db) {
    return new Response("Unauthorized", { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SPECIALIST") {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  const startTime = Date.now();
  let lastChecked = new Date();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`retry: 5000\n\n`));

      const poll = async () => {
        if (Date.now() - startTime > MAX_DURATION_MS) {
          controller.close();
          return;
        }

        try {
          const where = role === "SPECIALIST"
            ? { specialistId: session.user.id, status: { in: ["ACTIVE" as const, "IDLE" as const, "QUOTE_REQUESTED" as const] } }
            : { status: { in: ["ACTIVE" as const, "IDLE" as const, "QUOTE_REQUESTED" as const] } };

          const sessions = await db!.tripSession.findMany({
            where: { ...where, updatedAt: { gt: lastChecked } },
            select: {
              id: true,
              tripType: true,
              status: true,
              activeTab: true,
              lastActivityAt: true,
              idleSince: true,
              updatedAt: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  ...(role === "SPECIALIST" ? {} : { email: true }),
                },
              },
              specialist: { select: { id: true, name: true } },
            },
            orderBy: { lastActivityAt: "desc" },
            take: 50,
          });

          if (sessions.length > 0) {
            const data = JSON.stringify(sessions.map((s) => ({
              id: s.id,
              tripType: s.tripType,
              status: s.status,
              activeTab: s.activeTab,
              lastActivityAt: s.lastActivityAt.toISOString(),
              idleSince: s.idleSince?.toISOString() ?? null,
              customer: s.customer,
              specialist: s.specialist,
            })));
            controller.enqueue(encoder.encode(`event: sessions\ndata: ${data}\n\n`));
          }

          lastChecked = new Date();
        } catch {
          controller.close();
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      };

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
