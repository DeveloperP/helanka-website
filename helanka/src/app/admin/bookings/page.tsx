import { requireAdmin } from "@/lib/auth-guard";
import { getBookings } from "@/actions/booking-actions";
import { BookingsClient } from "./bookings-client";

export default async function AdminBookingsPage() {
  await requireAdmin();
  const bookings = await getBookings();
  return <BookingsClient bookings={bookings} />;
}
