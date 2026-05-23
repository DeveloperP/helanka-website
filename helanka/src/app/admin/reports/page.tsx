import { requireAdmin } from "@/lib/auth-guard";
import { getRevenueReport, getConversionFunnel, getUtmAttribution } from "@/actions/report-actions";
import { ReportsClient } from "./reports-client";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireAdmin();
  const { from, to } = await searchParams;

  const [revenue, funnel, utm] = await Promise.all([
    getRevenueReport(from, to),
    getConversionFunnel(from, to),
    getUtmAttribution(from, to),
  ]);

  return <ReportsClient revenue={revenue} funnel={funnel} utm={utm} from={from} to={to} />;
}
