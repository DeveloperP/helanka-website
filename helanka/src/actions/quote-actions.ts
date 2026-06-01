"use server";

import { requireAdmin, requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createBookingFromSession } from "@/lib/session-to-booking";
import { calculateTransportDistance, calculateTransportCost, determineSeason } from "@/lib/pricing-engine";
import { sendQuoteSchema, quoteResponseSchema } from "@/lib/validations";
import type { SendQuoteInput, QuoteResponseInput } from "@/lib/validations";
import { getHotelsGroupedByDestination, getTransportRateCards, getDailyBufferRate, getAllExcursionsGrouped } from "@/actions/hotel-actions";
import type { HotelOption, ExcursionOption } from "@/actions/hotel-actions";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AccommodationDetailData {
  hotelId: string | null;
  hotelName: string;
  starRating: string | null;
  roomType: string | null;
  mealPlan: string | null;
  sglRooms: number; sglRate: number;
  dblRooms: number; dblRate: number;
  twnRooms: number; twnRate: number;
  tplRooms: number; tplRate: number;
  extraAdultQty: number; extraAdultRate: number;
  childSharingQty: number; childSharingRate: number;
  childWithBedQty: number; childWithBedRate: number;
  marginType: string;
  marginValue: number;
  rateCode: string | null;
  remarks: string | null;
}

export interface TransportDetailData {
  vehicleType: string;
  ratePerKm: number;
  vehicleUnits: number;
  distanceKm: number;
  isGroupTransfer: boolean;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  overridePrice: boolean;
  driverGuideType: string | null;
  driverRatePerDay: number;
  driverAccommodation: boolean;
  driverFee: number;
  remarks: string | null;
}

export interface ExcursionDetailData {
  excursionName: string;
  sequence: number;
  costPerPerson: number;
  adultCount: number;
  childRate: number;
  childCount: number;
  overridePrice: boolean;
  remarks: string | null;
}

