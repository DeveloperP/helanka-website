import { requireStaff } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getPaymentLinks } from "@/actions/payment-link-actions";
import { PaymentsClient } from "./payments-client";

export default async function AdminPaymentsPage() {
  const session = await requireStaff();
  if (session.user.role !== "ADMIN" && session.user.role !== "FINANCE") {
    redirect("/admin");
  }

  const links = await getPaymentLinks();

  return (
    <PaymentsClient
      links={links.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        paidAt: l.paidAt?.toISOString() ?? null,
      }))}
    />
  );
}
