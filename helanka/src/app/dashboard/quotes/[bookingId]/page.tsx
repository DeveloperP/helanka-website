import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuoteForCustomer } from "@/actions/quote-actions";
import { QuoteReviewClient } from "./quote-review-client";

export default async function QuoteReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { bookingId } = await params;
  const data = await getQuoteForCustomer(bookingId);
  if (!data) redirect("/dashboard");

  return <QuoteReviewClient quote={data} />;
}
