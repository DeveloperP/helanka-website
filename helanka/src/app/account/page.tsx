import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getMyTrips } from "@/actions/account-actions";
import { AccountClient } from "./account-client";

export default async function AccountPage() {
  const session = await requireAuth();

  if (!db) {
    return <p className="p-8 text-slate-500">Database not connected.</p>;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      image: true,
      role: true,
      createdAt: true,
      lastLogin: true,
      passwordHash: true,
    },
  });

  if (!user) redirect("/login");

  const trips = await getMyTrips();

  return (
    <AccountClient
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() ?? null,
        hasPassword: !!user.passwordHash,
      }}
      trips={trips}
    />
  );
}
