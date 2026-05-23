"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface UtmRow {
  source: string;
  bookings: number;
  revenue: number;
}

export interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  paidAt: string | null;
  customerName: string | null;
  customerEmail: string;
  bookingStatus: string;
}

export interface RevenueData {
  monthly: RevenueDataPoint[];
  byDestination: { name: string; revenue: number }[];
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
  pendingRevenue: number;
  completedRevenue: number;
  depositsPaid: number;
  outstandingBalance: number;
  bookingsByStatus: Record<string, number>;
  recentPayments: PaymentRow[];
  customerCount: number;
  avgTravelersPerBooking: number;
  topDestinations: { name: string; bookings: number; revenue: number }[];
}

export async function getRevenueReport(
  from?: string,
  to?: string
): Promise<RevenueData | null> {
  await requireAdmin();
  if (!db) return null;

  const dateFilter: { paidAt?: { gte?: Date; lte?: Date } } = {};
  const bookingDateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};

  if (from || to) {
    dateFilter.paidAt = {};
    bookingDateFilter.createdAt = {};
    if (from) {
      dateFilter.paidAt.gte = new Date(from);
      bookingDateFilter.createdAt.gte = new Date(from);
    }
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.paidAt.lte = endDate;
      bookingDateFilter.createdAt.lte = endDate;
    }
  }

  const [payments, allBookings, customerCount] = await Promise.all([
    db.payment.findMany({
      where: { status: "SUCCESS", ...dateFilter },
      select: {
        id: true,
        amount: true,
        currency: true,
        method: true,
        status: true,
        paidAt: true,
        booking: {
          select: {
            status: true,
            numTravelers: true,
            user: { select: { name: true, email: true } },
            items: {
              select: { destination: { select: { name: true } } },
              where: { destinationId: { not: null } },
            },
          },
        },
      },
      orderBy: { paidAt: "desc" },
    }),
    db.booking.findMany({
      where: bookingDateFilter,
      select: {
        status: true,
        numTravelers: true,
        payments: { where: { status: "SUCCESS" }, select: { amount: true } },
        items: {
          where: { destinationId: { not: null } },
          select: { destination: { select: { name: true } } },
        },
      },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const monthMap = new Map<string, { revenue: number; count: number }>();
  const destRevenueMap = new Map<string, number>();
  let totalRevenue = 0;

  for (const p of payments) {
    totalRevenue += p.amount;

    if (p.paidAt) {
      const key = p.paidAt.toLocaleString("en-US", { month: "short", year: "numeric" });
      const existing = monthMap.get(key) ?? { revenue: 0, count: 0 };
      existing.revenue += p.amount;
      existing.count += 1;
      monthMap.set(key, existing);
    }

    for (const item of p.booking?.items ?? []) {
      const name = item.destination?.name ?? "Unknown";
      destRevenueMap.set(name, (destRevenueMap.get(name) ?? 0) + p.amount);
    }
  }

  // Booking stats
  const bookingsByStatus: Record<string, number> = {};
  let completedRevenue = 0;
  let pendingRevenue = 0;
  let totalTravelers = 0;
  const destBookingMap = new Map<string, number>();

  for (const b of allBookings) {
    bookingsByStatus[b.status] = (bookingsByStatus[b.status] ?? 0) + 1;
    totalTravelers += b.numTravelers;
    const bRevenue = b.payments.reduce((s, p) => s + p.amount, 0);
    if (b.status === "COMPLETED") completedRevenue += bRevenue;
    if (["CONFIRMED", "BALANCE_DUE"].includes(b.status)) pendingRevenue += bRevenue;

    for (const item of b.items) {
      const name = item.destination?.name ?? "Unknown";
      destBookingMap.set(name, (destBookingMap.get(name) ?? 0) + 1);
    }
  }

  // Pending payments (deposits paid but balance outstanding)
  const confirmedBookings = await db.booking.findMany({
    where: { status: { in: ["CONFIRMED", "BALANCE_DUE"] }, ...bookingDateFilter },
    select: {
      payments: { where: { status: "SUCCESS" }, select: { amount: true } },
      quotes: { orderBy: { version: "desc" }, take: 1, select: { totalPrice: true } },
    },
  });

  let depositsPaid = 0;
  let outstandingBalance = 0;
  for (const b of confirmedBookings) {
    const paid = b.payments.reduce((s, p) => s + p.amount, 0);
    const quoted = b.quotes[0]?.totalPrice ?? 0;
    depositsPaid += paid;
    outstandingBalance += Math.max(0, quoted - paid);
  }

  // Top destinations with both bookings and revenue
  const allDestNames = new Set([...destRevenueMap.keys(), ...destBookingMap.keys()]);
  const topDestinations = Array.from(allDestNames)
    .map((name) => ({
      name,
      bookings: destBookingMap.get(name) ?? 0,
      revenue: destRevenueMap.get(name) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // Recent payments
  const recentPayments: PaymentRow[] = payments.slice(0, 10).map((p) => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt?.toISOString() ?? null,
    customerName: p.booking?.user?.name ?? null,
    customerEmail: p.booking?.user?.email ?? "",
    bookingStatus: p.booking?.status ?? "",
  }));

  return {
    monthly: Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, revenue: data.revenue, count: data.count })),
    byDestination: Array.from(destRevenueMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, revenue]) => ({ name, revenue })),
    totalRevenue,
    totalBookings: allBookings.length,
    avgBookingValue: allBookings.length > 0 ? Math.round(totalRevenue / allBookings.length) : 0,
    pendingRevenue,
    completedRevenue,
    depositsPaid,
    outstandingBalance,
    bookingsByStatus,
    recentPayments,
    customerCount,
    avgTravelersPerBooking: allBookings.length > 0 ? Math.round(totalTravelers / allBookings.length) : 0,
    topDestinations,
  };
}

