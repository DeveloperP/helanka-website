import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { CustomerListClient } from "./customer-list-client";

export default async function AdminCustomersPage() {
  const session = await requireAdminOrSpecialist();
  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const customers = await db.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        createdAt: true,
        lastLogin: true,
        customerTripSessions: {
          select: {
            id: true,
            tripType: true,
            status: true,
            lastActivityAt: true,
            state: true,
          },
          orderBy: { lastActivityAt: "desc" },
        },
        bookings: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return (
      <CustomerListClient
        role="ADMIN"
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          country: c.country,
          createdAt: c.createdAt.toISOString(),
          lastLogin: c.lastLogin?.toISOString() ?? null,
          sessions: c.customerTripSessions.map((s) => ({
            id: s.id,
            tripType: s.tripType,
            status: s.status,
            lastActivityAt: s.lastActivityAt.toISOString(),
            destinations: extractDestinations(s.state),
          })),
          bookingCount: c.bookings.length,
        }))}
      />
    );
  }

  // Specialist: only see customers assigned to them, name only
  const sessions = await db.tripSession.findMany({
    where: { specialistId: session.user.id },
    select: {
      id: true,
      tripType: true,
      status: true,
      lastActivityAt: true,
      state: true,
      customer: { select: { id: true, name: true } },
    },
    orderBy: { lastActivityAt: "desc" },
  });

  const customerMap = new Map<string, {
    id: string;
    name: string | null;
    sessions: { id: string; tripType: string; status: string; lastActivityAt: string; destinations: string[] }[];
  }>();

  for (const s of sessions) {
    if (!s.customer) continue;
    const existing = customerMap.get(s.customer.id);
    const sessionData = {
      id: s.id,
      tripType: s.tripType,
      status: s.status,
      lastActivityAt: s.lastActivityAt.toISOString(),
      destinations: extractDestinations(s.state),
    };
    if (existing) {
      existing.sessions.push(sessionData);
    } else {
      customerMap.set(s.customer.id, {
        id: s.customer.id,
        name: s.customer.name,
        sessions: [sessionData],
      });
    }
  }

  return (
    <CustomerListClient
      role="SPECIALIST"
      customers={Array.from(customerMap.values()).map((c) => ({
        id: c.id,
        name: c.name,
        email: null,
        phone: null,
        country: null,
        createdAt: null,
        lastLogin: null,
        sessions: c.sessions,
        bookingCount: null,
      }))}
    />
  );
}

function extractDestinations(state: unknown): string[] {
  if (!state || typeof state !== "object") return [];
  const s = state as Record<string, unknown>;
  if (Array.isArray(s.destinations)) {
    return s.destinations.filter((d): d is string => typeof d === "string");
  }
  if (typeof s.packageSlug === "string") return [s.packageSlug];
  return [];
}
