import DashboardClient from "./dashboard-client";
import { getCustomerBookings } from "@/actions/quote-actions";
import type { CustomerBookingListItem } from "@/actions/quote-actions";
import { getActiveTrips } from "@/actions/feedback-actions";
import type { ActiveTripData } from "@/actions/feedback-actions";

export const metadata = {
  title: "Dashboard",
};

const DEV_USER = { name: "Traveler", email: "demo@helanka.co", image: null as string | null };

export default async function DashboardPage() {
  let user = DEV_USER;
  let bookings: CustomerBookingListItem[] = [];
  let activeTrips: ActiveTripData[] = [];

  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (session?.user) {
      user = {
        name: session.user.name ?? "Traveler",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      };
      bookings = await getCustomerBookings();
      activeTrips = await getActiveTrips();
    }
  } catch {
    // DB/auth unavailable — fall through to dev user
  }

  return <DashboardClient user={user} bookings={bookings} activeTrips={activeTrips} />;
}
