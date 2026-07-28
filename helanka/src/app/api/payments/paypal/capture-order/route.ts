import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { captureOrder } from "@/lib/paypal";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orderID } = body as { orderID?: string };

  if (!orderID) {
    return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
  }

  try {
    const capture = await captureOrder(orderID);

    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const unit = capture.purchase_units[0];
    const payment = unit.payments.captures[0];
    const bookingId = unit.reference_id;

    if (db) {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: {
          quotes: {
            where: { response: "ACCEPTED" },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });

      if (!booking || booking.userId !== session.user.id) {
        console.error("[PayPal] capture ownership mismatch:", { bookingId, userId: session.user.id });
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const expectedDeposit = booking.quotes[0]?.deposit;
      const capturedAmount = parseFloat(payment.amount.value);

      if (expectedDeposit && Math.abs(capturedAmount - expectedDeposit) > 0.01) {
        console.error("[PayPal] amount mismatch:", { expected: expectedDeposit, captured: capturedAmount });
        return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
      }

      await db.payment.create({
        data: {
          bookingId,
          amount: capturedAmount,
          currency: payment.amount.currency_code,
          method: "paypal",
          gatewayRef: capture.id,
          status: "SUCCESS",
          paidAt: new Date(),
        },
      });

      await db.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
    }

    return NextResponse.json({
      success: true,
      captureId: payment.id,
      amount: payment.amount.value,
      currency: payment.amount.currency_code,
    });
  } catch (e) {
    console.error("[PayPal] capture-order error:", e);
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 500 },
    );
  }
}
