"use server";

import type { SuggestionData } from "@/lib/validations";

interface ChatMessageRecord {
  id: string;
  sessionId: string;
  senderId: string;
  senderRole: string;
  content: string;
  messageType: string;
  suggestionData: Record<string, unknown> | null;
  suggestionStatus: string | null;
  createdAt: Date;
}

export async function sendChatMessage(input: {
  sessionId: string;
  content: string;
  messageType?: "TEXT" | "SUGGESTION" | "SYSTEM";
}): Promise<ChatMessageRecord | null> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return null;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return null;

    const tripSession = await db.tripSession.findUnique({
      where: { id: input.sessionId },
      select: { customerId: true, specialistId: true },
    });
    if (!tripSession) return null;

    const isCustomer = tripSession.customerId === session.user.id;
    const isSpecialist = tripSession.specialistId === session.user.id;
    if (!isCustomer && !isSpecialist) return null;

    const message = await db.chatMessage.create({
      data: {
        sessionId: input.sessionId,
        senderId: session.user.id,
        senderRole: session.user.role,
        content: input.content,
        messageType: input.messageType ?? "TEXT",
      },
    });

    await db.tripSession.update({
      where: { id: input.sessionId },
      data: { lastActivityAt: new Date(), idleSince: null },
    });

    return {
      id: message.id,
      sessionId: message.sessionId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      messageType: message.messageType,
      suggestionData: message.suggestionData as Record<string, unknown> | null,
      suggestionStatus: message.suggestionStatus,
      createdAt: message.createdAt,
    };
  } catch {
    return null;
  }
}

export async function sendSuggestion(input: {
  sessionId: string;
  content: string;
  suggestionData: SuggestionData;
}): Promise<ChatMessageRecord | null> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return null;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SPECIALIST") return null;

    const tripSession = await db.tripSession.findUnique({
      where: { id: input.sessionId },
      select: { specialistId: true },
    });
    if (!tripSession || tripSession.specialistId !== session.user.id) return null;

    const message = await db.chatMessage.create({
      data: {
        sessionId: input.sessionId,
        senderId: session.user.id,
        senderRole: "SPECIALIST",
        content: input.content,
        messageType: "SUGGESTION",
        suggestionData: JSON.parse(JSON.stringify(input.suggestionData)),
        suggestionStatus: "PENDING",
      },
    });

    return {
      id: message.id,
      sessionId: message.sessionId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      messageType: message.messageType,
      suggestionData: message.suggestionData as Record<string, unknown> | null,
      suggestionStatus: message.suggestionStatus,
      createdAt: message.createdAt,
    };
  } catch {
    return null;
  }
}

export async function respondToSuggestion(input: {
  messageId: string;
  action: "ACCEPTED" | "DISMISSED";
}): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return false;
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return false;

    const message = await db.chatMessage.findUnique({
      where: { id: input.messageId },
      include: { session: { select: { customerId: true, id: true, state: true } } },
    });
    if (!message || message.session.customerId !== session.user.id) return false;
    if (message.messageType !== "SUGGESTION" || message.suggestionStatus !== "PENDING") return false;

    await db.chatMessage.update({
      where: { id: input.messageId },
      data: { suggestionStatus: input.action },
    });

    if (input.action === "ACCEPTED" && message.suggestionData) {
      const suggestion = message.suggestionData as Record<string, unknown>;
      const state = message.session.state as Record<string, unknown>;

      if (suggestion.type === "add_excursion" && suggestion.itemId) {
        const excursions = (state.excursionIds as string[]) ?? [];
        if (!excursions.includes(suggestion.itemId as string)) {
          state.excursionIds = [...excursions, suggestion.itemId as string];
        }
      } else if (suggestion.type === "add_destination" && suggestion.itemId) {
        const dests = (state.destinations as string[]) ?? [];
        if (!dests.includes(suggestion.itemId as string)) {
          state.destinations = [...dests, suggestion.itemId as string];
        }
      } else if (suggestion.type === "change_accommodation" && suggestion.itemId) {
        state.accommodation = suggestion.itemId;
      } else if (suggestion.type === "change_transport" && suggestion.itemId) {
        state.transport = suggestion.itemId;
      }

      await db.tripSession.update({
        where: { id: message.session.id },
        data: { state: JSON.parse(JSON.stringify(state)), lastActivityAt: new Date() },
      });
    }

    return true;
  } catch {
    return false;
  }
}

export async function getChatHistory(input: {
  sessionId: string;
  cursor?: string;
  limit?: number;
}): Promise<{ messages: ChatMessageRecord[]; nextCursor: string | null }> {
  try {
    const { db } = await import("@/lib/db");
    if (!db) return { messages: [], nextCursor: null };
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return { messages: [], nextCursor: null };

    const tripSession = await db.tripSession.findUnique({
      where: { id: input.sessionId },
      select: { customerId: true, specialistId: true },
    });
    if (!tripSession) return { messages: [], nextCursor: null };
    if (tripSession.customerId !== session.user.id && tripSession.specialistId !== session.user.id) {
      return { messages: [], nextCursor: null };
    }

    const limit = input.limit ?? 50;
    const messages = await db.chatMessage.findMany({
      where: { sessionId: input.sessionId },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: results.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        senderId: m.senderId,
        senderRole: m.senderRole,
        content: m.content,
        messageType: m.messageType,
        suggestionData: m.suggestionData as Record<string, unknown> | null,
        suggestionStatus: m.suggestionStatus,
        createdAt: m.createdAt,
      })),
      nextCursor: hasMore ? results[results.length - 1].id : null,
    };
  } catch {
    return { messages: [], nextCursor: null };
  }
}
