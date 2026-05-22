import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { getDashboardStats, getRecentActivity } from "@/actions/admin-actions";
import { DashboardClient } from "./dashboard-client";

export default async function AdminDashboardPage() {
  const session = await requireAdminOrSpecialist();
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ]);

  return (
    <DashboardClient
      role={session.user.role}
      stats={stats}
      activity={activity}
    />
  );
}
