import { requireAdminOrSpecialist } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminAccountClient } from "./admin-account-client";

export default async function AdminAccountPage() {
  const session = await requireAdminOrSpecialist();

  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      specialty: true,
      createdAt: true,
      lastLogin: true,
      passwordHash: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <AdminAccountClient
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() ?? null,
        hasPassword: !!user.passwordHash,
      }}
    />
  );
}
