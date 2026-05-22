"use server";

import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export interface DashboardStats {
  activeSessions: number;
  idleSessions: number;
  quoteRequests: number;
  closedSessions: number;
  totalRevenue: number | null;
  totalBookings: number | null;
  bookingsByStatus: Record<string, number> | null;
}

export interface ActivityItem {
  id: string;
  sessionId: string;
  senderRole: string;
  senderName: string | null;
  content: string;
  messageType: string;
  createdAt: string;
  customerName: string | null;
  tripType: string;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const session = await requireAdminOrSpecialist();
  if (!db) return null;

  const isSpecialist = session.user.role === "SPECIALIST";
  const sessionFilter = isSpecialist ? { specialistId: session.user.id } : {};

  const [active, idle, quoteReq, closed] = await Promise.all([
    db.tripSession.count({ where: { ...sessionFilter, status: "ACTIVE" } }),
    db.tripSession.count({ where: { ...sessionFilter, status: "IDLE" } }),
    db.tripSession.count({ where: { ...sessionFilter, status: "QUOTE_REQUESTED" } }),
    db.tripSession.count({ where: { ...sessionFilter, status: "CLOSED" } }),
  ]);

  let totalRevenue: number | null = null;
  let totalBookings: number | null = null;
  let bookingsByStatus: Record<string, number> | null = null;

  if (!isSpecialist) {
    const [revenueResult, bookingCount, bookings] = await Promise.all([
      db.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      db.booking.count(),
      db.booking.groupBy({ by: ["status"], _count: true }),
    ]);
    totalRevenue = revenueResult._sum.amount ?? 0;
    totalBookings = bookingCount;
    bookingsByStatus = Object.fromEntries(bookings.map((b) => [b.status, b._count]));
  }

  return {
    activeSessions: active,
    idleSessions: idle,
    quoteRequests: quoteReq,
    closedSessions: closed,
    totalRevenue,
    totalBookings,
    bookingsByStatus,
  };
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const session = await requireAdminOrSpecialist();
  if (!db) return [];

  const isSpecialist = session.user.role === "SPECIALIST";

  const messages = await db.chatMessage.findMany({
    where: isSpecialist
      ? { session: { specialistId: session.user.id } }
      : {},
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      sender: { select: { name: true } },
      session: {
        select: {
          tripType: true,
          customer: { select: { name: true } },
        },
      },
    },
  });

  return messages.map((m) => ({
    id: m.id,
    sessionId: m.sessionId,
    senderRole: m.senderRole,
    senderName: m.sender.name,
    content: m.content.length > 120 ? m.content.slice(0, 120) + "..." : m.content,
    messageType: m.messageType,
    createdAt: m.createdAt.toISOString(),
    customerName: m.session.customer?.name ?? null,
    tripType: m.session.tripType,
  }));
}
