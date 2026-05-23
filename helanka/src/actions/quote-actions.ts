"use server";

import { requireAdmin, requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createBookingFromSession } from "@/lib/session-to-booking";
import { calculateTransportDistance, calculateTransportCost, determineSeason } from "@/lib/pricing-engine";
import { sendQuoteSchema, quoteResponseSchema } from "@/lib/validations";
import type { SendQuoteInput, QuoteResponseInput } from "@/lib/validations";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QuotingItemData {
  id: string;
  type: string;
  description: string;
  destinationId: string | null;
  destinationName: string | null;
  tier: string | null;
  nights: number | null;
  estimateMin: number | null;
  estimateMax: number | null;
  actualPrice: number | null;
  notes: string | null;
  sortOrder: number;
  rateCardMin: number | null;
  rateCardMax: number | null;
  rateCardSeason: string | null;
}

export interface TransportBreakdown {
  routeKm: number;
  excursionKm: number;
  bufferKm: number;
  totalKm: number;
  perKmRate: number;
  kmCost: number;
  dailyRate: number;
  dailyCost: number;
  totalTransportCost: number;
  tripDays: number;
}

export interface QuotingSessionData {
  session: {
    id: string;
    tripType: string;
    status: string;
    state: Record<string, unknown>;
    customer: { id: string; name: string | null; email: string | null };
  };
  booking: {
    id: string;
    status: string;
    arrivalDate: string | null;
    departureDate: string | null;
    numTravelers: number;
  };
  items: QuotingItemData[];
  transportBreakdown: TransportBreakdown | null;
  existingQuotes: Array<{
    id: string;
    version: number;
    totalPrice: number;
    deposit: number;
    validUntil: string;
    response: string | null;
    sentAt: string | null;
    createdAt: string;
  }>;
}

export interface CustomerQuoteData {
  bookingId: string;
  customerName: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  numTravelers: number;
  items: Array<{
    type: string;
    description: string;
    destinationName: string | null;
    price: number | null;
  }>;
  quote: {
    id: string;
    version: number;
    totalPrice: number;
    deposit: number;
    validUntil: string;
    adminNotes: string | null;
    response: string | null;
  };
}

export interface CustomerBookingListItem {
  id: string;
  status: string;
  arrivalDate: string | null;
  departureDate: string | null;
  numTravelers: number;
  latestQuoteTotal: number | null;
  latestQuoteStatus: string | null;
  totalPaid: number;
  createdAt: string;
}

// ─── Admin: Get session for quoting ─────────────────────────────────────────

