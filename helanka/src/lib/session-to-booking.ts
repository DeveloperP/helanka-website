import { db } from "@/lib/db";
import type { BookingItemType } from "@prisma/client";

export async function createBookingFromSession(sessionId: string): Promise<string | null> {
  if (!db) return null;

  const session = await db.tripSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      customerId: true,
      bookingId: true,
      tripType: true,
      state: true,
    },
  });

  if (!session) return null;
  if (session.bookingId) return session.bookingId;

  const state = session.state as Record<string, unknown>;

  const arrivalDate = state.arrivalDate ? new Date(state.arrivalDate as string) : null;
  const departureDate = state.departureDate ? new Date(state.departureDate as string) : null;
  const numTravelers = (state.guests as number) ?? 1;
  const accommodationTier = (state.accommodation as string) ?? "3-star";
  const transportTier = (state.transport as string) === "super-luxury" ? "luxury" : "standard";

  const destinationSlugs = (state.destinations as string[]) ?? [];
  const excursionIds = (state.excursionIds as string[]) ?? [];

  // Resolve destination slugs to IDs
  const destinations = destinationSlugs.length > 0
    ? await db.destination.findMany({
        where: { slug: { in: destinationSlugs } },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const destMap = new Map(destinations.map((d) => [d.slug, d]));

  // Resolve excursions
  const excursions = excursionIds.length > 0
    ? await db.excursion.findMany({
        where: { id: { in: excursionIds } },
        select: { id: true, name: true, destinationId: true, type: true },
      })
    : [];

  // Calculate nights per destination (split evenly)
  let totalNights = 0;
  if (arrivalDate && departureDate) {
    totalNights = Math.max(1, Math.round((departureDate.getTime() - arrivalDate.getTime()) / 86400000));
  }
  const nightsPerDest = destinations.length > 0
    ? Math.max(1, Math.floor(totalNights / destinations.length))
    : totalNights;

  // Build booking items
  const items: Array<{
    type: BookingItemType;
    destinationId: string | null;
    description: string;
    tier: string | null;
    nights: number | null;
    sortOrder: number;
  }> = [];

  let sortOrder = 1;

  // Accommodation items per destination
  for (const slug of destinationSlugs) {
    const dest = destMap.get(slug);
    if (!dest) continue;
    items.push({
      type: "ACCOMMODATION",
      destinationId: dest.id,
      description: `Accommodation in ${dest.name} (${accommodationTier})`,
      tier: accommodationTier,
      nights: nightsPerDest,
      sortOrder: sortOrder++,
    });
  }

  // Transport item
  items.push({
    type: "TRANSPORT",
    destinationId: null,
    description: `${transportTier.charAt(0).toUpperCase() + transportTier.slice(1)} vehicle — round trip`,
    tier: transportTier,
    nights: null,
    sortOrder: sortOrder++,
  });

  // Activity items per excursion
  for (const exc of excursions) {
    items.push({
      type: "ACTIVITY",
      destinationId: exc.destinationId,
      description: exc.name,
      tier: exc.type,
      nights: null,
      sortOrder: sortOrder++,
    });
  }

  // Create booking + items in a transaction
  const booking = await db.booking.create({
    data: {
      userId: session.customerId,
      status: "QUOTE_REQUESTED",
      arrivalDate,
      departureDate,
      numTravelers,
      items: {
        create: items,
      },
    },
  });

  // Link booking to session
  await db.tripSession.update({
    where: { id: sessionId },
    data: { bookingId: booking.id },
  });

  return booking.id;
}
