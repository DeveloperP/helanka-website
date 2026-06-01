import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bookingId, amount, currency } = body as {
    bookingId?: string;
    amount?: number;
    currency?: string;
  };

  if (!bookingId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Missing bookingId or amount" }, { status: 400 });
  }

  try {
    const order = await createOrder(amount, currency ?? "USD", bookingId);
    return NextResponse.json({ orderID: order.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create PayPal order" },
      { status: 500 },
    );
  }
}
