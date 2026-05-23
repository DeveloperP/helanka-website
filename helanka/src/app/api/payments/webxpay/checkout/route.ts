import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Placeholder WebXPay checkout route.
// In production, this will:
//   1. Create a WebXPay payment session via their API
//   2. Redirect the customer to the WebXPay hosted checkout page
//   3. WebXPay redirects back to /api/payments/webxpay/callback on completion
//
// Required env vars (not yet set):
//   WEBXPAY_MERCHANT_ID
//   WEBXPAY_SECRET_KEY
//   WEBXPAY_API_URL (sandbox or production)

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const bookingId = searchParams.get("bookingId");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency") ?? "USD";
  const returnUrl = searchParams.get("returnUrl");

  if (!bookingId || !amount || !returnUrl) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // TODO: Replace with actual WebXPay API call
  // const webxpaySession = await createWebXPaySession({
  //   merchantId: process.env.WEBXPAY_MERCHANT_ID,
  //   amount: parseFloat(amount),
  //   currency,
  //   orderId: bookingId,
  //   returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webxpay/callback`,
  //   cancelUrl: returnUrl,
  //   customerEmail: session.user.email,
  // });
  // return NextResponse.redirect(webxpaySession.checkoutUrl);

  // Placeholder: redirect back with a simulated pending status
  const url = new URL(returnUrl);
  url.searchParams.set("payment", "pending");
  url.searchParams.set("gateway", "webxpay");
  return NextResponse.redirect(url.toString());
}
