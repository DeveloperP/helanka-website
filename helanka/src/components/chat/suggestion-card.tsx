"use client";

import { respondToSuggestion } from "@/actions/chat-actions";
import { useTripSessionStore } from "@/stores/trip-session-store";
import { useTransition } from "react";

interface SuggestionCardProps {
  messageId: string;
  suggestion: {
    type: string;
    itemId?: string;
    title?: string;
    description?: string;
    price?: number;
  };
  status: "PENDING" | "ACCEPTED" | "DISMISSED" | null;
}

const typeLabels: Record<string, string> = {
  add_excursion: "Excursion",
  add_destination: "Destination",
  change_accommodation: "Accommodation",
  change_transport: "Transport",
};

export function SuggestionCard({ messageId, suggestion, status }: SuggestionCardProps) {
  const [isPending, startTransition] = useTransition();
  const setChatMessages = useTripSessionStore((s) => s.setChatMessages);

  function handleRespond(action: "ACCEPTED" | "DISMISSED") {
    startTransition(async () => {
      const ok = await respondToSuggestion({ messageId, action });
      if (ok) {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, suggestionStatus: action } : m
          )
        );
      }
    });
  }

  const label = typeLabels[suggestion.type] ?? "Suggestion";
  const resolved = status === "ACCEPTED" || status === "DISMISSED";

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 max-w-[85%]">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          {label}
        </span>
        {resolved && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {status === "ACCEPTED" ? "Added" : "Dismissed"}
          </span>
        )}
      </div>
      {suggestion.title && (
        <p className="text-sm font-semibold text-slate-800">{suggestion.title}</p>
      )}
      {suggestion.description && (
        <p className="text-xs text-slate-600 leading-relaxed">{suggestion.description}</p>
      )}
      {suggestion.price != null && (
        <p className="text-xs font-medium text-amber-700">${suggestion.price} per person</p>
      )}
      {!resolved && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleRespond("ACCEPTED")}
            disabled={isPending}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-[#ff9d00] text-white hover:bg-[#e68d00] disabled:opacity-50 transition-all"
          >
            Add to My Trip
          </button>
          <button
            onClick={() => handleRespond("DISMISSED")}
            disabled={isPending}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-all"
          >
            No Thanks
          </button>
        </div>
      )}
    </div>
  );
}
