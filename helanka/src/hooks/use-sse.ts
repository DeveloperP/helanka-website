"use client";

import { useEffect, useRef } from "react";
import { useTripSessionStore } from "@/stores/trip-session-store";
import type { ChatMessage } from "@/stores/trip-session-store";

export function useSSE(sessionId: string | null) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const url = `/api/sessions/${sessionId}/events`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data);
        const chatMessage: ChatMessage = {
          id: msg.id,
          from: msg.senderRole === "CUSTOMER" ? "user" : "rep",
          text: msg.content,
          messageType: msg.messageType,
          suggestionData: msg.suggestionData,
          suggestionStatus: msg.suggestionStatus,
        };

        useTripSessionStore.getState().setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, chatMessage];
        });
      } catch {
        // Malformed message — skip
      }
    });

    es.addEventListener("state", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.state) {
          useTripSessionStore.getState().hydrate(data.state);
        }
      } catch {
        // Malformed state event — skip
      }
    });

    es.onerror = () => {
      // EventSource auto-reconnects; no action needed
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [sessionId]);
}