export async function getSessionForQuoting(sessionId: string): Promise<QuotingSessionData | null> {
  await requireAdminOrSpecialist();
  if (!db) return null;

  const tripSession = await db.tripSession.findUnique({
    where: { id: sessionId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!tripSession) return null;

  // Create booking if not linked yet
  let bookingId = tripSession.bookingId;
  if (!bookingId) {
    bookingId = await createBookingFromSession(sessionId);
    if (!bookingId) return null;
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      items: {
        include: { destination: { select: { name: true } } },
        orderBy: { sortOrder: "asc" },
      },
      quotes: {
        orderBy: { version: "desc" },
      },
    },
  });

  if (!booking) return null;

  // Look up rate cards for each item
  const state = tripSession.state as Record<string, unknown>;
  const travelDate = booking.arrivalDate ?? new Date();
  const season = determineSeason(travelDate);

  const rateCards = await db.rateCard.findMany({
    where: { OR: [{ season }, { season: "all" }] },
  });

  const items: QuotingItemData[] = booking.items.map((item) => {
    const match =
      rateCards.find(
        (c) => c.itemType === item.type && c.tier === item.tier && c.destinationId === item.destinationId && c.destinationId !== null,
      ) ??
      rateCards.find(
        (c) => c.itemType === item.type && c.tier === item.tier && c.destinationId === null,
      );

    return {
      id: item.id,
      type: item.type,
      description: item.description,
      destinationId: item.destinationId,
      destinationName: item.destination?.name ?? null,
      tier: item.tier,
      nights: item.nights,
      estimateMin: item.estimateMin,
      estimateMax: item.estimateMax,
      actualPrice: item.actualPrice,
      notes: item.notes,
      sortOrder: item.sortOrder,
      rateCardMin: match?.minPrice ?? null,
      rateCardMax: match?.maxPrice ?? null,
      rateCardSeason: match?.season ?? null,
    };
  });

  // Calculate transport distance breakdown
  let transportBreakdown: TransportBreakdown | null = null;
  const transportItem = booking.items.find((i) => i.type === "TRANSPORT");
  if (transportItem) {
    const destinationIds = booking.items
      .filter((i) => i.type === "ACCOMMODATION" && i.destinationId)
      .map((i) => i.destinationId!);

    const excursionSlugs = (state.excursionIds as string[]) ?? [];
    // Resolve excursion IDs (they might be slugs from the session state)
    let excursionDbIds: string[] = [];
    if (excursionSlugs.length > 0) {
      const excursions = await db.excursion.findMany({
        where: { OR: [{ id: { in: excursionSlugs } }, { slug: { in: excursionSlugs } }] },
        select: { id: true },
      });
      excursionDbIds = excursions.map((e) => e.id);
    }

    const tripDays = booking.arrivalDate && booking.departureDate
      ? Math.max(1, Math.round((booking.departureDate.getTime() - booking.arrivalDate.getTime()) / 86400000))
      : 1;

    const distResult = await calculateTransportDistance({
      destinationIds,
      excursionIds: excursionDbIds,
      tripDays,
    });

    const tier = transportItem.tier ?? "standard";
    const costResult = await calculateTransportCost(distResult.totalKm, tier, season, tripDays);

    transportBreakdown = {
      ...distResult,
      ...costResult,
      tripDays,
    };
  }

  return {
    session: {
      id: tripSession.id,
      tripType: tripSession.tripType,
      status: tripSession.status,
      state: tripSession.state as Record<string, unknown>,
      customer: tripSession.customer,
    },
    booking: {
      id: booking.id,
      status: booking.status,
      arrivalDate: booking.arrivalDate?.toISOString() ?? null,
      departureDate: booking.departureDate?.toISOString() ?? null,
      numTravelers: booking.numTravelers,
    },
    items,
    transportBreakdown,
    existingQuotes: booking.quotes.map((q) => ({
      id: q.id,
      version: q.version,
      totalPrice: q.totalPrice,
      deposit: q.deposit,
      validUntil: q.validUntil.toISOString(),
      response: q.response,
      sentAt: q.sentAt?.toISOString() ?? null,
      createdAt: q.createdAt.toISOString(),
    })),
  };
}

// ─── Admin: Price booking items (draft) ─────────────────────────────────────

export async function priceBookingItems(
  bookingId: string,
  lineItems: Array<{ bookingItemId: string; estimateMin: number; estimateMax: number; actualPrice?: number; notes?: string }>,
): Promise<{ success: boolean; error?: string }> {
  await requireAdminOrSpecialist();
  if (!db) return { success: false, error: "Database not available" };

  for (const item of lineItems) {
    await db.bookingItem.update({
      where: { id: item.bookingItemId },
      data: {
        estimateMin: item.estimateMin,
        estimateMax: item.estimateMax,
        actualPrice: item.actualPrice ?? null,
        notes: item.notes ?? null,
      },
    });
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "PRICING_IN_PROGRESS" },
  });

  return { success: true };
}

// ─── Admin: Send quote ──────────────────────────────────────────────────────

export async function sendQuote(input: SendQuoteInput): Promise<{ success: boolean; quoteId?: string; error?: string }> {
  await requireAdminOrSpecialist();
  if (!db) return { success: false, error: "Database not available" };

  const parsed = sendQuoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues.map((e) => e.message).join(", ") };

  const { bookingId, totalPrice, deposit, validUntil, adminNotes, lineItems } = parsed.data;

  // Update line item prices
  for (const item of lineItems) {
    await db.bookingItem.update({
      where: { id: item.bookingItemId },
      data: {
        estimateMin: item.estimateMin,
        estimateMax: item.estimateMax,
        actualPrice: item.actualPrice ?? null,
        notes: item.notes ?? null,
      },
    });
  }

  // Get next version number
  const lastQuote = await db.quote.findFirst({
    where: { bookingId },
    orderBy: { version: "desc" },
  });
  const version = (lastQuote?.version ?? 0) + 1;

  const quote = await db.quote.create({
    data: {
      bookingId,
      version,
      totalPrice,
      deposit,
      validUntil: new Date(validUntil),
      adminNotes: adminNotes ?? null,
      sentAt: new Date(),
    },
  });

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "QUOTE_SENT" },
  });

  return { success: true, quoteId: quote.id };
}

