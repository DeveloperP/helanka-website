import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentCustomer } from "@/lib/payment-links";
import { sendEmail } from "@/lib/email";
import { buildPaymentConfirmationEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

interface PaymentInfo {
  name: string;
  id: string;
  amount: number;
  currency: string;
  description: string;
  notifyEmails: string[];
  dbLinkId?: string;
}

async function resolvePayment(customerId: string): Promise<PaymentInfo | null> {
  if (db) {
    try {
      const link = await db.paymentLink.findUnique({
        where: { invoiceNumber: customerId },
      });
      if (link) {
        return {
          name: link.customerName,
          id: link.invoiceNumber,
          amount: link.amount,
          currency: link.currency,
          description: link.description,
          notifyEmails: link.notifyEmails,
          dbLinkId: link.id,
        };
      }
    } catch {
      // DB unavailable, fall through
    }
  }

  const customer = getPaymentCustomer(customerId);
  if (!customer) return null;

  return {
    name: customer.name,
    id: customer.id,
    amount: customer.amount,
    currency: customer.currency,
    description: customer.description,
    notifyEmails: customer.notifyEmails,
  };
}

export async function POST(request: Request) {
  const { customerId, email } = await request.json();

  if (!customerId || typeof customerId !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const payment = await resolvePayment(customerId);
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (payment.dbLinkId && db) {
    try {
      await db.paymentLink.update({
        where: { id: payment.dbLinkId },
        data: { paidAt: new Date() },
      });
    } catch {
      // Non-critical
    }
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payment.currency,
  }).format(payment.amount);

  const html = buildPaymentConfirmationEmail(payment.name, payment.id, amount, payment.description);
  const recipients = [email, ...payment.notifyEmails];

  await Promise.allSettled(
    recipients.map((to) =>
      sendEmail({
        to,
        subject: `Payment Confirmation - ${payment.id} | Helanka Vacations`,
        html,
        from: "payments@helanka.co",
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
