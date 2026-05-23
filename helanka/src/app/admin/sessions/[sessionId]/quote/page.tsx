import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { getSessionForQuoting } from "@/actions/quote-actions";
import { redirect } from "next/navigation";
import { QuoteBuilderClient } from "./quote-builder-client";

export default async function QuoteBuilderPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireAdminOrSpecialist();
  const { sessionId } = await params;
  const data = await getSessionForQuoting(sessionId);
  if (!data) redirect("/admin/sessions");
  return <QuoteBuilderClient data={data} />;
}
