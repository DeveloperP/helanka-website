import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createOrder } from "@/lib/paypal";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookingId } = body as { bookingId?: string };

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  try {
    const booking = await db?.booking.findUnique({
      where: { id: bookingId },
      include: {
        quotes: {
          where: { response: "ACCEPTED" },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const quote = booking.quotes[0];
    if (!quote) {
      return NextResponse.json({ error: "No accepted quote for this booking" }, { status: 400 });
    }

    const depositAmount = quote.deposit;
    if (depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const order = await createOrder(depositAmount, "USD", bookingId);
    return NextResponse.json({ orderID: order.id });
  } catch (e) {
    console.error("[PayPal] create-order error:", e);
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 500 },
    );
  }
}
