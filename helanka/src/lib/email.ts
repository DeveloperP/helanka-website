import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM_EMAIL ?? "bookings@helanka.co";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return { success: false, error: "Email not configured" };
  }

  const { error } = await resend.emails.send({
    from: `Helanka Vacations <${from}>`,
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
