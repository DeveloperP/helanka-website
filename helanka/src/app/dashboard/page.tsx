import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  let user = { name: "Traveler", email: "", image: null as string | null };

  try {
    const session = await auth();
    if (session?.user) {
      user = {
        name: session.user.name ?? "Traveler",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      };
    }
  } catch {
    // Dev bypass — no DB/auth available
  }

  return <DashboardClient user={user} />;
}
