import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentCustomer } from "@/lib/payment-links";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;

  if (db) {
    try {
      const link = await db.paymentLink.findUnique({
        where: { invoiceNumber: customerId },
      });

      if (link) {
        return NextResponse.json({
          id: link.invoiceNumber,
          name: link.customerName,
          amount: link.amount,
          currency: link.currency,
          description: link.description,
          cybersourceUrl: link.cybersourceUrl,
        });
      }
    } catch {
      // DB unavailable, fall through to hardcoded config
    }
  }

  const customer = getPaymentCustomer(customerId);
  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: customer.id,
    name: customer.name,
    amount: customer.amount,
    currency: customer.currency,
    description: customer.description,
    cybersourceUrl: customer.cybersourceUrl,
  });
}
