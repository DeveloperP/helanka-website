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

export async function getRevenueReport(): Promise<{
  monthly: RevenueDataPoint[];
  byDestination: { name: string; revenue: number }[];
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
} | null> {
  await requireAdmin();
  if (!db) return null;

  const payments = await db.payment.findMany({
    where: { status: "SUCCESS" },
    select: {
      amount: true,
      paidAt: true,
      booking: {
        select: {
          items: {
            select: { destination: { select: { name: true } } },
            where: { destinationId: { not: null } },
            take: 1,
          },
        },
      },
    },
  });

  const monthMap = new Map<string, { revenue: number; count: number }>();
  const destMap = new Map<string, number>();
  let total = 0;

  for (const p of payments) {
    const amount = p.amount;
    total += amount;

    if (p.paidAt) {
      const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
      const existing = monthMap.get(key) ?? { revenue: 0, count: 0 };
      existing.revenue += amount;
      existing.count += 1;
      monthMap.set(key, existing);
    }

    const destName = p.booking?.items[0]?.destination?.name ?? "Unknown";
    destMap.set(destName, (destMap.get(destName) ?? 0) + amount);
  }

  const bookingCount = await db.booking.count();

  return {
    monthly: Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, revenue: data.revenue, count: data.count })),
    byDestination: Array.from(destMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, revenue]) => ({ name, revenue })),
    totalRevenue: total,
    totalBookings: bookingCount,
    avgBookingValue: bookingCount > 0 ? Math.round(total / bookingCount) : 0,
  };
}

export async function getConversionFunnel(): Promise<FunnelStage[]> {
  await requireAdmin();
  if (!db) return [];

  const [totalSessions, quoteRequested, confirmed, completed] = await Promise.all([
    db.tripSession.count(),
    db.booking.count({
      where: {
        status: {
          in: [
            "QUOTE_REQUESTED",
            "PRICING_IN_PROGRESS",
            "QUOTE_SENT",
            "REVISION_REQUESTED",
            "CONFIRMED",
            "BALANCE_DUE",
            "COMPLETED",
          ],
        },
      },
    }),
    db.booking.count({ where: { status: { in: ["CONFIRMED", "BALANCE_DUE", "COMPLETED"] } } }),
    db.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  return [
    { stage: "Sessions Created", count: totalSessions },
    { stage: "Quote Requested", count: quoteRequested },
    { stage: "Confirmed", count: confirmed },
    { stage: "Completed", count: completed },
  ];
}

export async function getUtmAttribution(): Promise<UtmRow[]> {
  await requireAdmin();
  if (!db) return [];

  const bookings = await db.booking.findMany({
    where: { utmSource: { not: null } },
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
