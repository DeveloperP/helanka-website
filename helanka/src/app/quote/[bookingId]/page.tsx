import { getQuoteForToken } from "@/actions/quote-actions";
import { QuoteReviewClient } from "@/app/dashboard/quotes/[bookingId]/quote-review-client";
import Link from "next/link";

export const metadata = {
  title: "View Your Quote | Helanka Vacations",
};

export default async function GuestQuoteReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bookingId } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : null;

  if (!token) {
    return <ExpiredView />;
  }

  const data = await getQuoteForToken(bookingId, token);

  if (!data) {
    return <ExpiredView />;
  }

  return <QuoteReviewClient quote={data} token={token} />;
}

function ExpiredView() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">This link has expired</h1>
        <p className="text-sm text-slate-500">
          The quote link you followed is no longer valid. If you need a new quote or have questions about
          your trip, please get in touch.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="mailto:bookings@helanka.co"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Contact Us
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Back to Helanka
          </Link>
        </div>
      </div>
    </div>
  );
}
