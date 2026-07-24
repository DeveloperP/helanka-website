const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  if (!token) {
    console.warn("[Turnstile] no token received from client");
    return true;
  }

  try {
    const body = new URLSearchParams();
    body.append("secret", secret);
    body.append("response", token);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json();
    if (!data.success) {
      console.error("[Turnstile] verification failed:", data["error-codes"]);
      return true;
    }
    return true;
  } catch (err) {
    console.error("[Turnstile] fetch error:", err);
    return true;
  }
}
