import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CustomerDetailClient } from "./customer-detail-client";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const session = await requireAdminOrSpecialist();
  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin) {
    const assignedCount = await db.tripSession.count({
      where: { customerId, specialistId: session.user.id },
    });
    if (assignedCount === 0) redirect("/admin/customers");
  }

  if (isAdmin) {
    const customer = await db.user.findUnique({
      where: { id: customerId },
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
            state: true,
            lastActivityAt: true,
            createdAt: true,
            specialist: { select: { name: true } },
          },
          orderBy: { lastActivityAt: "desc" },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            arrivalDate: true,
            departureDate: true,
            numTravelers: true,
            createdAt: true,
            items: {
              select: { destination: { select: { name: true } } },
              where: { destinationId: { not: null } },
              take: 1,
            },
            payments: { select: { amount: true, status: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) redirect("/admin/customers");

    return (
      <CustomerDetailClient
        role="ADMIN"
        customer={{
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          country: customer.country,
          createdAt: customer.createdAt.toISOString(),
          lastLogin: customer.lastLogin?.toISOString() ?? null,
          sessions: customer.customerTripSessions.map((s) => ({
            id: s.id,
            tripType: s.tripType,
            status: s.status,
            state: s.state as Record<string, unknown>,
            lastActivityAt: s.lastActivityAt.toISOString(),
            createdAt: s.createdAt.toISOString(),
            specialistName: s.specialist?.name ?? null,
          })),
          bookings: customer.bookings.map((b) => ({
            id: b.id,
            status: b.status,
            arrivalDate: b.arrivalDate?.toISOString() ?? null,
            departureDate: b.departureDate?.toISOString() ?? null,
            numTravelers: b.numTravelers,
            createdAt: b.createdAt.toISOString(),
            destinationName: b.items[0]?.destination?.name ?? null,
            totalPaid: b.payments
              .filter((p) => p.status === "SUCCESS")
              .reduce((sum, p) => sum + p.amount, 0),
          })),
        }}
      />
    );
  }

  // Specialist view — name + assigned sessions only
  const customer = await db.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      customerTripSessions: {
        where: { specialistId: session.user.id },
        select: {
          id: true,
          tripType: true,
          status: true,
          state: true,
          lastActivityAt: true,
          createdAt: true,
          specialist: { select: { name: true } },
        },
        orderBy: { lastActivityAt: "desc" },
      },
    },
  });

  if (!customer) redirect("/admin/customers");

  return (
    <CustomerDetailClient
      role="SPECIALIST"
      customer={{
        id: customer.id,
        name: customer.name,
        email: null,
        phone: null,
        country: null,
        createdAt: null,
        lastLogin: null,
        sessions: customer.customerTripSessions.map((s) => ({
          id: s.id,
          tripType: s.tripType,
          status: s.status,
          state: s.state as Record<string, unknown>,
          lastActivityAt: s.lastActivityAt.toISOString(),
          createdAt: s.createdAt.toISOString(),
          specialistName: s.specialist?.name ?? null,
        })),
        bookings: null,
      }}
    />
  );
}
