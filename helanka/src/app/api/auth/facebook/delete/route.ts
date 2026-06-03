import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const signedRequest = formData.get("signed_request") as string | null;

    if (!signedRequest) {
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    const appSecret = process.env.AUTH_FACEBOOK_SECRET;
    if (!appSecret) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const [encodedSig, payload] = signedRequest.split(".");
    const sig = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(payload)
      .digest();

    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );
    const facebookUserId = data.user_id as string;

    const { db } = await import("@/lib/db");
    if (db) {
      const account = await db.account.findFirst({
        where: { provider: "facebook", providerAccountId: facebookUserId },
        select: { userId: true },
      });

      if (account) {
        await db.user.delete({ where: { id: account.userId } });
      }
    }

    const confirmationCode = crypto.randomUUID();
    const origin = req.nextUrl.origin;

    return NextResponse.json({
      url: `${origin}/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
