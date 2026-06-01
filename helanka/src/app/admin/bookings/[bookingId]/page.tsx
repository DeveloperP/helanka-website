import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BookingDetailClient } from "./booking-detail-client";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  await requireAdmin();

  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        select: {
          id: true,
          type: true,
          description: true,
          destination: { select: { name: true } },
          nights: true,
          tier: true,
          actualPrice: true,
          estimateMin: true,
          estimateMax: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      quotes: { orderBy: { version: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
      tripSessions: {
        select: { id: true, tripType: true, status: true },
      },
    },
  });

  if (!booking) redirect("/admin/bookings");

  return (
    <BookingDetailClient
      booking={{
        id: booking.id,
        status: booking.status,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        customerId: booking.user.id,
        arrivalDate: booking.arrivalDate?.toISOString() ?? null,
        departureDate: booking.departureDate?.toISOString() ?? null,
        numTravelers: booking.numTravelers,
        flightNumber: booking.flightNumber,
        utmSource: booking.utmSource,
        utmMedium: booking.utmMedium,
        utmCampaign: booking.utmCampaign,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        items: booking.items.map((i) => ({
          id: i.id,
          type: i.type,
          description: i.description,
          destinationName: i.destination?.name ?? null,
          nights: i.nights,
          tier: i.tier,
          price: i.actualPrice ?? i.estimateMin ?? null,
        })),
        latestQuote: booking.quotes[0]
          ? {
              totalPrice: booking.quotes[0].totalPrice,
              deposit: booking.quotes[0].deposit,
              validUntil: booking.quotes[0].validUntil.toISOString(),
              response: booking.quotes[0].response,
              version: booking.quotes[0].version,
            }
          : null,
        payments: booking.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          method: p.method,
          status: p.status,
          gatewayRef: p.gatewayRef,
          paidAt: p.paidAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
        })),
        tripSessions: booking.tripSessions.map((s) => ({
          id: s.id,
          tripType: s.tripType,
          status: s.status,
        })),
      }}
    />
  );
}
