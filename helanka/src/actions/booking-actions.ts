"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import type { BookingStatus } from "@prisma/client";

export interface BookingListItem {
  id: string;
  status: string;
  customerName: string | null;
  customerEmail: string;
  destinationName: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  numTravelers: number;
  quoteTotal: number | null;
  totalPaid: number;
  createdAt: string;
  updatedAt: string;
}

export async function getBookings(): Promise<BookingListItem[]> {
  await requireAdmin();
  if (!db) return [];

  const bookings = await db.booking.findMany({
    select: {
      id: true,
      status: true,
      arrivalDate: true,
      departureDate: true,
      numTravelers: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true } },
      items: {
        select: { destination: { select: { name: true } } },
        where: { destinationId: { not: null } },
        take: 1,
      },
      quotes: {
        select: { totalPrice: true },
        orderBy: { version: "desc" },
        take: 1,
      },
      payments: { select: { amount: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return bookings.map((b) => ({
    id: b.id,
    status: b.status,
    customerName: b.user.name,
    customerEmail: b.user.email,
    destinationName: b.items[0]?.destination?.name ?? null,
    arrivalDate: b.arrivalDate?.toISOString() ?? null,
    departureDate: b.departureDate?.toISOString() ?? null,
    numTravelers: b.numTravelers,
    quoteTotal: b.quotes[0]?.totalPrice ?? null,
    totalPaid: b.payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["QUOTE_REQUESTED", "CANCELLED"],
  QUOTE_REQUESTED: ["PRICING_IN_PROGRESS", "CANCELLED"],
  PRICING_IN_PROGRESS: ["QUOTE_SENT", "CANCELLED"],
  QUOTE_SENT: ["CONFIRMED", "REVISION_REQUESTED", "EXPIRED"],
  REVISION_REQUESTED: ["PRICING_IN_PROGRESS", "CANCELLED"],
  CONFIRMED: ["BALANCE_DUE", "CANCELLED"],
  BALANCE_DUE: ["COMPLETED", "CANCELLED"],
};

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  if (!db) return { success: false, error: "Database not connected." };

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });

  if (!booking) return { success: false, error: "Booking not found." };

  const allowed = VALID_TRANSITIONS[booking.status];
  if (!allowed?.includes(newStatus)) {
    return { success: false, error: `Cannot transition from ${booking.status} to ${newStatus}.` };
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { status: newStatus as BookingStatus },
  });

  return { success: true };
}
