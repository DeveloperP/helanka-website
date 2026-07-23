"use client";

import { useState, useTransition } from "react";
import { submitTripSurvey } from "@/actions/feedback-actions";

interface TripSurveyFormProps {
  bookingId: string;
  onSubmitted: () => void;
}

export function TripSurveyForm({ bookingId, onSubmitted }: TripSurveyFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [referralSource, setReferralSource] = useState("");
  const [socialMediaConsent, setSocialMediaConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please rate your overall trip.");
      return;
    }
    if (!body.trim()) {
      setError("Please share your thoughts about the trip.");
      return;
    }
    if (wouldRecommend === null) {
      setError("Please let us know if you would recommend us.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitTripSurvey({
        bookingId,
        rating,
        body: body.trim(),
        wouldRecommend,
        referralSource: referralSource.trim() || undefined,
        socialMediaConsent,
      });
      if (result.success) {
        onSubmitted();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Trip Complete</h3>
          <p className="text-xs text-slate-500">Thank you for all your daily feedback! One final survey to wrap up.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-medium text-slate-500 mb-2 block">
            How would you rate your overall trip? *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= (hover || rating) ? "text-amber-400" : "text-slate-200"
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

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            Share your thoughts about the trip *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={5000}
            placeholder="What did you enjoy most? What could we improve?"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-2 block">
            Would you recommend Helanka Vacations to family and friends? *
          </label>
          <div className="flex gap-3">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setWouldRecommend(val)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                  wouldRecommend === val
                    ? val
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-red-50 border-red-300 text-red-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {val ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">
            How did you hear about Helanka Vacations?
          </label>
          <input
            type="text"
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            maxLength={200}
            placeholder="Google, friend recommendation, social media..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={socialMediaConsent}
            onChange={(e) => setSocialMediaConsent(e.target.checked)}
            className="mt-0.5 rounded border-slate-300"
          />
          <span className="text-sm text-slate-600">
            I consent to Helanka Vacations using my feedback on social media
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isPending ? "Submitting..." : "Submit Final Survey"}
        </button>
      </form>
    </div>
  );
}
