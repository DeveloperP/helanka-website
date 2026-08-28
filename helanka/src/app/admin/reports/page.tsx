import { requireStaff } from "@/lib/auth-guard";
import { getRevenueReport, getConversionFunnel, getUtmAttribution } from "@/actions/report-actions";
import { getFeedbackReport } from "@/actions/feedback-actions";
import { ReportsClient } from "./reports-client";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireStaff();
  const { from, to } = await searchParams;

  const [revenue, funnel, utm, feedbackReport] = await Promise.all([
    getRevenueReport(from, to),
    getConversionFunnel(from, to),
    getUtmAttribution(from, to),
    getFeedbackReport(),
  ]);

  return (
    <ReportsClient
      revenue={revenue}
      funnel={funnel}
      utm={utm}
      from={from}
      to={to}
      feedbackReport={feedbackReport}
    />
  );
}
