"use server";

import { sendEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export interface ContactResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(formData: FormData): Promise<ContactResult> {
  const turnstileToken = formData.get("cf-turnstile-response") as string | null;
  const turnstileValid = await verifyTurnstile(turnstileToken);
  if (!turnstileValid) {
    return { success: false, error: "Verification failed. Please try again." };
  }

  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const travelers = formData.get("travelers") as string | null;
  const dates = formData.get("dates") as string | null;
  const duration = formData.get("duration") as string | null;
  const tripTypes = formData.getAll("tripType") as string[];
  const message = formData.get("message") as string | null;

  if (!name?.trim() || !email?.trim()) {
    return { success: false, error: "Name and email are required." };
  }

  const safeName = esc(name);
  const safeEmail = esc(email);
  const safePhone = phone ? esc(phone) : null;
  const safeTravelers = travelers ? esc(travelers) : null;
  const safeDates = dates ? esc(dates) : null;
  const safeDuration = duration ? esc(duration) : null;
  const safeTripTypes = tripTypes.map(esc);
  const safeMessage = message ? esc(message) : null;

  const html = `
    <h2>New Trip Inquiry from ${safeName}</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Name</td><td style="padding:8px 12px;">${safeName}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Email</td><td style="padding:8px 12px;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
      ${safePhone ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Phone</td><td style="padding:8px 12px;">${safePhone}</td></tr>` : ""}
      ${safeTravelers ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Travelers</td><td style="padding:8px 12px;">${safeTravelers}</td></tr>` : ""}
      ${safeDates ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Preferred Dates</td><td style="padding:8px 12px;">${safeDates}</td></tr>` : ""}
      ${safeDuration ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Duration</td><td style="padding:8px 12px;">${safeDuration}</td></tr>` : ""}
      ${safeTripTypes.length ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Trip Type</td><td style="padding:8px 12px;">${safeTripTypes.join(", ")}</td></tr>` : ""}
    </table>
    ${safeMessage ? `<h3 style="margin-top:24px;">Message</h3><p style="white-space:pre-wrap;color:#333;">${safeMessage}</p>` : ""}
  `;

  const result = await sendEmail({
    to: "tours@helanka.co",
    subject: `New Trip Inquiry from ${safeName}`,
    html,
  });

  if (!result.success) {
    return { success: false, error: "Failed to send your inquiry. Please try emailing us directly at tours@helanka.co." };
  }

  return { success: true };
}
