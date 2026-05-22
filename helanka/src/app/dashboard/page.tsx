import DashboardClient from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
};

const DEV_USER = { name: "Traveler", email: "demo@helanka.co", image: null as string | null };

export default async function DashboardPage() {
  let user = DEV_USER;

  // Only attempt auth when a real database is available
  if (process.env.NODE_ENV === "production" || process.env.AUTH_ENABLED === "1") {
    try {
      const { auth } = await import("@/lib/auth");
      const session = await auth();
      if (session?.user) {
        user = {
          name: session.user.name ?? "Traveler",
          email: session.user.email ?? "",
          image: session.user.image ?? null,
        };
      }
    } catch {
      // DB/auth unavailable — fall through to dev user
    }
  }

  return <DashboardClient user={user} />;
}
