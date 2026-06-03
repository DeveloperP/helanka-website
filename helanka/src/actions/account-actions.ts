"use server";

import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    country: formData.get("country"),
  });
  if (!parsed.success) {
    return { success: false, error: "Invalid input." };
  }

  try {
    const { db } = await import("@/lib/db");
    if (!db) return { success: false, error: "Database unavailable." };

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        country: parsed.data.country || null,
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile." };
  }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  try {
    const { db } = await import("@/lib/db");
    if (!db) return { success: false, error: "Database unavailable." };
    const bcrypt = (await import("bcryptjs")).default;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) {
      return { success: false, error: "Account uses social login — no password to change." };
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to change password." };
  }
}

export async function setPassword(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { setPasswordSchema } = await import("@/lib/validations");
  const parsed = setPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: "Password must be at least 8 characters, with one uppercase letter and one number." };
  }

  try {
    const { db } = await import("@/lib/db");
    if (!db) return { success: false, error: "Database unavailable." };
    const bcrypt = (await import("bcryptjs")).default;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    if (!user) {
      return { success: false, error: "User not found." };
    }
    if (user.passwordHash) {
      return { success: false, error: "You already have a password. Use 'Change Password' instead." };
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to set password." };
  }
}

export async function deleteAccount(formData: FormData): Promise<ActionResult | void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const confirmEmail = formData.get("confirmEmail");
  if (!confirmEmail || confirmEmail !== session.user.email) {
    return { success: false, error: "Email does not match. Please type your email to confirm." };
  }

  try {
    const { db } = await import("@/lib/db");
    if (!db) return { success: false, error: "Database unavailable." };

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!user) return { success: false, error: "User not found." };
    if (user.role === "ADMIN") {
      return { success: false, error: "Admin accounts cannot be self-deleted." };
    }

    await db.user.delete({ where: { id: session.user.id } });
  } catch {
    return { success: false, error: "Failed to delete account." };
  }

  await signOut({ redirectTo: "/login" });
}

interface TripSummary {
  id: string;
  tripType: string;
  status: string;
  createdAt: string;
  specialistName: string | null;
  destinations: string[];
  arrivalDate: string | null;
  departureDate: string | null;
}

export async function getMyTrips(): Promise<TripSummary[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const { db } = await import("@/lib/db");
    if (!db) return [];

    const sessions = await db.tripSession.findMany({
      where: { customerId: session.user.id },
      include: {
        specialist: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return sessions.map((s) => {
      const state = s.state as Record<string, unknown> | null;
      return {
        id: s.id,
        tripType: s.tripType,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        specialistName: s.specialist?.name ?? null,
        destinations: Array.isArray(state?.destinations) ? (state.destinations as string[]) : [],
        arrivalDate: typeof state?.arrivalDate === "string" ? state.arrivalDate : null,
        departureDate: typeof state?.departureDate === "string" ? state.departureDate : null,
      };
    });
  } catch {
    return [];
  }
}
