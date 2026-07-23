"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyTripFeedback } from "@/actions/feedback-actions";
import type { TripFeedbackSummary } from "@/actions/feedback-actions";
import { DailyFeedbackForm } from "./daily-feedback-form";
import { TripSurveyForm } from "./trip-survey-form";

interface BookingForTrip {
  id: string;
  status: string;
  arrivalDate: string;
  departureDate: string;
  numTravelers: number;
  items: Array<{
    type: string;
    description: string;
    destinationName: string | null;
    nights: number | null;
  }>;
}

interface MyTripTabProps {
  booking: BookingForTrip;
  onBack: () => void;
}

export function MyTripTab({ booking, onBack }: MyTripTabProps) {
  const [data, setData] = useState<TripFeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const loadFeedback = useCallback(async () => {
    const result = await getMyTripFeedback(booking.id);
    setData(result);
    setLoading(false);
  }, [booking.id]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Could not load trip data.</p>
        <button onClick={onBack} className="mt-4 text-primary text-sm font-medium hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const arrival = new Date(booking.arrivalDate);
  const completedDays = data.feedbackByDay.map((f) => f.dayNumber);
  const currentDay = completedDays.length + 1;
  const allDailyComplete = completedDays.length >= data.totalDays;

  function getDayDate(dayNumber: number) {
    const d = new Date(arrival.getTime() + (dayNumber - 1) * 86400000);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  function getDayStatus(dayNumber: number): "completed" | "current" | "locked" {
    if (completedDays.includes(dayNumber)) return "completed";
    if (dayNumber === currentDay) return "current";
    return "locked";
  }

  const groupedItems = {
    ACCOMMODATION: booking.items.filter((i) => i.type === "ACCOMMODATION"),
    ACTIVITY: booking.items.filter((i) => i.type === "ACTIVITY"),
    TRANSPORT: booking.items.filter((i) => i.type === "TRANSPORT"),
    ADDON: booking.items.filter((i) => i.type === "ADDON"),
  };

  const totalDays = data.totalDays;

  function getItemsForDay(dayNum: number) {
    const items: typeof booking.items = [];
    let nightCount = 0;
    for (const acc of groupedItems.ACCOMMODATION) {
      const start = nightCount + 1;
      const end = nightCount + (acc.nights ?? 1);
      if (dayNum >= start && dayNum <= end) items.push(acc);
      nightCount = end;
    }
    const activities = groupedItems.ACTIVITY;
    const actPerDay = Math.max(1, Math.ceil(activities.length / totalDays));
    const actStart = (dayNum - 1) * actPerDay;
    items.push(...activities.slice(actStart, actStart + actPerDay));
    if (dayNum === 1 || dayNum === totalDays) {
      items.push(...groupedItems.TRANSPORT);
    }
    if (dayNum === totalDays) {
      items.push(...groupedItems.ADDON);
    }
    return items;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">My Trip</h2>
          <p className="text-sm text-slate-500">
            {getDayDate(1)} - {getDayDate(data.totalDays)} · {booking.numTravelers} traveler{booking.numTravelers !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {completedDays.length}/{data.totalDays} days reviewed
          </span>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Trip Summary</h3>
        <div className="space-y-3">
          {groupedItems.ACCOMMODATION.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Accommodation</p>
              {groupedItems.ACCOMMODATION.map((item, i) => (
                <p key={i} className="text-sm text-slate-700">
                  {item.description}
                  {item.destinationName && <span className="text-slate-400"> · {item.destinationName}</span>}
                  {item.nights && <span className="text-slate-400"> · {item.nights} nights</span>}
                </p>
              ))}
            </div>
          )}
          {groupedItems.ACTIVITY.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Activities & Excursions</p>
              {groupedItems.ACTIVITY.map((item, i) => (
                <p key={i} className="text-sm text-slate-700">
                  {item.description}
                  {item.destinationName && <span className="text-slate-400"> · {item.destinationName}</span>}
                </p>
              ))}
            </div>
          )}
          {groupedItems.TRANSPORT.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Transport</p>
              {groupedItems.TRANSPORT.map((item, i) => (
                <p key={i} className="text-sm text-slate-700">{item.description}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day-by-day Feedback Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Daily Feedback</h3>
        {Array.from({ length: data.totalDays }, (_, i) => i + 1).map((dayNum) => {
          const status = getDayStatus(dayNum);
          const feedback = data.feedbackByDay.find((f) => f.dayNumber === dayNum);
          const isExpanded = expandedDay === dayNum;

          return (
            <div
              key={dayNum}
              className={`rounded-2xl transition-all ${
                status === "locked"
                  ? "bg-slate-50 opacity-60"
                  : "bg-white shadow-sm"
              }`}
            >
              <button
                onClick={() => {
                  if (status !== "locked") {
                    setExpandedDay(isExpanded ? null : dayNum);
                  }
                }}
                disabled={status === "locked"}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                {/* Day number badge */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    status === "completed"
                      ? "bg-emerald-100"
                      : status === "current"
                      ? "bg-primary/10"
                      : "bg-slate-100"
                  }`}
                >
                  {status === "completed" ? (
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : status === "locked" ? (
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold text-primary">{dayNum}</span>
                  )}
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Day {dayNum}</p>
                  <p className="text-xs text-slate-500">{getDayDate(dayNum)}</p>
                </div>

                {/* Rating display for completed days */}
                {feedback && (
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= feedback.overallRating ? "text-amber-400" : "text-slate-200"}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                )}

                {status === "current" && !feedback && (
                  <span className="text-xs font-medium text-primary px-2.5 py-1 rounded-full bg-primary/10">
                    Rate today
                  </span>
                )}

                {status === "locked" && (
                  <span className="text-xs text-slate-400">Locked</span>
                )}

                {/* Expand chevron */}
                {status !== "locked" && (
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && status !== "locked" && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  {/* Day's itinerary */}
                  {(() => {
                    const dayItems = getItemsForDay(dayNum);
                    if (dayItems.length === 0) return null;
                    const typeLabels: Record<string, string> = {
                      ACCOMMODATION: "Stay",
                      ACTIVITY: "Activity",
                      TRANSPORT: "Transport",
                      ADDON: "Extra",
                    };
                    const typeColors: Record<string, string> = {
                      ACCOMMODATION: "bg-blue-50 text-blue-600",
                      ACTIVITY: "bg-amber-50 text-amber-600",
                      TRANSPORT: "bg-violet-50 text-violet-600",
                      ADDON: "bg-slate-50 text-slate-600",
                    };
                    return (
                      <div className="pt-4 pb-3 mb-3 border-b border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Today&apos;s Itinerary</p>
                        <div className="space-y-2">
                          {dayItems.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeColors[item.type] ?? "bg-slate-50 text-slate-500"}`}>
                                {typeLabels[item.type] ?? item.type}
                              </span>
                              <p className="text-sm text-slate-700 flex-1">
                                {item.description}
                                {item.destinationName && <span className="text-slate-400"> · {item.destinationName}</span>}
                                {item.nights && <span className="text-slate-400"> · {item.nights}N</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {feedback ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {feedback.transportRating != null && (
                          <RatingBadge label="Transport" rating={feedback.transportRating} />
                        )}
                        {feedback.foodRating != null && (
                          <RatingBadge label="Food" rating={feedback.foodRating} />
                        )}
                        {feedback.guideRating != null && (
                          <RatingBadge label="Guide" rating={feedback.guideRating} />
                        )}
                        {feedback.accommodationRating != null && (
                          <RatingBadge label="Accommodation" rating={feedback.accommodationRating} />
                        )}
                      </div>
                      {feedback.comment && (
                        <p className="text-sm text-slate-600 italic">&ldquo;{feedback.comment}&rdquo;</p>
                      )}
                      <p className="text-xs text-slate-400">
                        Submitted {new Date(feedback.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <DailyFeedbackForm
                      bookingId={booking.id}
                      dayNumber={dayNum}
                      onSubmitted={() => {
                        loadFeedback();
                        setExpandedDay(null);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* End-of-trip Survey */}
      {allDailyComplete && !data.survey && (
        <TripSurveyForm bookingId={booking.id} onSubmitted={loadFeedback} />
      )}

      {/* Survey completed state */}
      {data.survey && (
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
            <h3 className="text-sm font-bold text-emerald-900">All feedback complete</h3>
          </div>
          <p className="text-sm text-emerald-700">
            Thank you for sharing your experience! Your feedback helps us improve our services.
          </p>
        </div>
      )}
    </div>
  );
}

function RatingBadge({ label, rating }: { label: string; rating: number }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex gap-0.5 ml-auto">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= rating ? "text-amber-400" : "text-slate-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
