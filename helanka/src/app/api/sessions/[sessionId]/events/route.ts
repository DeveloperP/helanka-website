import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 2000;
const HEARTBEAT_INTERVAL_MS = 15000;
const MAX_DURATION_MS = 4 * 60 * 1000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const session = await auth();
  if (!session?.user?.id || !db) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tripSession = await db.tripSession.findUnique({
    where: { id: sessionId },
    select: { customerId: true, specialistId: true },
  });

  if (!tripSession) {
    return new Response("Not found", { status: 404 });
  }

  const userId = session.user.id;
  if (tripSession.customerId !== userId && tripSession.specialistId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  let lastMessageId: string | null = null;
  let lastStateUpdatedAt: Date | null = null;

  const initial = await db.chatMessage.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (initial) lastMessageId = initial.id;

  const initialSession = await db.tripSession.findUnique({
    where: { id: sessionId },
    select: { updatedAt: true },
  });
  if (initialSession) lastStateUpdatedAt = initialSession.updatedAt;

  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`retry: 3000\n\n`));

      let heartbeatCounter = 0;

      const poll = async () => {
        if (Date.now() - startTime > MAX_DURATION_MS) {
          controller.close();
          return;
        }

        try {
          const newMessages = await db!.chatMessage.findMany({
            where: {
              sessionId,
              ...(lastMessageId
                ? { createdAt: { gt: (await db!.chatMessage.findUnique({ where: { id: lastMessageId }, select: { createdAt: true } }))?.createdAt ?? new Date(0) } }
                : {}),
            },
            orderBy: { createdAt: "asc" },
            take: 20,
          });

          for (const msg of newMessages) {
            const data = JSON.stringify({
              id: msg.id,
              senderId: msg.senderId,
              senderRole: msg.senderRole,
              content: msg.content,
              messageType: msg.messageType,
              suggestionData: msg.suggestionData,
              suggestionStatus: msg.suggestionStatus,
              createdAt: msg.createdAt.toISOString(),
            });
            controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
            lastMessageId = msg.id;
          }

          const currentSession = await db!.tripSession.findUnique({
            where: { id: sessionId },
            select: { state: true, updatedAt: true, status: true },
          });

          if (currentSession && lastStateUpdatedAt && currentSession.updatedAt > lastStateUpdatedAt) {
            const data = JSON.stringify({
              state: currentSession.state,
              status: currentSession.status,
              updatedAt: currentSession.updatedAt.toISOString(),
            });
            controller.enqueue(encoder.encode(`event: state\ndata: ${data}\n\n`));
            lastStateUpdatedAt = currentSession.updatedAt;
          }

          heartbeatCounter += POLL_INTERVAL_MS;
          if (heartbeatCounter >= HEARTBEAT_INTERVAL_MS) {
            controller.enqueue(encoder.encode(`event: heartbeat\ndata: {}\n\n`));
            heartbeatCounter = 0;
          }
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