// ─── Customer: Respond to quote ─────────────────────────────────────────────

export async function respondToQuote(input: QuoteResponseInput): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };
  if (!db) return { success: false, error: "Database not available" };

  const parsed = quoteResponseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const quote = await db.quote.findUnique({
    where: { id: parsed.data.quoteId },
    include: { booking: { select: { userId: true, id: true } } },
  });

  if (!quote) return { success: false, error: "Quote not found" };
  if (quote.booking.userId !== session.user.id) return { success: false, error: "Unauthorized" };

  await db.quote.update({
    where: { id: quote.id },
    data: { response: parsed.data.response, respondedAt: new Date() },
  });

  const statusMap: Record<string, string> = {
    ACCEPTED: "CONFIRMED",
    REVISION: "REVISION_REQUESTED",
    EXPIRED: "EXPIRED",
  };

  const newStatus = statusMap[parsed.data.response];
  if (newStatus) {
    await db.booking.update({
      where: { id: quote.booking.id },
      data: { status: newStatus as "CONFIRMED" | "REVISION_REQUESTED" | "EXPIRED" },
    });
  }

  return { success: true };
}

// ─── Customer: Get quote for review ─────────────────────────────────────────

export async function getQuoteForCustomer(bookingId: string): Promise<CustomerQuoteData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!db) return null;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true } },
      items: {
        include: { destination: { select: { name: true } } },
        orderBy: { sortOrder: "asc" },
      },
      quotes: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!booking || booking.userId !== session.user.id) return null;
  if (booking.quotes.length === 0) return null;

  const quote = booking.quotes[0];

  return {
    bookingId: booking.id,
    customerName: booking.user.name,
    arrivalDate: booking.arrivalDate?.toISOString() ?? null,
    departureDate: booking.departureDate?.toISOString() ?? null,
    numTravelers: booking.numTravelers,
    items: booking.items.map((item) => ({
      type: item.type,
      description: item.description,
      destinationName: item.destination?.name ?? null,
      price: item.actualPrice,
    })),
    quote: {
      id: quote.id,
      version: quote.version,
      totalPrice: quote.totalPrice,
      deposit: quote.deposit,
      validUntil: quote.validUntil.toISOString(),
      adminNotes: quote.adminNotes,
      response: quote.response,
    },
  };
}

// ─── Admin: Record manual payment ───────────────────────────────────────────

export async function recordPayment(data: {
  bookingId: string;
  amount: number;
  currency?: string;
  method: string;
  webxpayRef?: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  await db.payment.create({
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency ?? "USD",
      method: data.method,
      webxpayRef: data.webxpayRef ?? null,
      status: "SUCCESS",
      paidAt: new Date(),
    },
  });

  return { success: true };
}

// ─── Customer: Get bookings list ────────────────────────────────────────────

export async function getCustomerBookings(): Promise<CustomerBookingListItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (!db) return [];

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      quotes: {
        orderBy: { version: "desc" },
        take: 1,
        select: { totalPrice: true, response: true },
      },
      payments: {
        where: { status: "SUCCESS" },
        select: { amount: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return bookings.map((b) => ({
    id: b.id,
    status: b.status,
    arrivalDate: b.arrivalDate?.toISOString() ?? null,
    departureDate: b.departureDate?.toISOString() ?? null,
    numTravelers: b.numTravelers,
    latestQuoteTotal: b.quotes[0]?.totalPrice ?? null,
    latestQuoteStatus: b.quotes[0]?.response ?? null,
    totalPaid: b.payments.reduce((sum, p) => sum + p.amount, 0),
    createdAt: b.createdAt.toISOString(),
  }));
}