export interface OtherChargeDetailData {
  costItem: string;
  description: string | null;
  costPerUnit: number;
  units: number;
  overridePrice: boolean;
  remarks: string | null;
}

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
  accommodationDetail: AccommodationDetailData | null;
  transportDetail: TransportDetailData | null;
  excursionDetail: ExcursionDetailData | null;
  otherChargeDetail: OtherChargeDetailData | null;
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
  hotelsByDestination: Record<string, HotelOption[]>;
  excursionsByDestination: Record<string, ExcursionOption[]>;
  transportRateCards: { tier: string; perKmRate: number; label: string }[];
  dailyBufferRate: number;
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
        include: {
          destination: { select: { name: true } },
          accommodationDetail: true,
          transportDetail: true,
          excursionDetail: true,
          otherChargeDetail: true,
        },
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
      accommodationDetail: item.accommodationDetail ?? null,
      transportDetail: item.transportDetail ? {
        ...item.transportDetail,
        overridePrice: item.transportDetail.overridePrice,
      } : null,
      excursionDetail: item.excursionDetail ?? null,
      otherChargeDetail: item.otherChargeDetail ?? null,
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

  // Fetch hotels grouped by destination for accommodation dropdowns
  const accomDestIds = booking.items
    .filter((i) => i.type === "ACCOMMODATION" && i.destinationId)
    .map((i) => i.destinationId!);
  const hotelsByDestination = accomDestIds.length > 0
    ? await getHotelsGroupedByDestination(accomDestIds)
    : {};

  // Fetch excursions, transport rate cards and daily buffer
  const excursionsByDestination = await getAllExcursionsGrouped();
  const transportRateCards = await getTransportRateCards();
  const dailyBufferRate = await getDailyBufferRate();

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
    hotelsByDestination,
    excursionsByDestination,
    transportRateCards,
    dailyBufferRate,
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
  lineItems: Array<{
    bookingItemId: string;
    estimateMin: number;
    estimateMax: number;
    actualPrice?: number;
    notes?: string;
    accommodationDetail?: AccommodationDetailData;
    transportDetail?: TransportDetailData;
    excursionDetail?: ExcursionDetailData;
    otherChargeDetail?: OtherChargeDetailData;
  }>,
): Promise<{ success: boolean; error?: string }> {
  await requireAdminOrSpecialist();
  if (!db) return { success: false, error: "Database not available" };

  try {
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
      await upsertItemDetails(item.bookingItemId, item);
    }

    await db.booking.update({
      where: { id: bookingId },
      data: { status: "PRICING_IN_PROGRESS" },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save pricing" };
  }
}

// ─── Admin: Add booking item ────────────────────────────────────────────────

export async function addBookingItem(
  bookingId: string,
  type: "ACCOMMODATION" | "ACTIVITY" | "TRANSPORT" | "ADDON",
  destinationId: string | null,
  description: string,
  nights?: number,
): Promise<{ id: string } | { error: string }> {
  await requireAdminOrSpecialist();
  if (!db) return { error: "Database not available" };

  const maxSort = await db.bookingItem.aggregate({
    where: { bookingId },
    _max: { sortOrder: true },
  });

  const item = await db.bookingItem.create({
    data: {
      bookingId,
      type,
      destinationId,
      description,
      nights: nights ?? null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  return { id: item.id };
}

export async function removeBookingItem(
  bookingItemId: string,
): Promise<{ success: true } | { error: string }> {
  await requireAdminOrSpecialist();
  if (!db) return { error: "Database not available" };

  await db.bookingItem.delete({ where: { id: bookingItemId } });
  return { success: true };
}

// ─── Helper: upsert detail records ──────────────────────────────────────────

async function upsertItemDetails(
  bookingItemId: string,
  item: {
    accommodationDetail?: Partial<AccommodationDetailData> & { hotelName: string };
    transportDetail?: Partial<TransportDetailData> & { vehicleType: string };
    excursionDetail?: Partial<ExcursionDetailData> & { excursionName: string };
    otherChargeDetail?: Partial<OtherChargeDetailData> & { costItem: string };
  },
) {
  if (!db) return;

  if (item.accommodationDetail) {
    const d = item.accommodationDetail;
    await db.accommodationDetail.upsert({
      where: { bookingItemId },
      create: { bookingItemId, ...d },
      update: d,
    });
  }
  if (item.transportDetail) {
    const d = item.transportDetail;
    await db.transportDetail.upsert({
      where: { bookingItemId },
      create: { bookingItemId, ...d },
      update: d,
    });
  }
  if (item.excursionDetail) {
    const d = item.excursionDetail;
    await db.excursionDetail.upsert({
      where: { bookingItemId },
      create: { bookingItemId, ...d },
      update: d,
    });
  }
  if (item.otherChargeDetail) {
    const d = item.otherChargeDetail;
    await db.otherChargeDetail.upsert({
      where: { bookingItemId },
      create: { bookingItemId, ...d },
      update: d,
    });
  }
}

// ─── Admin: Send quote ──────────────────────────────────────────────────────

export async function sendQuote(input: SendQuoteInput): Promise<{ success: boolean; quoteId?: string; error?: string }> {
  await requireAdminOrSpecialist();
  if (!db) return { success: false, error: "Database not available" };

  const parsed = sendQuoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues.map((e) => e.message).join(", ") };

  const { bookingId, totalPrice, deposit, validUntil, adminNotes, lineItems } = parsed.data;
  const taxRate = (input as Record<string, unknown>).taxRate as number | undefined;
  const taxInclusive = (input as Record<string, unknown>).taxInclusive as boolean | undefined;
  const handlingFeeType = (input as Record<string, unknown>).handlingFeeType as string | undefined;
  const handlingFeeAmt = (input as Record<string, unknown>).handlingFeeAmt as number | undefined;
  const discountAmt = (input as Record<string, unknown>).discountAmt as number | undefined;

  try {
    // Update line item prices and detail records
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
      await upsertItemDetails(item.bookingItemId, item);
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
        taxRate: taxRate ?? 0,
        taxInclusive: taxInclusive ?? true,
        handlingFeeType: handlingFeeType ?? null,
        handlingFeeAmt: handlingFeeAmt ?? 0,
        discountAmt: discountAmt ?? 0,
      },
    });

    await db.booking.update({
      where: { id: bookingId },
      data: { status: "QUOTE_SENT" },
    });

    return { success: true, quoteId: quote.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to send quote" };
  }
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

  try {
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
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to respond to quote" };
  }
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
  gatewayRef?: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not available" };

  try {
    await db.payment.create({
      data: {
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency ?? "USD",
        method: data.method,
        gatewayRef: data.gatewayRef ?? null,
        status: "SUCCESS",
        paidAt: new Date(),
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to record payment" };
  }
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
