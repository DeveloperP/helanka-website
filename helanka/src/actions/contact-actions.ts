"use server";

import { sendEmail } from "@/lib/email";

export interface ContactResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(formData: FormData): Promise<ContactResult> {
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

  const html = `
    <h2>New Trip Inquiry from ${name}</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Name</td><td style="padding:8px 12px;">${name}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Email</td><td style="padding:8px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Phone</td><td style="padding:8px 12px;">${phone}</td></tr>` : ""}
      ${travelers ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Travelers</td><td style="padding:8px 12px;">${travelers}</td></tr>` : ""}
      ${dates ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Preferred Dates</td><td style="padding:8px 12px;">${dates}</td></tr>` : ""}
      ${duration ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Duration</td><td style="padding:8px 12px;">${duration}</td></tr>` : ""}
      ${tripTypes.length ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#555;">Trip Type</td><td style="padding:8px 12px;">${tripTypes.join(", ")}</td></tr>` : ""}
    </table>
    ${message ? `<h3 style="margin-top:24px;">Message</h3><p style="white-space:pre-wrap;color:#333;">${message}</p>` : ""}
  `;

  const result = await sendEmail({
    to: "tours@helanka.co",
    subject: `New Trip Inquiry from ${name}`,
    html,
  });

  if (!result.success) {
    return { success: false, error: "Failed to send your inquiry. Please try emailing us directly at tours@helanka.co." };
  }

  return { success: true };
}
