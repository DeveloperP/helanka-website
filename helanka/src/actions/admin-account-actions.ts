"use server";

import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function updateAdminProfile(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminOrSpecialist();
  if (!db) return { success: false, error: "Database not connected." };

  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { success: false, error: "Invalid name." };

  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  return { success: true };
}
