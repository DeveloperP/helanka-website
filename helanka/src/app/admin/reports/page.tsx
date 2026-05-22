import { requireAdmin } from "@/lib/auth-guard";
import { getRevenueReport, getConversionFunnel, getUtmAttribution } from "@/actions/report-actions";
import { ReportsClient } from "./reports-client";

export default async function AdminReportsPage() {
  await requireAdmin();

  const [revenue, funnel, utm] = await Promise.all([
    getRevenueReport(),
    getConversionFunnel(),
    getUtmAttribution(),
  ]);

  return <ReportsClient revenue={revenue} funnel={funnel} utm={utm} />;
}
