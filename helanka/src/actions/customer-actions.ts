"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCustomerInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  arrivalDate: string;
  departureDate: string;
  numTravelers: number;
  tripType: string;
  destinations?: string[];
  specialRequests?: string;
}) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SPECIALIST")) {
    return { success: false, error: "Unauthorized" };
  }

  if (!data.name || !data.email || !data.arrivalDate || !data.departureDate || !data.tripType) {
    return { success: false, error: "Missing required fields" };
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });

  if (existing && existing.passwordHash !== null) {
    return { success: false, error: "A customer with this email already has an account. Use their existing record instead." };
  }

  let userId: string;

  if (existing) {
    userId = existing.id;
    if (data.name && !existing.name) {
      await db.user.update({ where: { id: existing.id }, data: { name: data.name } });
    }
    if (data.phone && !existing.phone) {
      await db.user.update({ where: { id: existing.id }, data: { phone: data.phone } });
    }
    if (data.country && !existing.country) {
      await db.user.update({ where: { id: existing.id }, data: { country: data.country } });
    }
  } else {
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        country: data.country || null,
        role: "CUSTOMER",
      },
    });
    userId = user.id;
  }

  const state = {
    tripType: data.tripType,
    guests: data.numTravelers,
    arrivalDate: data.arrivalDate,
    departureDate: data.departureDate,
    destinations: data.destinations || [],
    specialRequests: data.specialRequests || "",
  };

  const tripSession = await db.tripSession.create({
    data: {
      customerId: userId,
      specialistId: session.user.id,
      tripType: data.tripType,
      state: JSON.parse(JSON.stringify(state)),
      activeTab: "overview",
      status: "ACTIVE",
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath("/admin/sessions");

  return { success: true, sessionId: tripSession.id };
}