export async function getConversionFunnel(from?: string, to?: string): Promise<FunnelStage[]> {
  await requireAdmin();
  if (!db) return [];

  const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.createdAt.lte = endDate;
    }
  }

  const [totalSessions, quoteRequested, confirmed, completed] = await Promise.all([
    db.tripSession.count({ where: dateFilter }),
    db.booking.count({
      where: {
        ...dateFilter,
        status: {
          in: [
            "QUOTE_REQUESTED", "PRICING_IN_PROGRESS", "QUOTE_SENT",
            "REVISION_REQUESTED", "CONFIRMED", "BALANCE_DUE", "COMPLETED",
          ],
        },
      },
    }),
    db.booking.count({ where: { ...dateFilter, status: { in: ["CONFIRMED", "BALANCE_DUE", "COMPLETED"] } } }),
    db.booking.count({ where: { ...dateFilter, status: "COMPLETED" } }),
  ]);

  return [
    { stage: "Sessions Created", count: totalSessions },
    { stage: "Quote Requested", count: quoteRequested },
    { stage: "Confirmed", count: confirmed },
    { stage: "Completed", count: completed },
  ];
}

export async function getUtmAttribution(from?: string, to?: string): Promise<UtmRow[]> {
  await requireAdmin();
  if (!db) return [];

  const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.createdAt.lte = endDate;
    }
  }

  const bookings = await db.booking.findMany({
    where: { utmSource: { not: null }, ...dateFilter },
    select: {
      utmSource: true,
      payments: { where: { status: "SUCCESS" }, select: { amount: true } },
    },
  });

  const sourceMap = new Map<string, { bookings: number; revenue: number }>();
  for (const b of bookings) {
    const source = b.utmSource ?? "unknown";
    const existing = sourceMap.get(source) ?? { bookings: 0, revenue: 0 };
    existing.bookings += 1;
    existing.revenue += b.payments.reduce((s, p) => s + p.amount, 0);
    sourceMap.set(source, existing);
  }

  return Array.from(sourceMap.entries())
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .map(([source, data]) => ({ source, ...data }));
}
