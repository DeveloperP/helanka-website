import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
  from: fromOverride,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return { success: false, error: "Email not configured" };
  }

  const fromAddr = fromOverride ?? process.env.RESEND_FROM_EMAIL ?? "bookings@helanka.co";
  const { error } = await getResend().emails.send({
    from: `Helanka Vacations <${fromAddr}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
