"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { sendChatMessage, sendSuggestion, logEmailNote } from "@/actions/chat-actions";
import type { SuggestionData } from "@/lib/validations";

interface SessionData {
  id: string;
  tripType: string;
  status: string;
  activeTab: string;
  state: Record<string, unknown>;
  lastActivityAt: string;
  idleSince: string | null;
  createdAt: string;
  customer: { id: string; name: string | null; email: string | null } | null;
  specialist: { id: string; name: string | null } | null;
}

interface MessageData {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  messageType: string;
  suggestionData: Record<string, unknown> | null;
  suggestionStatus: string | null;
  createdAt: string;
}

const tripTypeLabels: Record<string, string> = {
  package: "Package Tour",
  custom: "Custom Tour",
  mice: "MICE & Events",
};

export function SessionDetailClient({
  session: initialSession,
  initialMessages,
  currentUserId,
}: {
  session: SessionData;
  initialMessages: MessageData[];
  currentUserId: string;
}) {
  const [session, setSession] = useState(initialSession);
  const [messages, setMessages] = useState<MessageData[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [isSending, startTransition] = useTransition();
  const [showSuggestionPicker, setShowSuggestionPicker] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailDirection, setEmailDirection] = useState<"sent" | "received">("sent");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [isSendingEmail, startEmailTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const es = new EventSource(`/api/sessions/${initialSession.id}/events`);
    esRef.current = es;

    es.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } catch {}
    });

    es.addEventListener("state", (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.state) {
          setSession((prev) => ({ ...prev, state: data.state, status: data.status ?? prev.status }));
        }
      } catch {}
    });

    es.onerror = () => {};

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [initialSession.id]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;
    const text = chatInput.trim();
    setChatInput("");
    startTransition(async () => {
      await sendChatMessage({ sessionId: initialSession.id, content: text });
    });
  }

  function handleSendSuggestion(type: SuggestionData["type"], itemId: string, title: string, price?: number) {
    setShowSuggestionPicker(false);
    startTransition(async () => {
      await sendSuggestion({
        sessionId: initialSession.id,
        content: `Suggested: ${title}`,
        suggestionData: { type, itemId, title, price } as SuggestionData,
      });
    });
  }

  const state = session.state;
  const destinations = (state.destinations as string[]) ?? [];
  const excursionIds = (state.excursionIds as string[]) ?? [];
  const transport = (state.transport as string) ?? "standard";
  const mealPlan = (state.mealPlan as string) ?? "Full Board";
  const guests = (state.guests as number) ?? 2;
  const arrivalDate = (state.arrivalDate as string) ?? "";
  const departureDate = (state.departureDate as string) ?? "";
  const accommodation = (state.accommodation as string) ?? "luxury";

  return (
    <div>
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/sessions" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {session.customer?.name ?? "Unknown Customer"}
              </h1>
              <p className="text-xs text-slate-500">
                {tripTypeLabels[session.tripType] ?? session.tripType}{session.customer?.email ? ` · ${session.customer.email}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/sessions/${initialSession.id}/quote`}
              className="text-xs font-medium px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              {session.status === "CLOSED" ? "View Quote" : session.status === "QUOTE_REQUESTED" ? "Create Quote" : "Start Quote"}
            </Link>
            {session.idleSince && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Customer may be stuck
              </span>
            )}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {session.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Customer selections (read-only mirror) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Customer Selections</h2>
            <div className="space-y-3 text-sm">
              <Row label="Trip Type" value={tripTypeLabels[session.tripType] ?? session.tripType} />
              <Row label="Guests" value={String(guests)} />
              {arrivalDate && <Row label="Arrival" value={arrivalDate} />}
              {departureDate && <Row label="Departure" value={departureDate} />}
              <Row label="Transport" value={transport === "super-luxury" ? "Super Luxury" : "Standard"} />
              <Row label="Accommodation" value={accommodation} />
              <Row label="Meal Plan" value={mealPlan} />
              {destinations.length > 0 && (
                <Row label="Destinations" value={destinations.join(", ")} />
              )}
              {excursionIds.length > 0 && (
                <Row label="Excursions" value={`${excursionIds.length} selected`} />
              )}
              {typeof state.packageSlug === "string" && (
                <Row label="Package" value={state.packageSlug} />
              )}
              {session.tripType === "mice" && (
                <>
                  {typeof state.miceEventType === "string" && <Row label="Event Type" value={state.miceEventType} />}
                  {typeof state.miceGroupSize === "number" && <Row label="Group Size" value={String(state.miceGroupSize)} />}
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Session Info</h2>
            <div className="space-y-2 text-xs text-slate-500">
              <p>Active tab: <span className="font-medium text-slate-700">{session.activeTab}</span></p>
              <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
              <p>Last activity: {new Date(session.lastActivityAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Chat</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowEmailForm(!showEmailForm); setShowSuggestionPicker(false); }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                Log Email
              </button>
              <button
                onClick={() => { setShowSuggestionPicker(!showSuggestionPicker); setShowEmailForm(false); }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              >
                Send Suggestion
              </button>
            </div>
          </div>

          {showEmailForm && (
            <div className="border-b border-slate-100 px-5 py-3 bg-indigo-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Direction:</span>
                <button
                  type="button"
                  onClick={() => setEmailDirection("sent")}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer ${emailDirection === "sent" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  Sent
                </button>
                <button
                  type="button"
                  onClick={() => setEmailDirection("received")}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer ${emailDirection === "received" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  Received
                </button>
              </div>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject (optional)"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Email content or summary..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!emailContent.trim() || isSendingEmail}
                  onClick={() => {
                    startEmailTransition(async () => {
                      await logEmailNote({
                        sessionId: initialSession.id,
                        direction: emailDirection,
                        subject: emailSubject.trim() || undefined,
                        content: emailContent.trim(),
                      });
                      setEmailContent("");
                      setEmailSubject("");
                      setShowEmailForm(false);
                    });
                  }}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSendingEmail ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showSuggestionPicker && (
            <div className="border-b border-slate-100 px-5 py-3 bg-amber-50/50">
              <p className="text-xs font-medium text-slate-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                <SuggestionButton
                  label="Add Excursion"
                  onClick={() => handleSendSuggestion("add_excursion", "whale-watching", "Whale Watching in Mirissa", 45)}
                />
                <SuggestionButton
                  label="Add Destination"
                  onClick={() => handleSendSuggestion("add_destination", "ella", "Ella")}
                />
                <SuggestionButton
                  label="Upgrade Accommodation"
                  onClick={() => handleSendSuggestion("change_accommodation", "ultra-luxury", "Ultra Luxury Accommodation")}
                />
                <SuggestionButton
                  label="Upgrade Transport"
                  onClick={() => handleSendSuggestion("change_transport", "super-luxury", "Super Luxury Transport")}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;

              if (msg.messageType === "SYSTEM") {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <p className="text-xs text-slate-400 italic">{msg.content}</p>
                  </div>
                );
              }

              if (msg.messageType === "SUGGESTION") {
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-[80%]">
                      <span className="text-xs font-medium text-amber-700">Suggestion sent</span>
                      <p className="text-sm text-slate-700 mt-1">{msg.content}</p>
                      {msg.suggestionStatus && (
                        <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          msg.suggestionStatus === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                          msg.suggestionStatus === "DISMISSED" ? "bg-slate-100 text-slate-500" :
                          "bg-amber-100 text-amber-600"
                        }`}>
                          {msg.suggestionStatus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.messageType === "EMAIL_NOTE") {
                const meta = msg.suggestionData as { direction?: string; subject?: string } | null;
                const dir = meta?.direction === "received" ? "Received from customer" : "Sent to customer";
                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 max-w-[80%]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span className="text-xs font-medium text-indigo-600">{dir}</span>
                      </div>
                      {meta?.subject && (
                        <p className="text-sm font-semibold text-slate-800 mb-1">{meta.subject}</p>
                      )}
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] text-indigo-400 mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe ? "bg-slate-900 text-white rounded-br-md" : "bg-slate-100 text-slate-700 rounded-bl-md"
                  }`}>
                    {!isMe && <p className="text-xs font-medium text-slate-400 mb-1">{msg.senderRole === "CUSTOMER" ? session.customer?.name : "You"}</p>}
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-slate-100 p-3">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message to the customer..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-shadow"
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value}</span>
    </div>
  );
}

function SuggestionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
    >
      {label}
    </button>
  );
}
