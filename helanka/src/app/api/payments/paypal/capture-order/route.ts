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
      return NextResponse.json({ error: "Payment not completed", status: capture.status }, { status: 400 });
    }

    const unit = capture.purchase_units[0];
    const payment = unit.payments.captures[0];
    const bookingId = unit.reference_id;

    if (db) {
      await db.payment.create({
        data: {
          bookingId,
          amount: parseFloat(payment.amount.value),
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
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to capture PayPal payment" },
      { status: 500 },
    );
  }
}
