import { db } from "@/lib/db";

const IDLE_THRESHOLD_MS = 5 * 60 * 1000;

export async function flagIdleSessions(): Promise<number> {
  if (!db) return 0;

  const threshold = new Date(Date.now() - IDLE_THRESHOLD_MS);

  const result = await db.tripSession.updateMany({
    where: {
      status: "ACTIVE",
      idleSince: null,
      lastActivityAt: { lt: threshold },
    },
    data: {
      status: "IDLE",
      idleSince: new Date(),
    },
  });

  return result.count;
}
