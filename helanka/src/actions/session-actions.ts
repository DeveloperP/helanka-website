"use server";

import type { TripSessionState } from "@/lib/validations";

interface CreateResult {
  sessionId: string;
  specialistId: string | null;
}

interface TripSessionRecord {
  id: string;
  state: Record<string, unknown>;
  activeTab: string;
  status: string;
}

export async function createTripSession(input: {
  state: TripSessionState;
  activeTab?: string;
}): Promise<CreateResult | null> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return null;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return null;

    const specialist = await db.user.findFirst({
      where: { role: "SPECIALIST", specialty: input.state.tripType },
      select: { id: true },
    });

    const tripSession = await db.tripSession.create({
      data: {
        customerId: session.user.id,
        specialistId: specialist?.id ?? null,
        tripType: input.state.tripType,
        state: JSON.parse(JSON.stringify(input.state)),
        activeTab: input.activeTab ?? "overview",
      },
    });

    return { sessionId: tripSession.id, specialistId: specialist?.id ?? null };
  } catch {
    return null;
  }
}

export async function updateTripSessionState(input: {
  sessionId: string;
  state: TripSessionState;
  activeTab?: string;
}): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return false;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return false;

    await db.tripSession.update({
      where: { id: input.sessionId, customerId: session.user.id },
      data: {
        state: JSON.parse(JSON.stringify(input.state)),
        activeTab: input.activeTab,
        lastActivityAt: new Date(),
        idleSince: null,
      },
    });

    return true;
  } catch {
    return false;
  }
}

export async function getActiveTripSession(): Promise<TripSessionRecord | null> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return null;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return null;

    const tripSession = await db.tripSession.findFirst({
      where: { customerId: session.user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    if (!tripSession) return null;

    return {
      id: tripSession.id,
      state: tripSession.state as Record<string, unknown>,
      activeTab: tripSession.activeTab,
      status: tripSession.status,
    };
  } catch {
    return null;
  }
}

export async function requestQuote(sessionId: string): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return false;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return false;

    await db.tripSession.update({
      where: { id: sessionId, customerId: session.user.id },
      data: { status: "QUOTE_REQUESTED" },
    });

    return true;
  } catch {
    return false;
  }
}

export async function closeTripSession(sessionId: string): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return false;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return false;

    await db.tripSession.update({
      where: { id: sessionId, customerId: session.user.id },
      data: { status: "CLOSED" },
    });

    return true;
  } catch {
    return false;
  }
}
