"use client";

import { useState, useTransition } from "react";
import { submitDailyFeedback } from "@/actions/feedback-actions";

interface DailyFeedbackFormProps {
  bookingId: string;
  dayNumber: number;
  onSubmitted: () => void;
}

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <svg
              className={`w-7 h-7 ${
                star <= (hover || value) ? "text-amber-400" : "text-slate-200"
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyFeedbackForm({ bookingId, dayNumber, onSubmitted }: DailyFeedbackFormProps) {
  const [overall, setOverall] = useState(0);
  const [transport, setTransport] = useState(0);
  const [food, setFood] = useState(0);
  const [guide, setGuide] = useState(0);
  const [accommodation, setAccommodation] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overall === 0) {
      setError("Please rate your overall experience.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitDailyFeedback({
        bookingId,
        dayNumber,
        overallRating: overall,
        transportRating: transport || undefined,
        foodRating: food || undefined,
        guideRating: guide || undefined,
        accommodationRating: accommodation || undefined,
        comment: comment.trim() || undefined,
      });
      if (result.success) {
        onSubmitted();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StarRating value={overall} onChange={setOverall} label="Overall experience *" />

      <div className="grid grid-cols-2 gap-4">
        <StarRating value={transport} onChange={setTransport} label="Transport" />
        <StarRating value={food} onChange={setFood} label="Food & Beverages" />
        <StarRating value={guide} onChange={setGuide} label="Your Guide" />
        <StarRating value={accommodation} onChange={setAccommodation} label="Accommodation" />
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Comments (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Share your thoughts about today..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending || overall === 0}
        className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {isPending ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
